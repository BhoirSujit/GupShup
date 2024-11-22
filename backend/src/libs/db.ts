import mongoose from "mongoose";
import valide from "../utils/valide.js";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(valide.MONGODB_URI);
    console.log("MongoDB connected: ", conn.connection.host);
  } catch (error) {
    console.log("MongoDB connection error: ", error);
  }
};
