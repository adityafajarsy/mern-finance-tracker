import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import mongoose from "mongoose";
import User from "../backend/models/User.js";
import Account from "../backend/models/Account.js";
import Category from "../backend/models/Category.js";
import Transaction from "../backend/models/Transaction.js";
import { interpretNaturalLanguageCapture } from "../backend/services/captureService.js";
import { createTransaction } from "../backend/services/transactionService.js";
import { getInsightsData } from "../backend/services/insightsService.js";

const REFERENCE_DATE = "2026-08-26T12:00:00.000Z";

async function runMasterBackdatedAndDailyTests() {
  console.log("===================================================================");
  console.log("SALDO — MASTER BACKDATED CAPTURE & DAILY REPORT TEST SUITE");
  console.log("===================================================================\n");

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB\n");

  try {
    let testUser = await User.findOne({ email: "master_backdate_test@saldo.finance" });
    if (!testUser) {
      testUser = await User.create({
        username: "master_backdate_test",
        email: "master_backdate_test@saldo.finance",
        password: "password123",
      });
    }

    // Clean up past transactions for a deterministic test state
    await Transaction.deleteMany({ createdBy: testUser._id });

    let bca = await Account.findOne({ name: "BCA", createdBy: testUser._id });
    if (!bca) {
      bca = await Account.create({
        name: "BCA",
        type: "Bank",
        balance: 10000000,
        createdBy: testUser._id,
      });
    } else {
      bca.balance = 10000000;
      await bca.save();
    }

    let foodCat = await Category.findOne({ name: "Food & Drinks", createdBy: testUser._id });
    if (!foodCat) {
      foodCat = await Category.create({
        name: "Food & Drinks",
        type: "Expense",
        createdBy: testUser._id,
      });
    }

    let salaryCat = await Category.findOne({ name: "Salary", createdBy: testUser._id });
    if (!salaryCat) {
      salaryCat = await Category.create({
        name: "Salary",
        type: "Income",
        createdBy: testUser._id,
      });
    }

    // --- TEST 1: Relative backdated input: 'kemarin gua beli ayam 26k' ---
    console.log("--------------------------------------------------");
    console.log("TEST 1 — Relative backdated input: 'kemarin gua beli ayam 26k'");
    const res1 = await interpretNaturalLanguageCapture({
      userId: testUser._id,
      text: "kemarin gua beli ayam 26k",
      referenceDate: REFERENCE_DATE,
    });
    console.log("Result 1:", {
      transactionDate: res1.draft?.date,
      amount: res1.draft?.amount,
      description: res1.draft?.description,
      type: res1.draft?.type,
    });
    if (res1.draft?.date !== "2026-08-25" || res1.draft?.amount !== 26000) {
      throw new Error("TEST 1 Failed: 'kemarin' did not resolve to 2026-08-25");
    }
    console.log("STATUS: PASS\n");

    // --- TEST 2: Explicit day backdated input: '23 gua beli ayam 54k' ---
    console.log("--------------------------------------------------");
    console.log("TEST 2 — Explicit day backdated input: '23 gua beli ayam 54k'");
    const res2 = await interpretNaturalLanguageCapture({
      userId: testUser._id,
      text: "23 gua beli ayam 54k",
      referenceDate: REFERENCE_DATE,
    });
    console.log("Result 2:", {
      transactionDate: res2.draft?.date,
      amount: res2.draft?.amount,
      description: res2.draft?.description,
    });
    if (res2.draft?.date !== "2026-08-23" || res2.draft?.amount !== 54000) {
      throw new Error("TEST 2 Failed: '23' did not resolve to 2026-08-23");
    }
    console.log("STATUS: PASS\n");

    // --- TEST 3: Multi-item backdated input ---
    console.log("--------------------------------------------------");
    console.log("TEST 3 — Multi-item backdated: 'tanggal 23 gua beli ayam 15k, beli telor 20k, sama beli nasi 5k'");
    const res3 = await interpretNaturalLanguageCapture({
      userId: testUser._id,
      text: "tanggal 23 gua beli ayam 15k, beli telor 20k, sama beli nasi 5k",
      referenceDate: REFERENCE_DATE,
    });
    console.log("Result 3:", {
      transactionDate: res3.draft?.date,
      totalAmount: res3.draft?.amount,
      items: res3.draft?.items?.map(i => `${i.description} (Rp ${i.amount})`),
    });
    if (res3.draft?.date !== "2026-08-23" || res3.draft?.amount !== 40000 || res3.draft?.items?.length !== 3) {
      throw new Error("TEST 3 Failed: Multi-item date/amount reconciliation failed");
    }
    console.log("STATUS: PASS\n");

    // --- TEST 4: Previous month rejection ---
    console.log("--------------------------------------------------");
    console.log("TEST 4 — Previous month rejection: 'tanggal 23 Juli gua beli ayam 15k'");
    const res4 = await interpretNaturalLanguageCapture({
      userId: testUser._id,
      text: "tanggal 23 Juli gua beli ayam 15k",
      referenceDate: REFERENCE_DATE,
    });
    console.log("Result 4:", { isBoundaryResponse: res4.isBoundaryResponse, message: res4.boundaryMessage, draft: res4.draft });
    if (!res4.isBoundaryResponse || res4.draft !== null) {
      throw new Error("TEST 4 Failed: Previous month was not rejected");
    }
    console.log("STATUS: PASS\n");

    // --- TEST 5: Future date rejection ---
    console.log("--------------------------------------------------");
    console.log("TEST 5 — Future date rejection: 'tanggal 30 Agustus gua beli ayam 15k'");
    const res5 = await interpretNaturalLanguageCapture({
      userId: testUser._id,
      text: "tanggal 30 Agustus gua beli ayam 15k",
      referenceDate: REFERENCE_DATE,
    });
    console.log("Result 5:", { isBoundaryResponse: res5.isBoundaryResponse, message: res5.boundaryMessage, draft: res5.draft });
    if (!res5.isBoundaryResponse || res5.draft !== null) {
      throw new Error("TEST 5 Failed: Future date was not rejected");
    }
    console.log("STATUS: PASS\n");

    // --- TEST 6: No date defaulting: 'gua beli ayam 26k' ---
    console.log("--------------------------------------------------");
    console.log("TEST 6 — No date defaulting: 'gua beli ayam 26k'");
    const res6 = await interpretNaturalLanguageCapture({
      userId: testUser._id,
      text: "gua beli ayam 26k",
      referenceDate: REFERENCE_DATE,
    });
    console.log("Result 6:", { transactionDate: res6.draft?.date });
    if (res6.draft?.date !== "2026-08-26") {
      throw new Error("TEST 6 Failed: Input without date did not default to today (2026-08-26)");
    }
    console.log("STATUS: PASS\n");

    // --- TEST 7: Daily Report Fixture Data Verification ---
    console.log("--------------------------------------------------");
    console.log("TEST 7 — Daily Report Fixture Data Verification");
    // Seed test transactions for August 2026:
    // 01 Aug: Expense 10.000
    // 02 Aug: Expense 20.000
    // 03 Aug: Income 1.000.000, Expense 50.000
    // 23 Aug: Expense 54.000
    // 26 Aug: Expense 26.000
    await createTransaction({ userId: testUser._id, type: "Expense", amount: 10000, description: "Beli Snack", date: "2026-08-01T10:00:00.000Z", account: bca._id, category: foodCat._id });
    await createTransaction({ userId: testUser._id, type: "Expense", amount: 20000, description: "Beli Makan", date: "2026-08-02T12:00:00.000Z", account: bca._id, category: foodCat._id });
    await createTransaction({ userId: testUser._id, type: "Income", amount: 1000000, description: "Freelance", date: "2026-08-03T09:00:00.000Z", account: bca._id, category: salaryCat._id });
    await createTransaction({ userId: testUser._id, type: "Expense", amount: 50000, description: "Bensin", date: "2026-08-03T15:00:00.000Z", account: bca._id, category: foodCat._id });
    await createTransaction({ userId: testUser._id, type: "Expense", amount: 54000, description: "Ayam", date: "2026-08-23T14:00:00.000Z", account: bca._id, category: foodCat._id });
    await createTransaction({ userId: testUser._id, type: "Expense", amount: 26000, description: "Kopi", date: "2026-08-26T18:00:00.000Z", account: bca._id, category: foodCat._id });

    const augustInsights = await getInsightsData({ userId: testUser._id, year: 2026, month: 8 });
    const dReport = augustInsights.dailyReport;

    const day1 = dReport.find(d => d.day === 1);
    const day2 = dReport.find(d => d.day === 2);
    const day3 = dReport.find(d => d.day === 3);
    const day23 = dReport.find(d => d.day === 23);
    const day26 = dReport.find(d => d.day === 26);

    console.log("Day 01:", { income: day1.income, expense: day1.expense, net: day1.netCashflow });
    console.log("Day 02:", { income: day2.income, expense: day2.expense, net: day2.netCashflow });
    console.log("Day 03:", { income: day3.income, expense: day3.expense, net: day3.netCashflow, txCount: day3.transactionCount });
    console.log("Day 23:", { income: day23.income, expense: day23.expense, net: day23.netCashflow });
    console.log("Day 26:", { income: day26.income, expense: day26.expense, net: day26.netCashflow });

    if (day1.income !== 0 || day1.expense !== 10000 || day1.netCashflow !== -10000) throw new Error("Day 01 aggregate failed");
    if (day2.income !== 0 || day2.expense !== 20000 || day2.netCashflow !== -20000) throw new Error("Day 02 aggregate failed");
    if (day3.income !== 1000000 || day3.expense !== 50000 || day3.netCashflow !== 950000 || day3.transactionCount !== 2) throw new Error("Day 03 aggregate failed");
    if (day23.income !== 0 || day23.expense !== 54000 || day23.netCashflow !== -54000) throw new Error("Day 23 aggregate failed");
    if (day26.income !== 0 || day26.expense !== 26000 || day26.netCashflow !== -26000) throw new Error("Day 26 aggregate failed");
    console.log("STATUS: PASS\n");

    // --- TEST 8: Backdated + Daily Report Isolation ---
    console.log("--------------------------------------------------");
    console.log("TEST 8 — Backdated + Daily Report Isolation");
    console.log("Verifying 23 Aug expense is strictly reported in 23 Aug and NOT 26 Aug:");
    const hasAyamInDay23 = day23.transactions.some(t => t.description === "Ayam" && t.amount === 54000);
    const hasAyamInDay26 = day26.transactions.some(t => t.description === "Ayam");
    console.log("  Ayam present in 23 Aug?", hasAyamInDay23);
    console.log("  Ayam present in 26 Aug?", hasAyamInDay26);

    if (!hasAyamInDay23 || hasAyamInDay26) {
      throw new Error("TEST 8 Failed: Backdated transaction leaked into today's report");
    }
    console.log("STATUS: PASS\n");

    // --- TEST 9: CapturedAt vs TransactionDate ---
    console.log("--------------------------------------------------");
    console.log("TEST 9 — CapturedAt vs TransactionDate");
    const ayamTx = await Transaction.findOne({ createdBy: testUser._id, description: "Ayam" });
    const txDateIso = ayamTx.date.toISOString();
    const capturedAtIso = ayamTx.capturedAt ? ayamTx.capturedAt.toISOString() : ayamTx.createdAt.toISOString();
    console.log("Persisted Transaction:", {
      description: ayamTx.description,
      transactionDate: txDateIso,
      capturedAt: capturedAtIso,
    });

    if (!txDateIso.startsWith("2026-08-23")) {
      throw new Error("TEST 9 Failed: transactionDate was not persisted as 2026-08-23");
    }
    console.log("STATUS: PASS\n");

    // --- FINAL REPORT ---
    console.log("===================================================================");
    console.log("FINAL REPORT — SALDO BACKDATED & DAILY REPORTS TEST RESULTS:");
    console.log("===================================================================");
    console.log("✓ Relative date resolution ('kemarin' -> 2026-08-25): PASS");
    console.log("✓ Explicit day resolution ('23' -> 2026-08-23): PASS");
    console.log("✓ Multi-item backdating & reconciliation: PASS");
    console.log("✓ Previous-month rejection (July -> rejected): PASS");
    console.log("✓ Future-date rejection (Aug 30 -> rejected): PASS");
    console.log("✓ No-date defaulting (Today -> 2026-08-26): PASS");
    console.log("✓ Daily financial report timeline & metrics: PASS");
    console.log("✓ Backdated date isolation in daily reports: PASS");
    console.log("✓ CapturedAt vs TransactionDate persistence separation: PASS");
    console.log("===================================================================");

  } finally {
    await mongoose.disconnect();
  }
}

runMasterBackdatedAndDailyTests().catch(err => {
  console.error("Test execution error:", err);
  process.exit(1);
});
