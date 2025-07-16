import mongoose from "mongoose";
import { connectDB, disconnectDB } from "../config/db";
import Chat from "../models/chat";
import Message from "../models/message";

const createCollections = async () => {
  await connectDB();
  try {
    console.log("✅ Connected to MongoDB");

    // Create each collection explicitly
    await Chat.createCollection();
    console.log("✅ Chat collection created");

    await Message.createCollection();
    console.log("✅ Message collection created");
  } catch (err) {
    console.error("❌ Failed to create collections:", err);
  } finally {
    await disconnectDB();
    console.log("🔌 Disconnected from MongoDB");
  }
};

createCollections();
