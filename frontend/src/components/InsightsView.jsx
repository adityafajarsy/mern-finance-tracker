import { useState, useEffect } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  Flame, 
  PieChart, 
  BarChart3,
  Calendar,
  Layers,
  ArrowRight
} from "lucide-react";

const InsightsView = ({ authFetch }) => {
  const [targetYear, setTargetYear] = useState(new Date().getFullYear());
  const [targetMonth, setTargetMonth] = useState(new Date().getMonth() + 1);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDay, setSelectedDay] = useState(null);

  const fetchInsights = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await authFetch(`/api/stats/insights?year=${targetYear}&month=${targetMonth}`);
      if (!res.ok) {
        throw new Error("Failed to load insights data");
      }
      const data = await res.json();
      setInsights(data);

      // Auto-select today if current month or select the latest active day
      const now = new Date();
      if (targetYear === now.getFullYear() && targetMonth === (now.getMonth() + 1)) {
        setSelectedDay(now.getDate());
      } else {
        const lastActive = data.dailyReport?.filter(d => d.transactionCount > 0).pop();
        setSelectedDay(lastActive ? lastActive.day : 1);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load insights");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [targetYear, targetMonth]);

  const handlePrevMonth = () => {
    if (targetMonth === 1) {
      setTargetMonth(12);
      setTargetYear(targetYear - 1);
    } else {
      setTargetMonth(targetMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (targetMonth === 12) {
      setTargetMonth(1);
      setTargetYear(targetYear + 1);
    } else {
      setTargetMonth(targetMonth + 1);
    }
  };

  const formatCurrency = (amount) => {
    const formatted = Math.abs(amount || 0).toLocaleString("id-ID");
    return `${(amount || 0) < 0 ? "-" : ""}Rp ${formatted}`;
  };

  if (loading && !insights) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-3">
        <div className="w-8 h-8 border-3 border-[#00A86B] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-[#1C5F4D] dark:text-[#88C8AC]">Gathering financial understanding...</p>
      </div>
    );
  }

  const whatHappened = insights?.whatHappened || { income: 0, expense: 0, netSavings: 0, savingsRate: 0, categoryBreakdown: [] };
  const dailyReport = insights?.dailyReport || [];
  const comparison = insights?.comparison || { incomeShift: 0, expenseShift: 0, savingsShift: 0, historicalTrends: [] };
  const forecast = insights?.forecast;
  const recommendations = insights?.recommendations || [];

  const monthLabel = new Date(targetYear, targetMonth - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const selectedDayData = dailyReport.find(d => d.day === selectedDay) || dailyReport[0] || null;

  // Maximum spend/income value for relative bar chart heights
  const maxDayAmount = Math.max(
    ...dailyReport.map(d => Math.max(d.income, d.expense)),
    50000
  );

  return (
    <div className="space-y-12 animate-fade-in pb-4 font-sans max-w-3xl">
      
      {/* Header & Month Navigator */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#D1EADE]/70 dark:border-[#14382C] pb-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#09261E] dark:text-white tracking-tight font-display">
            Insights
          </h2>
          <p className="text-xs text-[#1C5F4D] dark:text-[#88C8AC] mt-0.5">
            Holistic understanding, daily cashflow report, and tailored forecasting
          </p>
        </div>

        {/* Month Selector Controls */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-[#09261E] p-1 rounded-lg border border-[#D1EADE] dark:border-[#14382C]">
          <button
            onClick={handlePrevMonth}
            className="p-1 rounded text-[#1C5F4D] dark:text-[#88C8AC] hover:bg-[#F4FAF6] dark:hover:bg-[#071913] cursor-pointer"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="text-xs font-bold text-[#09261E] dark:text-white px-2 min-w-[110px] text-center">
            {monthLabel}
          </span>

          <button
            onClick={handleNextMonth}
            className="p-1 rounded text-[#1C5F4D] dark:text-[#88C8AC] hover:bg-[#F4FAF6] dark:hover:bg-[#071913] cursor-pointer"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 01 - MONTH OVERVIEW                                                       */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#1C5F4D] dark:text-[#88C8AC]">
          01 · Month Overview
        </p>

        <div className="space-y-2">
          <h3 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-[#09261E] dark:text-white">
            You saved <span className="text-[#00A86B]">{whatHappened.savingsRate}%</span> of your income in {monthLabel.split(" ")[0]}.
          </h3>
          <p className="text-3xl sm:text-4xl font-black font-display text-[#00A86B] tabular-nums">
            {formatCurrency(whatHappened.netSavings)}
          </p>
        </div>

        {/* Inline Financial Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 pt-2 border-t border-[#D1EADE]/60 dark:border-[#14382C]">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#1C5F4D] dark:text-[#88C8AC]">Total Income</span>
            <p className="text-lg font-black font-display text-emerald-600 dark:text-emerald-400 tabular-nums">
              {formatCurrency(whatHappened.income)}
            </p>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#1C5F4D] dark:text-[#88C8AC]">Total Spending</span>
            <p className="text-lg font-black font-display text-[#09261E] dark:text-white tabular-nums">
              {formatCurrency(whatHappened.expense)}
            </p>
          </div>
        </div>

        {/* Spending Category Distribution */}
        {whatHappened.categoryBreakdown?.length > 0 && (
          <div className="pt-4 space-y-3">
            <span className="text-xs font-bold text-[#09261E] dark:text-white">
              Spending Distribution
            </span>

            <div className="space-y-2.5">
              {whatHappened.categoryBreakdown.map((cat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-[#09261E] dark:text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color || "#00A86B" }} />
                      {cat.name}
                    </span>
                    <span className="font-mono font-bold text-[#09261E] dark:text-white">
                      {formatCurrency(cat.total)} ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#D1EADE]/50 dark:bg-[#14382C] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${cat.percentage}%`,
                        backgroundColor: cat.color || "#00A86B",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 02 - DAILY CASHFLOW & FINANCIAL REPORT                                    */}
      {/* ========================================================================= */}
      <section className="space-y-4 pt-4 border-t border-[#D1EADE]/70 dark:border-[#14382C]">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#1C5F4D] dark:text-[#88C8AC]">
              02 · Daily Cashflow Report
            </p>
            <h3 className="text-xl sm:text-2xl font-black font-display text-[#09261E] dark:text-white tracking-tight mt-0.5">
              How did your money move each day?
            </h3>
          </div>
          <span className="text-[10px] font-bold text-[#1C5F4D] dark:text-[#88C8AC] uppercase">
            {dailyReport.length} Days · {monthLabel}
          </span>
        </div>

        {/* Interactive Daily Timeline Chart Strip */}
        <div className="bg-white/80 dark:bg-[#09261E]/80 border border-[#D1EADE] dark:border-[#14382C] rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
          
          {/* Bar Visualization for Every Day in the Month */}
          <div className="h-32 flex items-end gap-1 sm:gap-1.5 overflow-x-auto pb-2 pt-4 px-1 select-none">
            {dailyReport.map((dayItem) => {
              const isSelected = selectedDay === dayItem.day;
              const hasActivity = dayItem.transactionCount > 0;
              const expenseH = dayItem.expense > 0 ? Math.max(Math.round((dayItem.expense / maxDayAmount) * 100), 8) : 0;
              const incomeH = dayItem.income > 0 ? Math.max(Math.round((dayItem.income / maxDayAmount) * 100), 8) : 0;

              return (
                <button
                  key={dayItem.day}
                  type="button"
                  onClick={() => setSelectedDay(dayItem.day)}
                  className={`flex-1 min-w-[20px] sm:min-w-[22px] flex flex-col items-center justify-end h-full group cursor-pointer transition-all ${
                    isSelected ? "scale-105" : "hover:opacity-80"
                  }`}
                  title={`${dayItem.label}: Income ${formatCurrency(dayItem.income)}, Spent ${formatCurrency(dayItem.expense)}`}
                >
                  <div className="w-full flex items-end justify-center gap-0.5 h-20 mb-1.5">
                    {/* Income Bar */}
                    {dayItem.income > 0 && (
                      <div
                        style={{ height: `${incomeH}%` }}
                        className={`w-full max-w-[6px] bg-emerald-500 rounded-t-xs transition-all ${
                          isSelected ? "ring-2 ring-emerald-400" : ""
                        }`}
                      />
                    )}
                    {/* Expense Bar */}
                    {dayItem.expense > 0 && (
                      <div
                        style={{ height: `${expenseH}%` }}
                        className={`w-full max-w-[6px] bg-[#09261E] dark:bg-emerald-200/90 rounded-t-xs transition-all ${
                          isSelected ? "ring-2 ring-[#00A86B]" : ""
                        }`}
                      />
                    )}
                    {/* Empty Day Indicator */}
                    {!hasActivity && (
                      <div className="w-1 h-1 bg-[#D1EADE] dark:bg-[#14382C] rounded-full mb-1" />
                    )}
                  </div>

                  <span
                    className={`text-[9px] font-mono font-bold transition-colors ${
                      isSelected
                        ? "text-[#00A86B] underline"
                        : hasActivity
                        ? "text-[#09261E] dark:text-white"
                        : "text-zinc-400 dark:text-zinc-600"
                    }`}
                  >
                    {String(dayItem.day).padStart(2, "0")}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected Day Inspection Card (Clean & Editorial) */}
          {selectedDayData && (
            <div className="pt-3 border-t border-[#D1EADE]/60 dark:border-[#14382C] animate-fade-in space-y-3">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#00A86B]" />
                  <h4 className="text-sm font-black font-display text-[#09261E] dark:text-white uppercase tracking-wider">
                    {selectedDayData.label} {targetYear}
                  </h4>
                  <span className="text-xs text-[#1C5F4D] dark:text-[#88C8AC] font-medium">
                    · {selectedDayData.transactionCount} {selectedDayData.transactionCount === 1 ? "transaction" : "transactions"}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  {selectedDayData.income > 0 && (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      +{formatCurrency(selectedDayData.income)}
                    </span>
                  )}
                  {selectedDayData.expense > 0 && (
                    <span className="text-[#09261E] dark:text-white font-bold">
                      -{formatCurrency(selectedDayData.expense)}
                    </span>
                  )}
                  <span className={`font-black ${selectedDayData.netCashflow >= 0 ? "text-[#00A86B]" : "text-rose-600"}`}>
                    Net: {formatCurrency(selectedDayData.netCashflow)}
                  </span>
                </div>
              </div>

              {/* Transactions List for the Selected Day */}
              {selectedDayData.transactions?.length > 0 ? (
                <div className="space-y-1.5 pt-1">
                  {selectedDayData.transactions.map((tx) => (
                    <div
                      key={tx._id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[#F4FAF6] dark:bg-[#071913] border border-[#D1EADE]/60 dark:border-[#14382C]"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: tx.color || "#00A86B" }}
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#09261E] dark:text-white truncate">
                            {tx.description}
                          </p>
                          <p className="text-[10px] text-[#1C5F4D] dark:text-[#88C8AC]">
                            {tx.type === "Transfer"
                              ? `${tx.sourceAccount} → ${tx.destinationAccount}`
                              : `${tx.category} · ${tx.account}`}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-xs font-black font-mono shrink-0 ml-2 ${
                          tx.type === "Income"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : tx.type === "Transfer"
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-[#09261E] dark:text-white"
                        }`}
                      >
                        {tx.type === "Income" ? "+" : tx.type === "Expense" ? "-" : ""}{formatCurrency(tx.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#1C5F4D] dark:text-[#88C8AC] italic py-1">
                  No recorded transactions for this date.
                </p>
              )}
            </div>
          )}

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 03 - COMPARISON                                                           */}
      {/* ========================================================================= */}
      <section className="space-y-4 pt-4 border-t border-[#D1EADE]/70 dark:border-[#14382C]">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#1C5F4D] dark:text-[#88C8AC]">
          03 · How It Compares
        </p>

        <p className="text-xs text-[#1C5F4D] dark:text-[#88C8AC]">
          6-month historical cashflow trajectory
        </p>

        {/* Historical Chart */}
        <div className="h-40 flex items-end justify-between gap-3 pt-4 px-2 border-b border-[#D1EADE]/70 dark:border-[#14382C] pb-2">
          {comparison.historicalTrends?.map((item, idx) => {
            const maxVal = Math.max(...comparison.historicalTrends.map(t => Math.max(t.income, t.expense)), 100000);
            const incomeHeight = Math.max(Math.round((item.income / maxVal) * 100), 4);
            const expenseHeight = Math.max(Math.round((item.expense / maxVal) * 100), 4);

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div className="w-full flex items-end justify-center gap-1.5 h-28">
                  <div
                    style={{ height: `${incomeHeight}%` }}
                    className="w-3 bg-emerald-500/80 rounded-t-sm transition-all"
                    title={`Income: ${formatCurrency(item.income)}`}
                  />
                  <div
                    style={{ height: `${expenseHeight}%` }}
                    className="w-3 bg-[#09261E]/80 dark:bg-white/70 rounded-t-sm transition-all"
                    title={`Expense: ${formatCurrency(item.expense)}`}
                  />
                </div>
                <span className="text-[9px] font-bold text-[#1C5F4D] dark:text-[#88C8AC] truncate">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-6 text-[10px] text-[#1C5F4D] dark:text-[#88C8AC]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-xs" />
            <span>Income</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-[#09261E] dark:bg-white rounded-xs" />
            <span>Expense</span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 04 - FORECAST                                                             */}
      {/* ========================================================================= */}
      {forecast && (
        <section className="space-y-4 pt-4 border-t border-[#D1EADE]/70 dark:border-[#14382C]">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#1C5F4D] dark:text-[#88C8AC]">
            04 · What Is Likely Next
          </p>

          <div className="bg-gradient-to-br from-[#0B2C22] to-[#04140E] text-[#E8F5EE] rounded-2xl p-6 space-y-3">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#00A86B]">
              Deterministic Forecast
            </span>
            <p className="text-xs text-[#88C8AC]">
              At your current daily burn rate of <strong className="text-white font-mono">{formatCurrency(forecast.dailyBurnRate)}/day</strong>, you may end the month around:
            </p>
            <h4 className="text-3xl font-black font-display text-white tabular-nums">
              {formatCurrency(forecast.estimatedEndOfMonthBalance)}
            </h4>
            <p className="text-[10px] text-[#88C8AC] pt-1">
              Projected month total spend: {formatCurrency(forecast.projectedMonthEndExpense)} ({forecast.daysRemaining} days remaining)
            </p>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 05 - AI FINANCIAL ADVICE                                                  */}
      {/* ========================================================================= */}
      <section className="space-y-4 pt-4 border-t border-[#D1EADE]/70 dark:border-[#14382C]">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#1C5F4D] dark:text-[#88C8AC]">
          05 · What To Improve
        </p>

        {!recommendations.length ? (
          <p className="text-xs text-[#1C5F4D] dark:text-[#88C8AC]">
            SALDO needs a little more transaction data to identify personalized discretionary optimizations.
          </p>
        ) : (
          <div className="space-y-3">
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-[#09261E] border-l-4 border-[#00A86B] p-4 space-y-1 rounded-r-xl shadow-2xs"
              >
                <h4 className="text-xs font-bold text-[#09261E] dark:text-white">
                  {rec.title}
                </h4>
                <p className="text-xs text-[#1C5F4D] dark:text-[#88C8AC] leading-relaxed font-medium">
                  {rec.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
};

export default InsightsView;
