import Transaction from "../models/Transaction.js";
import Account from "../models/Account.js";
import Category from "../models/Category.js";

/**
 * Returns the start and end Date of the financial cycle period that contains
 * the given referenceDate, based on the user's cycleStartDay.
 *
 * Example: cycleStartDay=26, referenceDate=2026-10-05
 *   -> periodStart = 2026-09-26, periodEnd = 2026-10-25 23:59:59.999
 *
 * Edge-case: cycleStartDay=31 and month has only 28 days -> clamp to last day of that month.
 */
const clampDay = (year, month, day) => {
  const lastDay = new Date(year, month, 0).getDate(); // last day of that month (month is 1-indexed here)
  return Math.min(day, lastDay);
};

export const getCyclePeriod = (cycleStartDay, referenceDate = new Date()) => {
  const d = cycleStartDay || 1;
  const ref = new Date(referenceDate);
  const refYear = ref.getFullYear();
  const refMonth = ref.getMonth() + 1; // 1-indexed
  const refDay = ref.getDate();

  let periodStartYear, periodStartMonth;

  // If today >= cycleStartDay: period started this month
  // If today < cycleStartDay: period started previous month
  if (refDay >= d) {
    periodStartYear = refYear;
    periodStartMonth = refMonth;
  } else {
    // previous month
    if (refMonth === 1) {
      periodStartYear = refYear - 1;
      periodStartMonth = 12;
    } else {
      periodStartYear = refYear;
      periodStartMonth = refMonth - 1;
    }
  }

  const startDay = clampDay(periodStartYear, periodStartMonth, d);
  const periodStart = new Date(periodStartYear, periodStartMonth - 1, startDay, 0, 0, 0, 0);

  // Period ends one day before cycleStartDay of the following month
  let periodEndYear, periodEndMonth;
  if (periodStartMonth === 12) {
    periodEndYear = periodStartYear + 1;
    periodEndMonth = 1;
  } else {
    periodEndYear = periodStartYear;
    periodEndMonth = periodStartMonth + 1;
  }
  const endDay = clampDay(periodEndYear, periodEndMonth, d) - 1;
  // If endDay becomes 0, it means cycleStartDay is 1 – end is last day of periodStartMonth
  const periodEnd =
    endDay < 1
      ? new Date(periodEndYear, periodEndMonth - 1, 0, 23, 59, 59, 999)
      : new Date(periodEndYear, periodEndMonth - 1, endDay, 23, 59, 59, 999);

  return { periodStart, periodEnd };
};

/**
 * Resolve the Nth previous cycle period relative to the current one.
 * offset=0 -> current period, offset=1 -> one period back, etc.
 */
export const getCyclePeriodByOffset = (cycleStartDay, offset = 0) => {
  const now = new Date();
  const current = getCyclePeriod(cycleStartDay, now);

  if (offset === 0) return current;

  // Step back by subtracting one month from periodStart for each offset step
  let ref = new Date(current.periodStart);
  for (let i = 0; i < offset; i++) {
    // Move ref back by 1 month to land inside the previous period
    ref = new Date(ref.getFullYear(), ref.getMonth() - 1, ref.getDate());
  }
  return getCyclePeriod(cycleStartDay, ref);
};

/**
 * Insights Service
 * Computes deterministic financial metrics, spending velocity, forecasts, and evidence-based recommendations.
 * All periods are now based on the user's custom cycleStartDay instead of calendar month boundaries.
 */
