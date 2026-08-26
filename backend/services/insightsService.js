import Transaction from "../models/Transaction.js";
import Account from "../models/Account.js";
import Category from "../models/Category.js";

/**
 * Insights Service
 * Computes deterministic financial metrics, spending velocity, forecasts, and evidence-based recommendations.
 */
export const getInsightsData = async ({ userId, year, month }) => {
  const now = new Date();
  const targetYear = year ? parseInt(year) : now.getFullYear();
  const targetMonth = month ? parseInt(month) : now.getMonth() + 1; // 1-indexed

  const startOfMonth = new Date(targetYear, targetMonth - 1, 1);
  const endOfMonth = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);
  const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();

  // 1. Current overall wealth
  const accounts = await Account.find({ createdBy: userId });
  const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);

  // 2. Previous Month Dates for Comparison
  const prevMonthStart = new Date(targetYear, targetMonth - 2, 1);
  const prevMonthEnd = new Date(targetYear, targetMonth - 1, 0, 23, 59, 59, 999);

  // Current Month Aggregates
  const currentMonthTx = await Transaction.find({
    createdBy: userId,
    date: { $gte: startOfMonth, $lte: endOfMonth },
  }).populate("category", "name icon color type");

  let currentIncome = 0;
  let currentExpense = 0;
  currentMonthTx.forEach(tx => {
    if (tx.type === "Income") currentIncome += tx.amount;
    if (tx.type === "Expense") currentExpense += tx.amount;
  });
  const currentSavings = currentIncome - currentExpense;
  const currentSavingsRate = currentIncome > 0 ? Math.round((currentSavings / currentIncome) * 100) : 0;

  // Previous Month Aggregates
  const prevMonthTx = await Transaction.find({
    createdBy: userId,
    date: { $gte: prevMonthStart, $lte: prevMonthEnd },
  });

  let prevIncome = 0;
  let prevExpense = 0;
  prevMonthTx.forEach(tx => {
    if (tx.type === "Income") prevIncome += tx.amount;
    if (tx.type === "Expense") prevExpense += tx.amount;
  });
  const prevSavings = prevIncome - prevExpense;

  const calcPercentageShift = (curr, prev) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return Math.round(((curr - prev) / Math.abs(prev)) * 100);
  };

  // Category Breakdown for Target Month
  const categoryStatsMap = {};
  currentMonthTx.forEach(tx => {
    if (tx.type === "Expense") {
      const catName = tx.category?.name || "Uncategorized";
      const catColor = tx.category?.color || "#9CA3AF";
      const catIcon = tx.category?.icon || "tag";
      const catId = tx.category?._id || "uncategorized";

      if (!categoryStatsMap[catId]) {
        categoryStatsMap[catId] = {
          categoryId: catId,
          name: catName,
          color: catColor,
          icon: catIcon,
          total: 0,
        };
      }
      categoryStatsMap[catId].total += tx.amount;
    }
  });

  const categoryBreakdown = Object.values(categoryStatsMap)
    .map(item => ({
      ...item,
      percentage: currentExpense > 0 ? parseFloat(((item.total / currentExpense) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.total - a.total);

  // Daily Financial Report (Timeline for all days 1..daysInMonth)
  const dailyReport = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const dayStr = String(day).padStart(2, "0");
    const dateKey = `${targetYear}-${String(targetMonth).padStart(2, "0")}-${dayStr}`;
    const dateObj = new Date(targetYear, targetMonth - 1, day);
    const dayLabel = dateObj.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });

    dailyReport.push({
      day,
      date: dateKey,
      label: dayLabel,
      income: 0,
      expense: 0,
      netCashflow: 0,
      transactionCount: 0,
      transactions: [],
    });
  }

  currentMonthTx.forEach(tx => {
    const txDateStr = tx.date instanceof Date ? tx.date.toISOString().split("T")[0] : String(tx.date).split("T")[0];
    const [txY, txM, txD] = txDateStr.split("-").map(Number);

    if (txY === targetYear && txM === targetMonth && txD >= 1 && txD <= daysInMonth) {
      const dayEntry = dailyReport[txD - 1];

      if (tx.type === "Income") {
        dayEntry.income += tx.amount;
        dayEntry.transactionCount += 1;
        dayEntry.transactions.push({
          _id: tx._id,
          type: tx.type,
          amount: tx.amount,
          description: tx.description,
          category: tx.category?.name || "Income",
          color: tx.category?.color || "#00A86B",
          account: tx.account?.name || "Account",
          date: tx.date,
        });
      } else if (tx.type === "Expense") {
        dayEntry.expense += tx.amount;
        dayEntry.transactionCount += 1;
        dayEntry.transactions.push({
          _id: tx._id,
          type: tx.type,
          amount: tx.amount,
          description: tx.description,
          category: tx.category?.name || "Uncategorized",
          color: tx.category?.color || "#9CA3AF",
          account: tx.account?.name || "Account",
          date: tx.date,
        });
      } else if (tx.type === "Transfer") {
        dayEntry.transactionCount += 1;
        dayEntry.transactions.push({
          _id: tx._id,
          type: tx.type,
          amount: tx.amount,
          description: tx.description || "Transfer Antar-Akun",
          sourceAccount: tx.account?.name,
          destinationAccount: tx.destinationAccount?.name,
          date: tx.date,
        });
      }

      dayEntry.netCashflow = dayEntry.income - dayEntry.expense;
    }
  });

  // 6-Month Historical Trends
  const historicalTrends = [];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  for (let i = 5; i >= 0; i--) {
    const tDate = new Date(targetYear, targetMonth - 1 - i, 1);
    const tYear = tDate.getFullYear();
    const tMonth = tDate.getMonth() + 1;
    const tStart = new Date(tYear, tMonth - 1, 1);
    const tEnd = new Date(tYear, tMonth, 0, 23, 59, 59, 999);

    const mTx = await Transaction.find({
      createdBy: userId,
      date: { $gte: tStart, $lte: tEnd },
    });

    let mIncome = 0;
    let mExpense = 0;
    mTx.forEach(t => {
      if (t.type === "Income") mIncome += t.amount;
      if (t.type === "Expense") mExpense += t.amount;
    });

    historicalTrends.push({
      label: `${monthNames[tDate.getMonth()]} ${tYear}`,
      month: tMonth,
      year: tYear,
      income: mIncome,
      expense: mExpense,
      savings: mIncome - mExpense,
    });
  }

  // Deterministic Forecast
  const isCurrentActiveMonth = targetYear === now.getFullYear() && targetMonth === (now.getMonth() + 1);
  const currentDay = isCurrentActiveMonth ? now.getDate() : daysInMonth;
  const daysElapsed = Math.max(1, currentDay);
  const daysRemaining = Math.max(0, daysInMonth - currentDay);

  const dailyBurnRate = Math.round(currentExpense / daysElapsed);
  const projectedMonthEndExpense = isCurrentActiveMonth ? Math.round(dailyBurnRate * daysInMonth) : currentExpense;
  const remainingProjectedSpend = isCurrentActiveMonth ? Math.max(0, projectedMonthEndExpense - currentExpense) : 0;
  const estimatedEndOfMonthBalance = Math.max(0, totalBalance - remainingProjectedSpend);

  // Contextual Recommendations (Focusing exclusively on discretionary spending)
  const flexibleCategories = ["Food & Drinks", "Entertainment", "Shopping", "Personal", "Other", "Groceries"];
  const recommendations = [];

  const highSpendCategory = categoryBreakdown.find(c => 
    flexibleCategories.some(f => c.name.toLowerCase().includes(f.toLowerCase())) && c.percentage >= 25 && c.total >= 50000
  );

  if (highSpendCategory) {
    const potentialSaving = Math.round(highSpendCategory.total * 0.2);
    recommendations.push({
      id: "trim-discretionary",
      type: "opportunity",
      category: highSpendCategory.name,
      title: `Optimasi Pengeluaran ${highSpendCategory.name}`,
      message: `Kategori ${highSpendCategory.name} menyumbang ${highSpendCategory.percentage}% dari total belanjaan bulan ini (Rp ${highSpendCategory.total.toLocaleString("id-ID")}). Mengurangi sekitar Rp ${potentialSaving.toLocaleString("id-ID")} dapat meningkatkan sisa tabungan kamu.`,
      potentialSaving,
    });
  }

  if (currentSavingsRate < 20 && currentIncome > 0) {
    recommendations.push({
      id: "savings-rate-boost",
      type: "tip",
      title: "Tingkatkan Rasio Tabungan",
      message: `Tingkat tabungan bulan ini berada di angka ${currentSavingsRate}%. Menjaga pengeluaran harian di bawah Rp ${Math.round((currentIncome * 0.7) / daysInMonth).toLocaleString("id-ID")}/hari dapat membantu mencapai target tabungan sehat 30%.`,
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      id: "healthy-cashflow",
      type: "success",
      title: "Arus Kas Terkelola Sehat",
      message: "Pola pengeluaran dan tabungan kamu bulan ini dalam kondisi seimbang dan terkontrol dengan baik.",
    });
  }

  return {
    monthLabel: startOfMonth.toLocaleString("id-ID", { month: "long" }),
    year: targetYear,
    month: targetMonth,
    totalWealth: totalBalance,
    whatHappened: {
      income: currentIncome,
      expense: currentExpense,
      netSavings: currentSavings,
      savingsRate: currentSavingsRate,
      categoryBreakdown,
    },
    dailyReport,
    comparison: {
      incomeShift: calcPercentageShift(currentIncome, prevIncome),
      expenseShift: calcPercentageShift(currentExpense, prevExpense),
      savingsShift: calcPercentageShift(currentSavings, prevSavings),
      prevMonth: {
        income: prevIncome,
        expense: prevExpense,
        savings: prevSavings,
      },
      historicalTrends,
    },
    forecast: {
      dailyBurnRate,
      projectedMonthEndExpense,
      daysElapsed,
      daysRemaining,
      daysInMonth,
      estimatedEndOfMonthBalance,
      isCurrentActiveMonth,
    },
    recommendations,
  };
};
