import express from "express";
import Transaction from "../models/Transaction.js";
import Account from "../models/Account.js";
import Category from "../models/Category.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// @desc    Get dashboard summary (Total balance, monthly income/expense, recent txs)
// @route   GET /api/stats/summary
// @access  Private
router.get("/summary", protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Total balance of all accounts
    const accounts = await Account.find({ createdBy: userId });
    const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);

    // 2. Monthly income & expense calculations
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    // Get current month aggregates
    const currentMonthStats = await Transaction.aggregate([
      {
        $match: {
          createdBy: userId,
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
        },
      },
    ]);

    // Get previous month aggregates
    const prevMonthStats = await Transaction.aggregate([
      {
        $match: {
          createdBy: userId,
          date: { $gte: prevMonthStart, $lte: prevMonthEnd },
        },
      },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
        },
      },
    ]);

    const getStat = (statsArray, type) => {
      const found = statsArray.find((item) => item._id === type);
      return found ? found.total : 0;
    };

    const currentMonthIncome = getStat(currentMonthStats, "Income");
    const currentMonthExpense = getStat(currentMonthStats, "Expense");

    const prevMonthIncome = getStat(prevMonthStats, "Income");
    const prevMonthExpense = getStat(prevMonthStats, "Expense");

    // 3. Get recent 5 transactions
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
        income: currentMonthIncome,
        expense: currentMonthExpense,
        netSavings: currentMonthIncome - currentMonthExpense,
      },
      prevMonth: {
        income: prevMonthIncome,
        expense: prevMonthExpense,
      },
      recentTransactions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get monthly trends for charts (Income vs Expense over past 6 or 12 months)
