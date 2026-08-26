import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactions,
} from "../services/transactionService.js";
import Transaction from "../models/Transaction.js";

const router = express.Router();

// @desc    Get all transactions with search, filters, and pagination
// @route   GET /api/transactions
// @access  Private
router.get("/", protect, async (req, res) => {
  const { startDate, endDate, category, type, account, search, page = 1, limit = 50 } = req.query;

  try {
    const result = await getTransactions({
      userId: req.user._id,
      startDate,
      endDate,
      category,
      type,
      account,
      search,
      page,
      limit,
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get a single transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    })
      .populate("category", "name icon color type")
      .populate("account", "name type color")
      .populate("destinationAccount", "name type color");

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a new transaction (Authoritative engine used by AI capture & manual input)
// @route   POST /api/transactions
// @access  Private
router.post("/", protect, async (req, res) => {
  const { type, amount, description, date, category, account, destinationAccount, items } = req.body;

  try {
    const transaction = await createTransaction({
      userId: req.user._id,
      type,
      amount,
      description,
      date,
      category,
      account,
      destinationAccount,
      items,
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Update an existing transaction
// @route   PUT /api/transactions/:id
// @access  Private
router.put("/:id", protect, async (req, res) => {
  const { type, amount, description, date, category, account, destinationAccount, items } = req.body;

  try {
    const updatedTransaction = await updateTransaction({
      transactionId: req.params.id,
      userId: req.user._id,
      type,
      amount,
      description,
      date,
      category,
      account,
      destinationAccount,
      items,
    });

    res.json(updatedTransaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Private
router.delete("/:id", protect, async (req, res) => {
  try {
    const result = await deleteTransaction({
      transactionId: req.params.id,
      userId: req.user._id,
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
