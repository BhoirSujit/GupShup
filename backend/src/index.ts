import express from "express";
import { config } from "dotenv";
config();
import valide from "./utils/valide.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./libs/db.js";
import { isHttpError } from "http-errors";
import { Response, Request, NextFunction } from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import {app, server} from "./libs/socket.js"
import path from "path";


const PORT = valide.PORT;
const __dirname = path.resolve();

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

if (valide.NODE_ENV == "development") {
  app.use(express.static(path.join(__dirname, "../../frontend/dist")))

  app.get("*", ((req, res) => {
    res.sendFile(path.join(__dirname, "../../frontend", "dist", "index.html"));
  }))
}

server.listen(PORT, () => {
  connectDB();
  console.log("Server is running on port ", PORT);
});
