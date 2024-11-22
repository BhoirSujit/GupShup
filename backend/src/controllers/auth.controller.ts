import { RequestHandler } from "express";
import createHttpError from "http-errors";
import userModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/token.js";
import cloudnary from "../libs/cloudnary.js";

export const signup: RequestHandler = async (req, res, next) => {
  const { fullName, email, password } = req.body;

  try {
    if (!fullName || !email || !password)
      throw createHttpError(400, "request must content all creadentials");

    if (password.length < 6)
      throw createHttpError(400, "password must be atleast 6 character long");

    //if user exists
    let user = undefined;
    try {
      user = await userModel.findOne({ email });
    } catch (error) {
      console.log("mongo findone error: ", error)
    }
    if (user) throw createHttpError(409, "email allready exists");

    //hash the password
    const salt = await bcrypt.genSalt(10);
    const hashpass = await bcrypt.hash(password, salt);

    //create new user
    const newUser = new userModel({
      fullName,
      email,
      password: hashpass,
    });

    if (!newUser) throw createHttpError(400, "Envalid user data");

    //generate token
    generateToken(newUser._id.toString(), res);
    await newUser.save();

    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
};

export const login: RequestHandler = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password)
      throw createHttpError(400, "request must content all creadentials");

    if (password.length < 6)
      throw createHttpError(400, "password must be atleast 6 character long");

    //if user exists
    const user = await userModel.findOne({ email });
    if (!user) throw createHttpError(404, "user not exist");

    //check password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect)
      throw createHttpError(401, "Password is not correct");

    //generate token
    generateToken(user._id.toString(), res);

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const logout: RequestHandler = (req, res, next) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

export const updateProfile: RequestHandler = async (req, res, next) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user?._id;

    if (!profilePic) throw createHttpError(401, "profile pic not provided");

    const uploadResponse = await cloudnary.uploader.upload(profilePic);

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};

export const checkAuth: RequestHandler = (req, res, next) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    next(error);
  }
};
