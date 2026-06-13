import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Account from "../models/Account.js";
import Category from "../models/Category.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Generate JWT Helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
    });

    if (user) {
      // Seed default accounts
      const defaultAccounts = [
        { name: "Cash", type: "Cash", balance: 0, color: "#10B981", createdBy: user._id },
        { name: "Bank", type: "Bank", balance: 0, color: "#3B82F6", createdBy: user._id },
        { name: "E-Wallet", type: "E-Wallet", balance: 0, color: "#F59E0B", createdBy: user._id },
      ];
      await Account.insertMany(defaultAccounts);

      // Seed default categories
      const defaultCategories = [
        // Income Categories
        { name: "Salary", type: "Income", icon: "briefcase", color: "#10B981", createdBy: user._id },
        { name: "Investment", type: "Income", icon: "trending-up", color: "#059669", createdBy: user._id },
        { name: "Gift", type: "Income", icon: "gift", color: "#8B5CF6", createdBy: user._id },
        { name: "Others (Income)", type: "Income", icon: "plus-circle", color: "#6B7280", createdBy: user._id },
        // Expense Categories
        { name: "Food & Drinks", type: "Expense", icon: "coffee", color: "#EF4444", createdBy: user._id },
        { name: "Transportation", type: "Expense", icon: "truck", color: "#F59E0B", createdBy: user._id },
        { name: "Shopping", type: "Expense", icon: "shopping-bag", color: "#EC4899", createdBy: user._id },
        { name: "Entertainment", type: "Expense", icon: "film", color: "#8B5CF6", createdBy: user._id },
        { name: "Bills & Utilities", type: "Expense", icon: "credit-card", color: "#6366F1", createdBy: user._id },
        { name: "Groceries", type: "Expense", icon: "shopping-cart", color: "#10B981", createdBy: user._id },
        { name: "Others (Expense)", type: "Expense", icon: "minus-circle", color: "#6B7280", createdBy: user._id },
      ];
      await Category.insertMany(defaultCategories);

      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        currency: user.currency,
        darkMode: user.darkMode,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        currency: user.currency,
        darkMode: user.darkMode,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get user profile
// @route   GET /api/users/me
// @access  Private
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update user profile settings (currency or dark mode)
// @route   PUT /api/users/profile
// @access  Private
router.put("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.username = req.body.username || user.username;
      user.email = req.body.email || user.email;
      if (req.body.currency) {
        user.currency = req.body.currency;
      }
      if (req.body.darkMode !== undefined) {
        user.darkMode = req.body.darkMode;
      }

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        currency: updatedUser.currency,
        darkMode: updatedUser.darkMode,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
