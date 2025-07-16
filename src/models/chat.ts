import { model, Model, Schema, Types } from "mongoose";

interface IChat extends Document {
  groupChatName?: string;
  isGroupChat: boolean;
  groupParticipants: Types.ObjectId[];
  groupAdmin?: Types.ObjectId;
  latestMessage: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const chatSchema = new Schema<IChat>(
  {
    groupChatName: {
      type: String,
      trim: true,
      required: function (this: IChat) {
        return this.isGroupChat;
      },
    },
    isGroupChat: { type: Boolean, default: false },
    groupParticipants: [
      { type: Schema.Types.ObjectId, ref: "User", required: true },
    ],
    groupAdmin: { type: Schema.Types.ObjectId, ref: "User" },
    latestMessage: { type: Schema.Types.ObjectId, ref: "Message" },
  },
  { timestamps: true }
);

const Chat: Model<IChat> = model<IChat>("Chat", chatSchema);
export default Chat;
