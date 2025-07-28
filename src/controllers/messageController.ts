import { Types } from "mongoose";
import { Response } from "express";
import Message from "../models/message";
import Chat from "../models/chat";
import HttpStatus from "http-status";
import { sendApiResponse } from "../utils/apiError";
import { CustomRequest } from "../interface/requests";
import User from "../models/user";

export const saveMessage = async (messageData: {
  content: string;
  chatId: Types.ObjectId;
  sender: Types.ObjectId;
}) => {
  try {
    const decodedMessageData = {
      ...messageData,
      chatId: atob(messageData.chatId.toString()),
    };
    console.log("Decoded Message Data:", decodedMessageData);

    const message = await Message.create(decodedMessageData);
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

export const getAllMessages = async (req: CustomRequest, res: Response) => {
  try {
    const userDetail = await User.findById(atob(req.params.chatId)).select(
      "name"
    );
    const messagesList = await Message.find({ chatId: atob(req.params.chatId) })
      .populate("sender", "name")
      .populate("chatId", "chatName")
      .sort({ createdAt: -1 });
    sendApiResponse(res, HttpStatus.OK, {
      data: { message: messagesList, user: userDetail },
    });
  } catch (error: any) {
    let errorMessage = "";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else {
      errorMessage = String(error);
    }
    sendApiResponse(res, HttpStatus.BAD_REQUEST, { message: errorMessage });
  }
};