// @route   GET /api/stats/monthly-trends
// @access  Private
router.get("/monthly-trends", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { months = 6 } = req.query;

    const limitMonths = parseInt(months);
    const today = new Date();
    // Start date is the 1st of the month 'limitMonths - 1' months ago
    const startDate = new Date(today.getFullYear(), today.getMonth() - limitMonths + 1, 1);

    const stats = await Transaction.aggregate([
      {
        $match: {
          createdBy: userId,
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    // Format stats into sequential monthly buckets
    const result = [];
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    for (let i = limitMonths - 1; i >= 0; i--) {
      const targetDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth() + 1; // 1-indexed for matching aggregation year/month
      const label = `${monthNames[targetDate.getMonth()]} ${year}`;

      const monthlyIncome = stats.find(
        (s) => s._id.year === year && s._id.month === month && s._id.type === "Income"
      );
      const monthlyExpense = stats.find(
        (s) => s._id.year === year && s._id.month === month && s._id.type === "Expense"
      );

      result.push({
        label,
        year,
        month,
        income: monthlyIncome ? monthlyIncome.total : 0,
        expense: monthlyExpense ? monthlyExpense.total : 0,
        savings: (monthlyIncome ? monthlyIncome.total : 0) - (monthlyExpense ? monthlyExpense.total : 0),
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get expense breakdown by category for custom date range or current month
// @route   GET /api/stats/category-breakdown
// @access  Private
router.get("/category-breakdown", protect, async (req, res) => {
  const { startDate, endDate } = req.query;

  const query = {
    createdBy: req.user._id,
    type: "Expense",
  };

  // Date range filters
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.date.$lte = end;
    }
  } else {
    // default to current month
    const now = new Date();
    query.date = {
      $gte: new Date(now.getFullYear(), now.getMonth(), 1),
      $lte: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
    };
  }

  try {
    const stats = await Transaction.aggregate([
      {
        $match: query,
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
    ]);

    // Populate category information manually since Mongoose aggregation does not populate
    const populatedStats = await Promise.all(
      stats.map(async (stat) => {
        let categoryInfo = {
          name: "Uncategorized / Deleted",
          color: "#9CA3AF",
          icon: "help-circle",
        };

        if (stat._id) {
          const category = await Category.findById(stat._id);
          if (category) {
            categoryInfo = {
              name: category.name,
              color: category.color,
              icon: category.icon,
            };
          }
        }

        return {
          categoryId: stat._id,
          name: categoryInfo.name,
          color: categoryInfo.color,
          icon: categoryInfo.icon,
          total: stat.total,
        };
      })
    );

    // Calculate total expense in this range to compute percentages
    const totalExpenseRange = populatedStats.reduce((acc, curr) => acc + curr.total, 0);

    // Append percentage
    const breakdown = populatedStats.map((item) => ({
      ...item,
      percentage: totalExpenseRange > 0 ? parseFloat(((item.total / totalExpenseRange) * 100).toFixed(2)) : 0,
    })).sort((a, b) => b.total - a.total); // Sort by highest spend first

    res.json({
      totalExpense: totalExpenseRange,
      breakdown,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get monthly report (Opening balance, Income, Expenses, Savings, Ending balance, transactions list, category breakdown)
// @route   GET /api/stats/monthly-report
// @access  Private
router.get("/monthly-report", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({ message: "Year and month are required" });
    }

    const y = parseInt(year);
    const m = parseInt(month);

    const startOfMonth = new Date(y, m - 1, 1);
    const endOfMonth = new Date(y, m, 0, 23, 59, 59, 999);

    // 1. Current total balance of all accounts
    const accounts = await Account.find({ createdBy: userId });
    const currentTotalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);

    // 2. Sum of all transactions (Income/Expense/Transfer) after this month's end
    const postMonthTransactions = await Transaction.find({
      createdBy: userId,
      date: { $gt: endOfMonth }
    });

    let incomeAfter = 0;
    let expenseAfter = 0;
    postMonthTransactions.forEach(tx => {
      if (tx.type === "Income") {
        incomeAfter += tx.amount;
      } else if (tx.type === "Expense") {
        expenseAfter += tx.amount;
      }
    });

    const endingBalance = currentTotalBalance - incomeAfter + expenseAfter;

    // 3. Get transactions for the specified month
    const transactions = await Transaction.find({
      createdBy: userId,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    })
    .populate("category", "name icon color type")
    .populate("account", "name type color")
    .populate("destinationAccount", "name type color")
    .sort({ date: -1, createdAt: -1 });

    // 4. Summaries for the selected month
    let totalIncome = 0;
    let totalExpenses = 0;
    transactions.forEach(tx => {
      if (tx.type === "Income") {
        totalIncome += tx.amount;
      } else if (tx.type === "Expense") {
        totalExpenses += tx.amount;
      }
    });

    const savings = totalIncome - totalExpenses;
    const openingBalance = endingBalance - totalIncome + totalExpenses;

    // 5. Category breakdown for Expenses in this month
    const categoryStats = await Transaction.aggregate([
      {
        $match: {
          createdBy: userId,
          type: "Expense",
          date: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" }
        }
      }
    ]);

    const breakdown = await Promise.all(
      categoryStats.map(async (stat) => {
        let categoryInfo = {
          name: "Uncategorized / Deleted",
          color: "#9CA3AF",
          icon: "tag"
        };
        if (stat._id) {
          const category = await Category.findById(stat._id);
          if (category) {
            categoryInfo = {
              name: category.name,
              color: category.color,
              icon: category.icon
            };
          }
        }
        return {
          categoryId: stat._id,
          name: categoryInfo.name,
          color: categoryInfo.color,
          icon: categoryInfo.icon,
          total: stat.total
        };
      })
    );

    const totalExpenseRange = breakdown.reduce((acc, curr) => acc + curr.total, 0);
    const categoryBreakdown = breakdown.map(item => ({
      ...item,
      percentage: totalExpenseRange > 0 ? parseFloat(((item.total / totalExpenseRange) * 100).toFixed(2)) : 0
    })).sort((a, b) => b.total - a.total);

    res.json({
      monthLabel: startOfMonth.toLocaleString("en-US", { month: "long" }),
      year: y,
      month: m,
      openingBalance,
      totalIncome,
      totalExpenses,
      savings,
      endingBalance,
      transactions,
      categoryBreakdown
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
