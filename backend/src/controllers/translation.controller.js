import { GoogleGenerativeAI } from "@google/generative-ai";
import User from "../models/user.model.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const translateMessage = async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;
    const userId = req.user._id; 

    if (!text || !targetLanguage) {
      return res.status(400).json({ message: "Text and target language are required" });
    }

    // Check user's daily translation limit
    const user = await User.findById(userId);
    const today = new Date().toDateString();
    
    // Reset count if it's a new day
    if (user.lastTranslationDate !== today) {
      user.dailyTranslationCount = 0;
      user.lastTranslationDate = today;
    }

    // Check if user has exceeded daily limit (15 translations per day)
    if (user.dailyTranslationCount >= 15) {
      return res.status(429).json({ 
        message: "Daily translation limit exceeded. You can translate up to 15 messages per day.",
        limitExceeded: true 
      });
    }

    // Initialize Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" });

    // Create translation prompt
    const prompt = `Translate the following text to ${targetLanguage}. Only return the translated text, nothing else: "${text}"`;

    // Generate translation
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const translatedText = response.text().trim();

    // Increment user's daily translation count
    user.dailyTranslationCount += 1;
    await user.save();

    res.status(200).json({
      originalText: text,
      translatedText,
      targetLanguage,
      remainingTranslations: 15 - user.dailyTranslationCount
    });

  } catch (error) {
    console.error("Translation error from backend:", error);
    res.status(500).json({ message: "Translation failed. Please try again." });
  }
};

export const getUserTranslationStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    
    const today = new Date().toDateString();
    
    // Reset count if it's a new day
    if (user.lastTranslationDate !== today) {
      user.dailyTranslationCount = 0;
      user.lastTranslationDate = today;
      await user.save();
    }

    res.status(200).json({
      dailyTranslationCount: user.dailyTranslationCount,
      remainingTranslations: 15 - user.dailyTranslationCount,
      translationEnabled: user.translationEnabled || false,
      preferredLanguage: user.preferredLanguage || 'English'
    });

  } catch (error) {
    console.error("Error fetching translation stats:", error);
    res.status(500).json({ message: "Failed to fetch translation stats" });
  }
};

export const updateTranslationSettings = async (req, res) => {
  try {
    const userId = req.user._id;
    const { translationEnabled, preferredLanguage } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        translationEnabled: translationEnabled !== undefined ? translationEnabled : undefined,
        preferredLanguage: preferredLanguage || undefined
      },
      { new: true }
    ).select('-password');

    res.status(200).json({
      message: "Translation settings updated successfully",
      user: updatedUser
    });

  } catch (error) {
    console.error("Error updating translation settings:", error);
    res.status(500).json({ message: "Failed to update translation settings" });
  }
};