export const getInsightsData = async ({ userId, cycleStartDay = 1, periodOffset = 0 }) => {
  const now = new Date();
  const safeDay = Math.max(1, Math.min(31, parseInt(cycleStartDay) || 1));

  // Resolve the target period (current or offset-N periods back)
  const { periodStart, periodEnd } = getCyclePeriodByOffset(safeDay, parseInt(periodOffset) || 0);
  const { periodStart: prevPeriodStart, periodEnd: prevPeriodEnd } = getCyclePeriodByOffset(safeDay, (parseInt(periodOffset) || 0) + 1);

  // 1. Current overall wealth
  const accounts = await Account.find({ createdBy: userId });
  const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);

  // 2. Current Period Aggregates
  const currentPeriodTx = await Transaction.find({
    createdBy: userId,
    date: { $gte: periodStart, $lte: periodEnd },
  }).populate("category", "name icon color type");

  let currentIncome = 0;
  let currentExpense = 0;
  currentPeriodTx.forEach(tx => {
    if (tx.type === "Income") currentIncome += tx.amount;
    if (tx.type === "Expense") currentExpense += tx.amount;
  });
  const currentSavings = currentIncome - currentExpense;
  const currentSavingsRate = currentIncome > 0 ? Math.round((currentSavings / currentIncome) * 100) : 0;

  // 3. Previous Period Aggregates
  const prevPeriodTx = await Transaction.find({
    createdBy: userId,
    date: { $gte: prevPeriodStart, $lte: prevPeriodEnd },
  });

  let prevIncome = 0;
  let prevExpense = 0;
  prevPeriodTx.forEach(tx => {
    if (tx.type === "Income") prevIncome += tx.amount;
    if (tx.type === "Expense") prevExpense += tx.amount;
  });
  const prevSavings = prevIncome - prevExpense;

  const calcPercentageShift = (curr, prev) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return Math.round(((curr - prev) / Math.abs(prev)) * 100);
  };

  // 4. Category Breakdown for Target Period
  const categoryStatsMap = {};
  currentPeriodTx.forEach(tx => {
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

  // 5. Daily Financial Report (for every day in the period, from periodStart to periodEnd)
  const dailyReport = [];
  const msPerDay = 24 * 60 * 60 * 1000;
  const totalDays = Math.floor((periodEnd.getTime() - periodStart.getTime()) / msPerDay) + 1;

  for (let i = 0; i < totalDays; i++) {
    const dateObj = new Date(periodStart.getTime() + i * msPerDay);
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();
    const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayLabel = dateObj.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });

    dailyReport.push({
      day: i + 1, // sequential day index within the period (1-based)
      calendarDay: day,
      date: dateKey,
      label: dayLabel,
      income: 0,
      expense: 0,
      netCashflow: 0,
      transactionCount: 0,
      transactions: [],
    });
  }

  currentPeriodTx.forEach(tx => {
    const txDate = tx.date instanceof Date ? tx.date : new Date(tx.date);
    const txDateStr = txDate.toISOString().split("T")[0];
    const idx = dailyReport.findIndex(d => d.date === txDateStr);
    if (idx === -1) return;

    const dayEntry = dailyReport[idx];
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
  });

  // 6. 6-Period Historical Trends
  const historicalTrends = [];
  for (let i = 5; i >= 0; i--) {
    const { periodStart: tStart, periodEnd: tEnd } = getCyclePeriodByOffset(safeDay, (parseInt(periodOffset) || 0) + i);
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

    // Label: show start date of the period
    const startLabel = tStart.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    const endLabel = tEnd.toLocaleDateString("id-ID", { day: "numeric", month: "short" });

    historicalTrends.push({
      label: `${startLabel}`,
      fullLabel: `${startLabel} - ${endLabel}`,
      income: mIncome,
      expense: mExpense,
      savings: mIncome - mExpense,
    });
  }

  // 7. Deterministic Forecast
  const isCurrentActivePeriod = periodOffset === 0 || parseInt(periodOffset) === 0;
  const isCurrentActiveAndOngoing = isCurrentActivePeriod && now >= periodStart && now <= periodEnd;
  const daysInPeriod = totalDays;
  const daysElapsed = isCurrentActiveAndOngoing
    ? Math.max(1, Math.floor((now.getTime() - periodStart.getTime()) / msPerDay) + 1)
    : daysInPeriod;
  const daysRemaining = Math.max(0, daysInPeriod - daysElapsed);

  const dailyBurnRate = Math.round(currentExpense / daysElapsed);
  const projectedPeriodEndExpense = isCurrentActiveAndOngoing ? Math.round(dailyBurnRate * daysInPeriod) : currentExpense;
  const remainingProjectedSpend = isCurrentActiveAndOngoing ? Math.max(0, projectedPeriodEndExpense - currentExpense) : 0;
  const estimatedEndOfMonthBalance = Math.max(0, totalBalance - remainingProjectedSpend);

  // 8. Contextual Recommendations
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
      message: `Kategori ${highSpendCategory.name} menyumbang ${highSpendCategory.percentage}% dari total belanjaan periode ini (Rp ${highSpendCategory.total.toLocaleString("id-ID")}). Mengurangi sekitar Rp ${potentialSaving.toLocaleString("id-ID")} dapat meningkatkan sisa tabungan kamu.`,
      potentialSaving,
    });
  }

  if (currentSavingsRate < 20 && currentIncome > 0) {
    recommendations.push({
      id: "savings-rate-boost",
      type: "tip",
      title: "Tingkatkan Rasio Tabungan",
      message: `Tingkat tabungan periode ini berada di angka ${currentSavingsRate}%. Menjaga pengeluaran harian di bawah Rp ${Math.round((currentIncome * 0.7) / daysInPeriod).toLocaleString("id-ID")}/hari dapat membantu mencapai target tabungan sehat 30%.`,
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      id: "healthy-cashflow",
      type: "success",
      title: "Arus Kas Terkelola Sehat",
      message: "Pola pengeluaran dan tabungan kamu periode ini dalam kondisi seimbang dan terkontrol dengan baik.",
    });
  }

  // Build human-readable period label
  const periodLabel = `${periodStart.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })} - ${periodEnd.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}`;

  return {
    periodLabel,
    periodStart: periodStart.toISOString(),
    periodEnd: periodEnd.toISOString(),
    cycleStartDay: safeDay,
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
      prevPeriod: {
        income: prevIncome,
        expense: prevExpense,
        savings: prevSavings,
      },
      historicalTrends,
    },
    forecast: {
      dailyBurnRate,
      projectedMonthEndExpense: projectedPeriodEndExpense,
      daysElapsed,
      daysRemaining,
      daysInMonth: daysInPeriod,
      estimatedEndOfMonthBalance,
      isCurrentActiveMonth: isCurrentActiveAndOngoing,
    },
    recommendations,
  };
};
