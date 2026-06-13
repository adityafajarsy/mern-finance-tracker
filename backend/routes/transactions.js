import express from "express";
import Transaction from "../models/Transaction.js";
import Account from "../models/Account.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Helper to adjust account balances
const adjustBalance = async (accountId, amount, operation) => {
  if (!accountId) return;
  const account = await Account.findById(accountId);
  if (!account) return;

  if (operation === "add") {
    account.balance += amount;
  } else if (operation === "subtract") {
    account.balance -= amount;
  }
  await account.save();
};

// @desc    Get all transactions with search, filters, and pagination
// @route   GET /api/transactions
// @access  Private
router.get("/", protect, async (req, res) => {
  const { startDate, endDate, category, type, account, search, page = 1, limit = 50 } = req.query;

  const query = { createdBy: req.user._id };

  // Date filter
  if (startDate || endDate) {
    query.date = {};
    if (startDate) {
      query.date.$gte = new Date(startDate);
    }
    if (endDate) {
      // Set to end of the day
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.date.$lte = end;
    }
  }

  // Category filter
  if (category) {
    query.category = category;
  }

  // Type filter
  if (type) {
    query.type = type;
  }

  // Account filter
  if (account) {
    query.$or = [{ account: account }, { destinationAccount: account }];
  }

  // Search filter
  if (search) {
    query.description = { $regex: search, $options: "i" };
  }

  try {
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const transactions = await Transaction.find(query)
      .populate("category", "name icon color type")
      .populate("account", "name type color")
      .populate("destinationAccount", "name type color")
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments(query);

    res.json({
      transactions,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
    });
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

// @desc    Create a new transaction
// @route   POST /api/transactions
// @access  Private
router.post("/", protect, async (req, res) => {
  const { type, amount, description, date, category, account, destinationAccount } = req.body;

  if (!type || !amount || !account) {
    return res.status(400).json({ message: "Type, amount, and account are required" });
  }

  try {
    // Verify account ownership
    const sourceAcc = await Account.findOne({ _id: account, createdBy: req.user._id });
    if (!sourceAcc) {
      return res.status(400).json({ message: "Source account not found or unauthorized" });
    }

    if (type === "Transfer") {
      if (!destinationAccount) {
        return res.status(400).json({ message: "Destination account is required for transfers" });
      }
      const destAcc = await Account.findOne({ _id: destinationAccount, createdBy: req.user._id });
      if (!destAcc) {
        return res.status(400).json({ message: "Destination account not found or unauthorized" });
      }
      if (account === destinationAccount) {
        return res.status(400).json({ message: "Source and destination accounts must be different" });
      }
    }

    // Create the transaction
    const transaction = new Transaction({
      type,
      amount,
      description,
      date: date || new Date(),
      category: type === "Transfer" ? undefined : category,
      account,
      destinationAccount: type === "Transfer" ? destinationAccount : undefined,
      createdBy: req.user._id,
    });

    const createdTransaction = await transaction.save();

    // Mutate the account balance(s)
    if (type === "Income") {
      await adjustBalance(account, amount, "add");
    } else if (type === "Expense") {
      await adjustBalance(account, amount, "subtract");
    } else if (type === "Transfer") {
      await adjustBalance(account, amount, "subtract");
      await adjustBalance(destinationAccount, amount, "add");
    }

    // Return the populated transaction
    const populated = await Transaction.findById(createdTransaction._id)
      .populate("category", "name icon color type")
      .populate("account", "name type color")
      .populate("destinationAccount", "name type color");

    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Update an existing transaction
// @route   PUT /api/transactions/:id
// @access  Private
router.put("/:id", protect, async (req, res) => {
  const { type, amount, description, date, category, account, destinationAccount } = req.body;

  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found or unauthorized" });
    }

    // Revert the old balances
    if (transaction.type === "Income") {
      await adjustBalance(transaction.account, transaction.amount, "subtract");
    } else if (transaction.type === "Expense") {
      await adjustBalance(transaction.account, transaction.amount, "add");
    } else if (transaction.type === "Transfer") {
      await adjustBalance(transaction.account, transaction.amount, "add");
      await adjustBalance(transaction.destinationAccount, transaction.amount, "subtract");
    }

    // Verify ownership of the new accounts if changed
    const targetAccountId = account || transaction.account;
    const targetSourceAcc = await Account.findOne({ _id: targetAccountId, createdBy: req.user._id });
    if (!targetSourceAcc) {
      return res.status(400).json({ message: "Account not found or unauthorized" });
    }

    const newType = type || transaction.type;
    const newAmount = amount !== undefined ? amount : transaction.amount;
    const targetDestAccountId = destinationAccount || transaction.destinationAccount;

    if (newType === "Transfer") {
      if (!targetDestAccountId) {
        return res.status(400).json({ message: "Destination account is required for transfers" });
      }
      const destAcc = await Account.findOne({ _id: targetDestAccountId, createdBy: req.user._id });
      if (!destAcc) {
        return res.status(400).json({ message: "Destination account not found or unauthorized" });
      }
      if (String(targetAccountId) === String(targetDestAccountId)) {
        return res.status(400).json({ message: "Source and destination accounts must be different" });
      }
    }

    // Update the transaction details
    transaction.type = newType;
    transaction.amount = newAmount;
    transaction.description = description !== undefined ? description : transaction.description;
    transaction.date = date || transaction.date;
    transaction.account = targetAccountId;

    if (newType === "Transfer") {
      transaction.destinationAccount = targetDestAccountId;
      transaction.category = undefined; // clear category on transfers
    } else {
      transaction.category = category !== undefined ? category : transaction.category;
      transaction.destinationAccount = undefined; // clear destination account
    }

    const updatedTransaction = await transaction.save();

    // Apply the new balances
    if (newType === "Income") {
      await adjustBalance(targetAccountId, newAmount, "add");
    } else if (newType === "Expense") {
      await adjustBalance(targetAccountId, newAmount, "subtract");
    } else if (newType === "Transfer") {
      await adjustBalance(targetAccountId, newAmount, "subtract");
      await adjustBalance(targetDestAccountId, newAmount, "add");
    }

    // Return the populated updated transaction
    const populated = await Transaction.findById(updatedTransaction._id)
      .populate("category", "name icon color type")
      .populate("account", "name type color")
      .populate("destinationAccount", "name type color");

    res.json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Private
router.delete("/:id", protect, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found or unauthorized" });
    }

    // Revert the account balances before deleting the transaction
    if (transaction.type === "Income") {
      await adjustBalance(transaction.account, transaction.amount, "subtract");
    } else if (transaction.type === "Expense") {
      await adjustBalance(transaction.account, transaction.amount, "add");
    } else if (transaction.type === "Transfer") {
      await adjustBalance(transaction.account, transaction.amount, "add");
      await adjustBalance(transaction.destinationAccount, transaction.amount, "subtract");
    }

    // Delete from DB
    await Transaction.deleteOne({ _id: req.params.id });

    res.json({ message: "Transaction removed and account balances updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
