import jwt, { decode, JwtPayload } from "jsonwebtoken";
import userModel from "../models/user.model.js";
import { RequestHandler } from "express";
import createHttpError from "http-errors";
import valide from "../utils/valide.js";

declare module "express-serve-static-core" {
    interface Request {
      user?: Record<string, any>; // Adjust the type to match your user model
    }
  }

export const protectRoute: RequestHandler = async (req,res, next) => {
    try {
        const token = req.cookies.jwt;

        if (!token) throw createHttpError(401, "Token not provided");

        const decoded = jwt.verify(token, valide.JWT_SECRET) as JwtPayload

        if (!decoded) throw createHttpError(401, "invalid token")

        const user = await userModel.findById(decoded.userId).select("-password");

        if (!user) throw createHttpError(404, "user not found");

        req.user = user;

        next();

    } catch (error) {
        next(error);
    }
}