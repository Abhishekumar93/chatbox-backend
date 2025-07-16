import { model, Model, Schema } from "mongoose";

interface IMessage extends Document {
  content: string;
  chatId: Schema.Types.ObjectId;
  sender: Schema.Types.ObjectId;
  readBy: Schema.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    content: { type: String, trim: true, required: true },
    chatId: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    readBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const Message: Model<IMessage> = model<IMessage>("Message", messageSchema);
export default Message;
