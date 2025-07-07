import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import User from "../models//user.model.js";
import Message from "../models/message.model.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to translate text using Gemini API
const translateText = async (text, targetLanguage) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" });
    const prompt = `Translate the following text to ${targetLanguage}. Only return the translated text, nothing else: "${text}"`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Translation error:", error);
    return null;
  }
};

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
    const { text, image, audio } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    // Get sender and receiver user data to check translation preferences
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

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

    // Initialize message data
    let messageData = {
      senderId,
      receiverId,
      commonText: text, // Store original typed text
      image: imageUrl,
      audio: audioUrl,
    };

    // Handle sender translation if enabled
    if (text && sender.translationEnabled && sender.preferredLanguage !== "English") {
      // Check if sender's daily translation limit is exceeded
      const today = new Date().toDateString();
      if (sender.lastTranslationDate !== today) {
        sender.dailyTranslationCount = 0;
        sender.lastTranslationDate = today;
      }

      if (sender.dailyTranslationCount < 15) {
        const translatedToSenderLang = await translateText(text, sender.preferredLanguage);
        if (translatedToSenderLang) {
          messageData.senderText = translatedToSenderLang;
          sender.dailyTranslationCount += 1;
          await sender.save();
        }
      }
    }

    // Handle receiver translation if enabled
    if (text && receiver.translationEnabled && receiver.preferredLanguage !== "English") {
      // Check if receiver's daily translation limit is exceeded
      const today = new Date().toDateString();
      if (receiver.lastTranslationDate !== today) {
        receiver.dailyTranslationCount = 0;
        receiver.lastTranslationDate = today;
      }

      if (receiver.dailyTranslationCount < 15) {
        const translatedToReceiverLang = await translateText(text, receiver.preferredLanguage);
        if (translatedToReceiverLang) {
          messageData.receiverText = translatedToReceiverLang;
          receiver.dailyTranslationCount += 1;
          await receiver.save();
        }
      }
    }

    const newMessage = new Message(messageData);
    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(200).json(newMessage);
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// New function to update receiverText for existing messages
export const updateReceiverText = async (req, res) => {
  try {
    const { messageId, receiverId } = req.body;
    const userId = req.user._id;

    // Verify that the current user is the receiver
    if (userId.toString() !== receiverId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Check if receiverText already exists
    if (message.receiverText) {
      return res.status(200).json({ receiverText: message.receiverText });
    }

    const receiver = await User.findById(receiverId);
    
    // Check translation settings and limits
    if (!receiver.translationEnabled) {
      return res.status(400).json({ message: "Translation not enabled" });
    }

    const today = new Date().toDateString();
    if (receiver.lastTranslationDate !== today) {
      receiver.dailyTranslationCount = 0;
      receiver.lastTranslationDate = today;
    }

    if (receiver.dailyTranslationCount >= 15) {
      return res.status(429).json({ message: "Daily translation limit exceeded" });
    }

    // Translate the message
    const translatedText = await translateText(message.commonText, receiver.preferredLanguage);
    if (!translatedText) {
      return res.status(500).json({ message: "Translation failed" });
    }

    // Update the message with receiverText
    message.receiverText = translatedText;
    await message.save();

    // Update receiver's translation count
    receiver.dailyTranslationCount += 1;
    await receiver.save();

    res.status(200).json({ receiverText: translatedText });
  } catch (error) {
    console.error("Update receiver text error:", error);
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

    // Update commonText with the new text
    const editedmsg = await Message.findByIdAndUpdate(
      id, 
      { 
        commonText: text,
        // Clear translated texts when editing - they'll be regenerated if needed
        senderText: "",
        receiverText: ""
      }, 
      { new: true }
    );

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