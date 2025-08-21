import express from "express";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./src/config/db";
import { authRoutes, userRoutes, messageRoutes } from "./src/routes";
import compression from "compression";
import passport from "passport";
import { initializePassport } from "./src/config/passport";
import { saveMessage } from "./src/controllers/messageController";
import User from "./src/models/user";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // your frontend domain
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// Middleware
dotenv.config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:3000", // your frontend domain
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(compression());
initializePassport();
app.use(passport.initialize());

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

const onlineUsers = new Map();

// Websockets connection
io.on("connection", (socket) => {
  socket.on("register", async (userId) => {
    onlineUsers.set(socket.id, userId);
    await User.findByIdAndUpdate(userId, { isOnline: true });
  });

  socket.on("new_message", async (msg) => {
    console.log("message", msg);
    try {
      const savedMessage = await saveMessage(msg);
      socket
        .to(msg.chatId)
        .emit("chat message", savedMessage ?? "Something went wrong");
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error handling new message: ${error.message}`);
      } else {
        console.error(`Error handling new message: ${String(error)}`);
      }
      return;
    }
  });
  socket.on("typing", (data: { userId: string; status: boolean }) => {
    console.log("User is typing in chat:", data);

    socket.to(data.userId).emit("typing", data.status);
  });
  socket.on("stop_typing", (data: { userId: string; status: boolean }) => {
    socket.to(data.userId).emit("stop_typing", data.status);
  });
  socket.on("disconnect", async (reason) => {
    const userId = onlineUsers.get(socket.id);
    if (userId) {
      await User.findByIdAndUpdate(userId, { isOnline: false });
      socket.broadcast.emit("user_offline", { userId });
      onlineUsers.delete(socket.id);
    }
    console.log("Disconnected:", reason);
  });
});

// Start Server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  process.on("uncaughtException", (error) => {
    console.error(`Error: ${error.message}`);
  });
});
