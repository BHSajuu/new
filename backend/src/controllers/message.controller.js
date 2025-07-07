import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import User from "../models//user.model.js";
import Message from "../models/message.model.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id; // req mai user id mill rha hai q ki huma ne protectRoute middleware mai req.user ko set kiya hai
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, sText, image, audio } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    let audioUrl;
    if (audio) {
      const resp = await cloudinary.uploader.upload(audio, { resource_type: "video" });
      audioUrl = resp.secure_url;
    }
    


    const newMessage = new Message({
      senderId,
      receiverId,
      commonText: text,
      senderText: sText,
      image: imageUrl,
      audio: audioUrl, 
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(200).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const deleteMessageById = async (req, res) => {
  try {
    const { id } = req.params;
    const msg = await Message.findByIdAndDelete(id);
    if (!msg) {
      return res.status(404).json({ message: "Message Not Found" });
    }
    res.status(200).json({ message: "Message Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });

  }
};

export const editMessageById = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    const editedmsg = await Message.findByIdAndUpdate(id, { text }, { new: true });

    res.status(200).json({ message: "Message Edited Successfully", editedmsg });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteAllMessageById = async (req, res) => {
  try {
    const {receiverId, senderId} = req.body;
    const msg = await Message.deleteMany({
      $or:[
        {senderId: senderId, receiverId: receiverId},
        {senderId: receiverId, receiverId: senderId}
      ]
    });
    res.status(200).json({ deletedCount: msg.deletedCount });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    
  }
}
