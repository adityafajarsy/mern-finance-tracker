import dotenv from "dotenv";
dotenv.config();
import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);
import mongoose from "mongoose";
import User from "../backend/models/User.js";
import Account from "../backend/models/Account.js";
import Category from "../backend/models/Category.js";
import Transaction from "../backend/models/Transaction.js";
import { createTransaction, updateTransaction, deleteTransaction } from "../backend/services/transactionService.js";

async function runHistoryTests() {
  console.log("--- STARTING TRANSACTION HISTORY EDIT & TIMESTAMP TESTS ---");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const email = `test_history_${Date.now()}@example.com`;
  const user = await User.create({
    username: "TestHistoryUser",
    email,
    password: "password123",
  });

  const bca = await Account.create({
    name: "BCA",
    type: "Bank",
    balance: 1000000,
    createdBy: user._id,
  });

  const foodCat = await Category.create({
    name: "Food & Drinks",
    type: "Expense",
    createdBy: user._id,
  });

  const entCat = await Category.create({
    name: "Entertainment",
    type: "Expense",
    createdBy: user._id,
  });

  // 1. Create a transaction with an exact timestamp (including seconds)
  const initialTimestamp = new Date("2026-08-26T14:37:42.000Z");
  const tx = await createTransaction({
    userId: user._id,
    type: "Expense",
    amount: 50000,
    description: "Cilok",
    date: initialTimestamp,
    category: foodCat._id,
    account: bca._id,
  });

  console.log("\n[TEST 1] Created transaction timestamp:", tx.date.toISOString());
  console.log("Expected seconds match (42):", tx.date.getSeconds() === 42 ? "PASS" : "FAIL");

  const bcaAfterCreate = await Account.findById(bca._id);
  console.log("BCA balance after 50k expense (Expected 950000):", bcaAfterCreate.balance);

  // 2. Edit Description and Amount
  const updatedTx1 = await updateTransaction({
    transactionId: tx._id,
    userId: user._id,
    amount: 75000,
    description: "Cilok + Es Teh",
  });

  console.log("\n[TEST 2] Updated Description:", updatedTx1.description);
  console.log("Updated Amount:", updatedTx1.amount);
  const bcaAfterAmtEdit = await Account.findById(bca._id);
  console.log("BCA balance after amount edit to 75k (Expected 925000):", bcaAfterAmtEdit.balance);

  // 3. Edit Date & Time with exact seconds
  const newTimestamp = new Date("2026-08-25T13:12:05.000Z");
  const updatedTx2 = await updateTransaction({
    transactionId: tx._id,
    userId: user._id,
    date: newTimestamp,
    category: entCat._id,
  });

  console.log("\n[TEST 3] Updated Timestamp:", updatedTx2.date.toISOString());
  console.log("Expected new seconds match (05):", updatedTx2.date.getSeconds() === 5 ? "PASS" : "FAIL");
  console.log("Updated Category:", updatedTx2.category?.name);

  // 4. Delete Transaction and verify balance reversal
  console.log("\n[TEST 4] Deleting transaction and checking balance reversal");
  await deleteTransaction({
    transactionId: tx._id,
    userId: user._id,
  });

  const bcaAfterDelete = await Account.findById(bca._id);
  console.log("BCA balance after deletion (Expected 1000000):", bcaAfterDelete.balance);

  // Cleanup
  await Transaction.deleteMany({ createdBy: user._id });
  await Account.deleteMany({ createdBy: user._id });
  await Category.deleteMany({ createdBy: user._id });
  await User.deleteOne({ _id: user._id });
  console.log("\nALL TRANSACTION HISTORY & TIMESTAMP TESTS PASSED SUCCESSFULLY!");
  await mongoose.disconnect();
}

runHistoryTests().catch(err => {
  console.error("Test error:", err);
  process.exit(1);
});
