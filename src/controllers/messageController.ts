import { Response } from "express";
import Message from "../models/message";
import Chat from "../models/chat";
import HttpStatus from "http-status";
import { sendApiResponse } from "../utils/apiError";
import { CustomRequest } from "../interface/requests";
import User from "../models/user";
import { IMessagePayload } from "../interface/socketEvent";

export const saveMessage = async (messageData: IMessagePayload) => {
  try {
    let chat = null;

    if (messageData.chatId) {
      chat = await Chat.findById(messageData.chatId);
    }

    const { participants } = messageData;

    const updatedParticipants = participants.map((participantId) =>
      atob(participantId.toString())
    );

    if (!chat) {
      chat = await Chat.create({
        isGroupChat: false,
        groupParticipants: updatedParticipants,
      });
    }

    const updatedMsgPayload = {
      ...messageData,
      chatId: chat ? chat._id : null,
      sender: updatedParticipants[0],
    };

    const message = await Message.create(updatedMsgPayload);
    await Chat.findByIdAndUpdate(chat._id, {
      latestMessage: message._id,
    });

    await message.populate([{ path: "sender", select: "name" }]);

    return message;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error("Error saving message: " + error.message);
    } else {
      throw new Error("Error saving message: " + String(error));
    }
  }
};

export const getParticipantsAllMessages = async (
  req: CustomRequest,
  res: Response
) => {
  try {
    const chat = await Chat.findOne({
      groupParticipants: {
        $all: [atob(req.params.senderId), atob(req.params.receiverId)],
      },
    }).select("_id");

    const userDetail = await User.findById(atob(req.params.receiverId)).select(
      "_id name"
    );

    if (!chat) {
      sendApiResponse(res, HttpStatus.OK, {
        data: { messages: [], user: userDetail },
      });
      return;
    }
    const messagesList = await Message.find({ chatId: chat._id })
      .populate("sender", "name")
      .select("-chatId");
    sendApiResponse(res, HttpStatus.OK, {
      data: { messages: messagesList, user: userDetail, chatId: chat._id },
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
