import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI ?? "");
    console.log("DB Connected Successfully!");
  } catch (error) {
    console.error(`DB Connection Failed: ${error}`);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log("🔌 DB Disconnected Successfully!");
  } catch (error) {
    console.error("❌ Disconnection Failed:", error);
  }
};
