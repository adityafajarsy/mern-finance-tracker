import express from "express";
import { protect } from "../middleware/auth.js";
import { getInsightsData } from "../services/insightsService.js";
import Account from "../models/Account.js";
import Transaction from "../models/Transaction.js";

const router = express.Router();

// @desc    Get unified Insights dataset (What Happened, Comparisons, Forecast, Recommendations)
// @route   GET /api/stats/insights
// @access  Private
router.get("/insights", protect, async (req, res) => {
  const { year, month } = req.query;

  try {
    const data = await getInsightsData({
      userId: req.user._id,
      year,
      month,
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get dashboard summary (Total balance, monthly income/expense, recent txs)
// @route   GET /api/stats/summary
// @access  Private
router.get("/summary", protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Total balance of all accounts
    const accounts = await Account.find({ createdBy: userId });
    const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);

    const now = new Date();
    const insights = await getInsightsData({
      userId,
      year: now.getFullYear(),
      month: now.getMonth() + 1,
    });

    // Recent 5 transactions
    const recentTransactions = await Transaction.find({ createdBy: userId })
      .populate("category", "name icon color type")
      .populate("account", "name type color")
      .populate("destinationAccount", "name type color")
      .sort({ date: -1, createdAt: -1 })
      .limit(5);

    res.json({
      totalBalance,
      accountsSummary: accounts.map(a => ({ id: a._id, name: a.name, balance: a.balance, color: a.color })),
      currentMonth: {
        income: insights.whatHappened.income,
        expense: insights.whatHappened.expense,
        netSavings: insights.whatHappened.netSavings,
      },
      prevMonth: {
        income: insights.comparison.prevMonth.income,
        expense: insights.comparison.prevMonth.expense,
      },
      forecast: insights.forecast,
      recommendation: insights.recommendations[0] || null,
      recentTransactions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get monthly trends for charts (Past 6 months)
// @route   GET /api/stats/monthly-trends
// @access  Private
router.get("/monthly-trends", protect, async (req, res) => {
  try {
    const insights = await getInsightsData({ userId: req.user._id });
    res.json(insights.comparison.historicalTrends);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get expense breakdown by category
// @route   GET /api/stats/category-breakdown
// @access  Private
router.get("/category-breakdown", protect, async (req, res) => {
  try {
    const insights = await getInsightsData({ userId: req.user._id });
    res.json({
      totalExpense: insights.whatHappened.expense,
      breakdown: insights.whatHappened.categoryBreakdown,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get monthly report (backward compatible)
// @route   GET /api/stats/monthly-report
// @access  Private
router.get("/monthly-report", protect, async (req, res) => {
  const { year, month } = req.query;
  try {
    const insights = await getInsightsData({
      userId: req.user._id,
      year,
      month,
    });

    const startOfMonth = new Date(insights.year, insights.month - 1, 1);
    const endOfMonth = new Date(insights.year, insights.month, 0, 23, 59, 59, 999);

    const transactions = await Transaction.find({
      createdBy: req.user._id,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    })
      .populate("category", "name icon color type")
      .populate("account", "name type color")
      .populate("destinationAccount", "name type color")
      .sort({ date: -1, createdAt: -1 });

    res.json({
      monthLabel: insights.monthLabel,
      year: insights.year,
      month: insights.month,
      openingBalance: insights.totalWealth - insights.whatHappened.netSavings,
      totalIncome: insights.whatHappened.income,
      totalExpenses: insights.whatHappened.expense,
      savings: insights.whatHappened.netSavings,
      transactions,
      categoryBreakdown: insights.whatHappened.categoryBreakdown,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get daily financial report timeline for a month
// @route   GET /api/stats/daily-report
// @access  Private
router.get("/daily-report", protect, async (req, res) => {
  const { year, month } = req.query;
  try {
    const insights = await getInsightsData({
      userId: req.user._id,
      year,
      month,
    });

    res.json({
      year: insights.year,
      month: insights.month,
      monthLabel: insights.monthLabel,
      dailyReport: insights.dailyReport,
      summary: {
        totalIncome: insights.whatHappened.income,
        totalExpense: insights.whatHappened.expense,
        netSavings: insights.whatHappened.netSavings,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
