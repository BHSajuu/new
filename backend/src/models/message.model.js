import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Stores the text exactly as typed by the user
    commonText: {
      type: String,
    },
    // Stores the message text in the sender's preferred language
    senderText:{
      type:String,
    },
    // Stores the message text in the receiver's preferred language
    receiverText:{
      type:String,
    },
    image: {
      type: String,
    },
    audio: {
      type: String,
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;