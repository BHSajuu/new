import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    profilePic: {
      type: String,
      default: "",
    },
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
    // Translation-related fields
    translationEnabled: {
      type: Boolean,
      default: false,
    },
    preferredLanguage: {
      type: String,
      default: "English",
    },
    dailyTranslationCount: {
      type: Number,
      default: 0,
    },
    lastTranslationDate: {
      type: String,
      default: "",
    },
  },
  { timestamps: true } // for created at and updated at
);

const User = mongoose.model("User", userSchema);

export default User;