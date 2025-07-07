import toast from "react-hot-toast";
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useTranslationStore = create((set, get) => ({
  // Translation settings
  translationEnabled: false,
  preferredLanguage: "English",
  dailyTranslationCount: 0,
  remainingTranslations: 15,
  isTranslating: false,

  // Available languages for translation
  availableLanguages: [
    "English", "Spanish", "French", "German", "Italian", "Portuguese", 
    "Russian", "Chinese", "Japanese", "Korean", "Arabic", "Hindi", 
    "Bengali", "Tamil", "Telugu", "Marathi", "Gujarati", "Urdu"
  ],

  // Fetch user's translation stats and settings
  getTranslationStats: async () => {
    try {
      const res = await axiosInstance.get("/translation/stats");
      set({
        dailyTranslationCount: res.data.dailyTranslationCount,
        remainingTranslations: res.data.remainingTranslations,
        translationEnabled: res.data.translationEnabled,
        preferredLanguage: res.data.preferredLanguage
      });
    } catch (error) {
      console.error("Failed to fetch translation stats:", error);
    }
  },

  // Update translation settings
  updateTranslationSettings: async (settings) => {
    try {
      const res = await axiosInstance.put("/translation/settings", settings);
      set({
        translationEnabled: settings.translationEnabled !== undefined ? settings.translationEnabled : get().translationEnabled,
        preferredLanguage: settings.preferredLanguage || get().preferredLanguage
      });
      toast.success("Translation settings updated successfully");
    } catch (error) {
      toast.error("Failed to update translation settings");
      console.error("Translation settings update error:", error);
    }
  },

  // Translate a message
  translateMessage: async (text, targetLanguage) => {
    const { remainingTranslations } = get();
    
    // Check if user has remaining translations
    if (remainingTranslations <= 0) {
      toast.error("Daily translation limit exceeded. You can translate up to 15 messages per day.");
      return null;
    }

    set({ isTranslating: true });
    
    try {
      const res = await axiosInstance.post("/translation/translate", {
        text,
        targetLanguage
      });

      // Update remaining translations count
      set({
        dailyTranslationCount: get().dailyTranslationCount + 1,
        remainingTranslations: res.data.remainingTranslations
      });

      return res.data.translatedText;
    } catch (error) {
      if (error.response?.data?.limitExceeded) {
        toast.error(error.response?.data?.message);
      } else {
        toast.error(error.response?.data?.message );
      }
      console.error("Translation error:", error);
      return null;
    } finally {
      set({ isTranslating: false });
    }
  },

  // Toggle translation feature
  toggleTranslation: async () => {
    const newState = !get().translationEnabled;
    await get().updateTranslationSettings({ translationEnabled: newState });
  },

  // Set preferred language
  setPreferredLanguage: async (language) => {
    await get().updateTranslationSettings({ preferredLanguage: language });
  }
}));