import express from "express";
import { config } from "dotenv";
config();
import valide from "./utils/valide";
import authRoutes from "./routes/auth.route";
import { connectDB } from "./libs/db";
import { isHttpError } from "http-errors";
import { Response, Request, NextFunction } from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";

const app = express();

const PORT = valide.PORT;

//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);

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

app.listen(PORT, () => {
  connectDB();
  console.log("Server is running on port ", PORT);
});
