import { RequestHandler } from "express";
import userModel from "../models/user.model";
import messageModel from "../models/message.model";
import cloudnary from "../libs/cloudnary";
import { getReceiverSocketId, io } from "../libs/socket";

export const getUserForSidebar: RequestHandler = async (req, res, next) => {
  try {
    const loggedInUserId = req.user?._id;
    const filterUsers = await userModel
      .find({ _id: { $ne: loggedInUserId } })
      .select("-password");

    res.status(200).json(filterUsers);
  } catch (error) {
    next(error);
  }
};

export const getMessages: RequestHandler = async (req, res, next) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user?._id;

    const message = await messageModel.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(message);
  } catch (error) {
    next(error);
  }
};

export const sendMessage: RequestHandler = async (req, res, next) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user?._id;

    let imageUrl;

    if (image) {
      const uploadResponse = await cloudnary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new messageModel({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

 
    const receiverSocketId = getReceiverSocketId(receiverId);
    if(receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    next(error);
  }
};
