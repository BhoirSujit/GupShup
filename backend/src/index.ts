import express from "express";
import { config } from "dotenv";
config();
import valide from "./utils/valide";
import authRoutes from "./routes/auth.route";
import messageRoutes from "./routes/message.route";
import { connectDB } from "./libs/db";
import { isHttpError } from "http-errors";
import { Response, Request, NextFunction } from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import {app, server} from "./libs/socket"


const PORT = valide.PORT;

//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

//handle http errors
app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
  console.log(error);
  let status = 500;
  let message = "An unknown error occur";

  if (isHttpError(error)) {
    status = error.status;
    message = error.message;
  }

  res.status(status).json({
    error: message,
  });
});

server.listen(PORT, () => {
  connectDB();
  console.log("Server is running on port ", PORT);
});
