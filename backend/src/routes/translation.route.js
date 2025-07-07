import express from "express";
import { 
  translateMessage, 
  getUserTranslationStats, 
  updateTranslationSettings 
} from "../controllers/translation.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/translate", protectRoute, translateMessage);
router.get("/stats", protectRoute, getUserTranslationStats);
router.put("/settings", protectRoute, updateTranslationSettings);

export default router;