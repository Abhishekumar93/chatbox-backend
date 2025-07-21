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

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Middleware
dotenv.config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:3000", // your frontend domain
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

// Websockets connection
io.on("connection", (socket) => {
  socket.on("new_message", async (msg) => {
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
  socket.on("typing", (data) => {
    socket.to(data.chatId).emit("typing", "typing...");
  });
  socket.on("stop_typing", (data) => {
    socket.to(data.chatId).emit("stop_typing", "typing stopped");
  });
  socket.on("disconnect", () => {
    console.log(`user disconnected ${socket.id}`);
  });
});

// Start Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  process.on("uncaughtException", (error) => {
    console.error(`Error: ${error.message}`);
  });
});
