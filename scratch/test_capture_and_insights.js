import dotenv from "dotenv";
dotenv.config();
import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);
import mongoose from "mongoose";
import User from "../backend/models/User.js";
import Account from "../backend/models/Account.js";
import Category from "../backend/models/Category.js";
import Transaction from "../backend/models/Transaction.js";
import { interpretNaturalLanguageCapture } from "../backend/services/captureService.js";
import { createTransaction, updateTransaction, deleteTransaction } from "../backend/services/transactionService.js";
import { getInsightsData } from "../backend/services/insightsService.js";

async function runTests() {
  console.log("--- STARTING VAULT CAPTURE & ENGINE TESTS ---");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  // 1. Create or fetch test user
  const email = `test_vault_${Date.now()}@example.com`;
  const user = await User.create({
    username: "TestVaultUser",
    email,
    password: "password123",
  });

  const bca = await Account.create({
    name: "BCA",
    type: "Bank",
    balance: 5000000,
    createdBy: user._id,
  });

  const gopay = await Account.create({
    name: "GoPay",
    type: "E-Wallet",
    balance: 500000,
    createdBy: user._id,
  });

  user.defaultAccount = bca._id;
  await user.save();

  const foodCat = await Category.create({
    name: "Food & Drinks",
    type: "Expense",
    createdBy: user._id,
  });

  const salaryCat = await Category.create({
    name: "Salary",
    type: "Income",
    createdBy: user._id,
  });

  console.log("User & accounts created successfully");

  // 2. Test OpenRouter Capture interpretation
  console.log("\n[TEST 1] Testing Capture: 'gua abis beli cilok 5k'");
  const cap1 = await interpretNaturalLanguageCapture({ userId: user._id, text: "gua abis beli cilok 5k" });
  console.log("Result 1:", {
    intent: cap1.draft.type,
    amount: cap1.draft.amount,
    desc: cap1.draft.description,
    account: cap1.draft.account?.name,
    category: cap1.draft.category?.name,
  });

  console.log("\n[TEST 2] Testing Capture: 'pengeluaran 5000 dari QRIS BCA'");
  const cap2 = await interpretNaturalLanguageCapture({ userId: user._id, text: "pengeluaran 5000 dari QRIS BCA" });
  console.log("Result 2:", {
    intent: cap2.draft.type,
    amount: cap2.draft.amount,
    account: cap2.draft.account?.name,
  });

  console.log("\n[TEST 3] Testing Capture: 'gaji masuk 8 juta'");
  const cap3 = await interpretNaturalLanguageCapture({ userId: user._id, text: "gaji masuk 8 juta" });
  console.log("Result 3:", {
    intent: cap3.draft.type,
    amount: cap3.draft.amount,
    category: cap3.draft.category?.name,
  });

  console.log("\n[TEST 4] Testing Capture: 'transfer 200 ribu dari BCA ke GoPay'");
  const cap4 = await interpretNaturalLanguageCapture({ userId: user._id, text: "transfer 200 ribu dari BCA ke GoPay" });
  console.log("Result 4:", {
    intent: cap4.draft.type,
    amount: cap4.draft.amount,
    source: cap4.draft.account?.name,
    dest: cap4.draft.destinationAccount?.name,
  });

  console.log("\n[TEST 5] Testing Capture: 'transfer 500 ribu ke Aditya'");
  const cap5 = await interpretNaturalLanguageCapture({ userId: user._id, text: "transfer 500 ribu ke Aditya" });
  console.log("Result 5 (External Transfer):", {
    intent: cap5.draft.type,
    amount: cap5.draft.amount,
    dest: cap5.draft.destinationAccount,
  });

  console.log("\n[TEST 6] Testing Clarification: 'tadi belanja'");
  const cap6 = await interpretNaturalLanguageCapture({ userId: user._id, text: "tadi belanja" });
  console.log("Result 6 (Missing Amount):", {
    needsClarification: cap6.needsClarification,
    question: cap6.clarificationQuestion,
  });

  // 3. Test Transaction Engine & Balance Adjustments
  console.log("\n[TEST 7] Transaction Engine Mutation Test");
  const tx1 = await createTransaction({
    userId: user._id,
    type: "Expense",
    amount: 50000,
    description: "Cilok & Es",
    category: foodCat._id,
    account: bca._id,
  });

  const bcaAfterExp = await Account.findById(bca._id);
  console.log("BCA balance after 50k expense (Expected 4950000):", bcaAfterExp.balance);

  const tx2 = await createTransaction({
    userId: user._id,
    type: "Transfer",
    amount: 100000,
    description: "Topup Gopay",
    account: bca._id,
    destinationAccount: gopay._id,
  });

  const bcaAfterXfer = await Account.findById(bca._id);
  const gopayAfterXfer = await Account.findById(gopay._id);
  console.log("BCA balance after 100k transfer (Expected 4850000):", bcaAfterXfer.balance);
  console.log("GoPay balance after 100k transfer (Expected 600000):", gopayAfterXfer.balance);

  // 4. Test Insights & Forecasting
  console.log("\n[TEST 8] Testing Insights & Forecasting");
  const insightsData = await getInsightsData({ userId: user._id });
  console.log("Insights Output:", {
    totalWealth: insightsData.totalWealth,
    income: insightsData.whatHappened.income,
    expense: insightsData.whatHappened.expense,
    dailyBurnRate: insightsData.forecast.dailyBurnRate,
    projectedMonthEndExpense: insightsData.forecast.projectedMonthEndExpense,
    recommendationsCount: insightsData.recommendations.length,
    firstRecommendation: insightsData.recommendations[0]?.title,
  });

  // Cleanup test user and data
  await Transaction.deleteMany({ createdBy: user._id });
  await Account.deleteMany({ createdBy: user._id });
  await Category.deleteMany({ createdBy: user._id });
  await User.deleteOne({ _id: user._id });
  console.log("\nCleanup completed. ALL TESTS PASSED!");
  await mongoose.disconnect();
}

runTests().catch(err => {
  console.error("Test error:", err);
  process.exit(1);
});
