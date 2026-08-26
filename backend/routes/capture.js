import express from "express";
import { protect } from "../middleware/auth.js";
import { interpretNaturalLanguageCapture } from "../services/captureService.js";

const router = express.Router();

// @desc    Interpret natural language financial sentence into structured transaction draft
// @route   POST /api/capture/interpret
// @access  Private
router.post("/interpret", protect, async (req, res) => {
  const { text } = req.body;

  if (!text || typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ message: "Text input is required" });
  }

  try {
    const result = await interpretNaturalLanguageCapture({
      userId: req.user._id,
      text: text.trim(),
    });

    res.json(result);
  } catch (error) {
    console.error("Capture interpretation error:", error);
    res.status(500).json({
      message: error.message || "Failed to interpret transaction. Please try manual entry or rephrase.",
    });
  }
});

export default router;
