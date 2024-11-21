import jwt from "jsonwebtoken"
import valide from "./valide"
import { Response } from "express";


export const generateToken = (userId : string, res: Response) => {
    const token = jwt.sign({userId}, valide.JWT_SECRET, {expiresIn: "7d"});
    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: valide.NODE_ENV !== "dev",
    })

    return token;
}