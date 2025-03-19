import express, { Request, Response } from "express";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./src/config/db";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Middleware
dotenv.config();
app.use(express.json());
app.use(cors());
app.use(cookieParser());

connectDB();

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

// Routes
// app.get("/chat-message", async (req: Request, res: Response) => {
//   res.send("Hello World! Welcome to TypeScript");
// });

// Start Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port 3000`);
  process.on("uncaughtException", (error) => {
    console.error(`Error: ${error.message}`);
  });
});
