import { Types } from "mongoose";
import { Request } from "express";
import Message from "../models/message";
import Chat from "../models/chat";
import { CustomRequest } from "../interface/requests";

export const saveMessage = async (messageData: {
  content: string;
  chatId: Types.ObjectId;
  sender: Types.ObjectId;
}) => {
  try {
    const message = await Message.create(messageData);
    message.populate("sender", "name");
    message.populate("chatId", "chatName");

    await Chat.findByIdAndUpdate(message.chatId, {
      latestMessage: message._id,
    });

    return message;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error("Error saving message: " + error.message);
    } else {
      throw new Error("Error saving message: " + String(error));
    }
  }
};

export const getAllMessages = async (req: Request) => {
  try {
    return await Message.find({ chatId: req.params.chatId })
      .populate("sender", "name")
      .populate("chatId", "chatName")
      .sort({ createdAt: -1 });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error("Error fetching messages: " + error.message);
    } else {
      throw new Error("Error fetching messages: " + String(error));
    }
  }
};
