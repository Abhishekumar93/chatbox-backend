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
import {
  IMessagePayload,
  ISocketMessageEvent,
  ITypeSocketEvent,
} from "./src/interface/socketEvent";

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
    if (!userId) return;
    onlineUsers.set(socket.id, userId);
    await User.findByIdAndUpdate(userId, { isOnline: true });
  });

  socket.on("join_room", (data: { chatRoomId: string; userId: string }) => {
    socket.join(data.chatRoomId);
  });

  socket.on("new_message", async (msg: ISocketMessageEvent) => {
    try {
      const { chatId, chatRoomId, content, participants } = msg;
      const msgPayload = {
        content,
        chatId,
        participants,
      };
      const savedMessage = await saveMessage(msgPayload);
      io.in(chatRoomId).emit(
        "chat message",
        savedMessage ?? "Something went wrong"
      );
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error handling new message: ${error.message}`);
      } else {
        console.error(`Error handling new message: ${String(error)}`);
      }
      return;
    }
  });
  socket.on("typing", (data: ITypeSocketEvent) => {
    const { chatRoomId, status, userId } = data;
    socket.to(chatRoomId).emit("typing", { status, userId });
  });
  socket.on("stop_typing", (data: ITypeSocketEvent) => {
    const { chatRoomId, status, userId } = data;
    socket.to(chatRoomId).emit("stop_typing", { status, userId });
  });
  socket.on("disconnect", async (reason) => {
    const userId = onlineUsers.get(socket.id);
    if (userId) {
      await User.findByIdAndUpdate(userId, { isOnline: false });
      socket.broadcast.emit("user_offline", { userId });
      onlineUsers.delete(socket.id);
    }
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
