import { Types } from "mongoose";
import { Request, Response } from "express";
import Message from "../models/message";
import Chat from "../models/chat";
import HttpStatus from "http-status";
import { sendApiResponse } from "../utils/apiError";
import { CustomRequest } from "../interface/requests";
import { responseMessage } from "../constants/responseMessage";

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

export const getAllMessages = async (req: Request, res: Response) => {
  try {
    // const userId =
    //   req.params.id === "currentUser" ? req?.userId : req.params.id;
    // console.log(userId, "userId", req.params.chatId);
    // if (!userId) {
    //   sendApiResponse(res, HttpStatus.UNAUTHORIZED, {
    //     message: responseMessage.UNAUTHORIZED,
    //   });
    //   return;
    // }
    console.log("userId", req.params.chatId);
    const messagesList = await Message.find({ chatId: req.params.chatId })
      .populate("sender", "name")
      .populate("chatId", "chatName")
      .sort({ createdAt: -1 });
    sendApiResponse(res, HttpStatus.OK, { data: messagesList });
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
