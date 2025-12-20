import { Types } from "mongoose";

export interface ITypeSocketEvent {
  userId: string;
  chatRoomId: string;
  status: boolean;
}

export interface IMessagePayload {
  content: string;
  chatId: Types.ObjectId;
  participants: Types.ObjectId[];
}

export interface ISocketMessageEvent extends IMessagePayload {
  chatRoomId: string;
}
