import express from "express";
import Account from "../models/Account.js";
import Transaction from "../models/Transaction.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// @desc    Get all accounts for the logged-in user
// @route   GET /api/accounts
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const accounts = await Account.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get a single account by ID
// @route   GET /api/accounts/:id
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    const account = await Account.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    res.json(account);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a new account
// @route   POST /api/accounts
// @access  Private
router.post("/", protect, async (req, res) => {
  const { name, type, balance, color } = req.body;

  try {
    const account = new Account({
      name,
      type,
      balance: balance || 0,
      color: color || "#10B981",
      createdBy: req.user._id,
    });

    const createdAccount = await account.save();
    res.status(201).json(createdAccount);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Update an account
// @route   PUT /api/accounts/:id
// @access  Private
router.put("/:id", protect, async (req, res) => {
  const { name, type, balance, color } = req.body;

  try {
    const account = await Account.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!account) {
      return res.status(404).json({ message: "Account not found or unauthorized" });
    }

    account.name = name !== undefined ? name : account.name;
    account.type = type !== undefined ? type : account.type;
    account.balance = balance !== undefined ? balance : account.balance;
    account.color = color !== undefined ? color : account.color;

    const updatedAccount = await account.save();
    res.json(updatedAccount);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Delete an account (and clean up associated transactions)
// @route   DELETE /api/accounts/:id
// @access  Private
router.delete("/:id", protect, async (req, res) => {
  try {
    const account = await Account.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!account) {
      return res.status(404).json({ message: "Account not found or unauthorized" });
    }

    // Delete the account
    await Account.deleteOne({ _id: req.params.id });

    // Also delete any transactions associated with this account (as source or destination)
    await Transaction.deleteMany({
      createdBy: req.user._id,
      $or: [
        { account: req.params.id },
        { destinationAccount: req.params.id }
      ]
    });

    res.json({ message: "Account and associated transactions removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
