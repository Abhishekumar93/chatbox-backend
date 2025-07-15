// Migration for model: user
// Created at: 2025-07-15T18:17:12.542Z

import mongoose from "mongoose";
import { connectDB, disconnectDB } from "../config/db";

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model("User", userSchema, "users");

async function migrate() {
  await connectDB();

  try {
    const users = await User.find({ username: { $exists: true } });

    for (const user of users) {
      user.set("isOnline", false);
      await user.save();
    }

    console.log(`✅ Migrated ${users.length} users`);
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await disconnectDB();
  }
}

migrate();
