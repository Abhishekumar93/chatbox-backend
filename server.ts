import express from "express";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./src/config/db";
import { authRoutes, userRoutes } from "./src/routes";
import compression from "compression";
import passport from "passport";
import { initializePassport } from "./src/config/passport";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Middleware
dotenv.config();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000", // your frontend domain
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
initializePassport();
app.use(passport.initialize());

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Websockets connection
io.on("connection", (socket) => {
  console.log(`user connected ${socket.id}`);
  socket.on("chat message", (msg) => {
    io.emit("chat message", msg);
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
