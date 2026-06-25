import { useState, useEffect } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PiggyBank, 
  Plus, 
  Edit2, 
  Trash2, 
  AlertCircle, 
  Calendar,
  RefreshCw,
  BarChart3
} from "lucide-react";

const ReportsPanel = ({ 
  authFetch, 
  handleResponse,
  formatCurrency, 
  accounts, 
  categories, 
  summary, 
  onOpenTransactionModal, 
  onDeleteTransaction,
  onSetActiveTab
}) => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1); // 1-indexed
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const fetchMonthlyReport = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await authFetch(`/api/stats/monthly-report?year=${year}&month=${month}`);
      const data = await handleResponse(res, "Failed to load monthly report");
      setReportData(data);
    } catch (err) {
      setError(err.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlyReport();
  }, [year, month, accounts, summary]);

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(y => y - 1);
    } else {
      setMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(y => y + 1);
    } else {
      setMonth(m => m + 1);
    }
  };

  const getFriendlyDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  };

  // SVG Donut Chart helper
  const renderDonutChart = (data) => {
    if (!data || data.length === 0) return null;
    const r = 50;
    const circumference = 2 * Math.PI * r;
    let accumulatedPercent = 0;

    return (
      <svg viewBox="0 0 160 160" className="w-40 h-40 transform -rotate-90 select-none">
        <circle cx="80" cy="80" r={r} fill="transparent" className="stroke-zinc-100 dark:stroke-zinc-800/60" strokeWidth="18" />
        {data.map((item, idx) => {
          const strokeLength = (item.percentage / 100) * circumference;
          const strokeOffset = circumference - (accumulatedPercent / 100) * circumference;
          accumulatedPercent += item.percentage;

          return (
            <circle
              key={idx}
              cx="80"
              cy="80"
              r={r}
              fill="transparent"
              stroke={item.color}
              strokeWidth="20"
              strokeDasharray={`${strokeLength} ${circumference}`}
              strokeDashoffset={strokeOffset}
              strokeLinecap={item.percentage > 4 ? "round" : "butt"}
              className="transition-all duration-300 hover:stroke-[22] cursor-pointer"
            />
          );
        })}
      </svg>
    );
  };

  // Helper to get transaction default date string for the selected month
  const getSelectedMonthDefaultDate = () => {
    const today = new Date();
    // If selecting current month, default to today. Else default to 1st of that month.
    if (today.getFullYear() === year && today.getMonth() + 1 === month) {
      return today.toISOString().split("T")[0];
    }
    const targetMonthStr = String(month).padStart(2, "0");
    return `${year}-${targetMonthStr}-01`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Month Navigation & Sync Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-zinc-900 border border-[#EEF2F7] dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between">
          <button 
            onClick={handlePrevMonth} 
            className="p-2.5 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-2xl cursor-pointer transition-all active:scale-95"
            title="Previous Month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="text-center px-4">
            <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight font-display">
              {monthNames[month - 1]} {year}
            </h2>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-widest mt-0.5 font-display">
              Monthly Financial Snapshot
            </p>
          </div>

          <button 
            onClick={handleNextMonth} 
            className="p-2.5 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-2xl cursor-pointer transition-all active:scale-95"
            title="Next Month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-2.5 w-full sm:w-auto justify-center flex-wrap">
          <button
            onClick={() => onSetActiveTab("analytics")}
            className="flex items-center gap-1.5 px-4.5 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-2xl text-xs font-bold cursor-pointer transition-all duration-200"
            title="View Charts"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Charts
          </button>
          
          <button
            onClick={fetchMonthlyReport}
            className="flex items-center gap-1.5 px-4.5 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-2xl text-xs font-bold cursor-pointer transition-all duration-200"
            title="Refresh Report"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Sync
          </button>

          <button
            onClick={() => onOpenTransactionModal("Expense", null, getSelectedMonthDefaultDate())}
            className="flex items-center gap-1.5 px-4.5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-violet-500/20 cursor-pointer transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            Add Record
          </button>
        </div>
      </div>

      {loading && !reportData ? (
        <div className="text-center py-20 bg-white dark:bg-zinc-900 border border-[#EEF2F7] dark:border-zinc-800/80 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
          <div className="w-8 h-8 border-3 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-semibold">Compiling monthly snapshot...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-900/30 rounded-2xl p-6 text-center text-rose-700 dark:text-rose-400">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-rose-500" />
          <h4 className="font-bold text-sm font-display">Compilation Error</h4>
          <p className="text-xs mt-1 font-semibold">{error}</p>
        </div>
      ) : reportData ? (
        <div className="space-y-6">
          
          {/* Key Metrics Financial Summaries Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Opening Balance */}
            <div className="bg-white dark:bg-zinc-900 border border-[#EEF2F7] dark:border-zinc-800/80 rounded-2xl p-4.5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-28">
              <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
                <Wallet className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider font-display">Opening</span>
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white truncate font-mono">
                {formatCurrency(reportData.openingBalance)}
              </h3>
            </div>

            {/* Total Income */}
            <div className="bg-white dark:bg-zinc-900 border border-[#EEF2F7] dark:border-zinc-800/80 rounded-2xl p-4.5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-28">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider font-display">Total Income</span>
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white truncate font-mono">
                {formatCurrency(reportData.totalIncome)}
              </h3>
            </div>

            {/* Total Expenses */}
            <div className="bg-white dark:bg-zinc-900 border border-[#EEF2F7] dark:border-zinc-800/80 rounded-2xl p-4.5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-28">
              <div className="flex items-center gap-2 text-rose-500 dark:text-rose-400">
                <TrendingDown className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider font-display">Expenses</span>
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white truncate font-mono">
                {formatCurrency(reportData.totalExpenses)}
              </h3>
            </div>

            {/* Net Savings */}
            <div className="bg-white dark:bg-zinc-900 border border-[#EEF2F7] dark:border-zinc-800/80 rounded-2xl p-4.5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-28">
              <div className={`flex items-center gap-2 ${reportData.savings >= 0 ? "text-violet-600 dark:text-violet-400" : "text-amber-500"}`}>
                <PiggyBank className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider font-display">Savings</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white truncate font-mono">
                  {formatCurrency(reportData.savings)}
                </h3>
                {reportData.totalIncome > 0 && reportData.savings >= 0 && (
                  <p className="text-[8px] font-bold text-emerald-600 mt-0.5">
                    Saved {Math.round((reportData.savings / reportData.totalIncome) * 100)}% of income
                  </p>
                )}
              </div>
            </div>

            {/* Ending Balance */}
            <div className="col-span-2 lg:col-span-1 bg-white dark:bg-zinc-900 border border-[#EEF2F7] dark:border-zinc-800/80 rounded-2xl p-4.5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-28">
              <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400">
                <Wallet className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider font-display">Ending Balance</span>
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white truncate font-mono">
                {formatCurrency(reportData.endingBalance)}
              </h3>
            </div>
          </div>

          {/* Visual Category Breakdown Donut Chart */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 bg-white dark:bg-zinc-900 border border-[#EEF2F7] dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-200">Expense Breakdown</h3>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-550 font-bold uppercase tracking-wider font-display">Expenses by category</p>
              </div>

              {!reportData.categoryBreakdown?.length ? (
                <div className="h-44 flex flex-col items-center justify-center gap-2 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-400 dark:text-zinc-500">
                  <AlertCircle className="w-6 h-6 text-zinc-300" />
                  <span className="text-xs font-semibold">No expenses in this month.</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center relative py-4">
                  {renderDonutChart(reportData.categoryBreakdown)}
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-display">Total Spent</span>
                    <span className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200 font-mono mt-0.5">
                      {formatCurrency(reportData.totalExpenses)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Legends list */}
            <div className="md:col-span-2 bg-white dark:bg-zinc-900 border border-[#EEF2F7] dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-200">Category Breakdown Details</h3>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-550 font-bold uppercase tracking-wider font-display">Expense segments</p>
              </div>

              {!reportData.categoryBreakdown?.length ? (
                <div className="flex-1 flex items-center justify-center text-xs font-semibold text-zinc-400 dark:text-zinc-500 py-10">
                  Zero outflow transactions for this month.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-4 max-h-48 overflow-y-auto pr-1">
                  {reportData.categoryBreakdown.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs font-bold text-zinc-800 dark:text-zinc-300 p-2.5 bg-zinc-50/50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200/40 dark:border-zinc-800/40">
                      <span className="flex items-center gap-1.5 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="truncate">{item.name}</span>
                      </span>
                      <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500 shrink-0">
                        {item.percentage}% ({formatCurrency(item.total)})
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Transactions List for selected Month */}
          <div className="bg-white dark:bg-zinc-900 border border-[#EEF2F7] dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-200 font-display">Monthly Transactions Log</h3>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">
                Showing all records for {monthNames[month - 1]} {year} ({reportData.transactions?.length || 0} total)
              </p>
            </div>

            {!reportData.transactions?.length ? (
              <div className="border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-10 text-center text-zinc-400 dark:text-zinc-500">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
                <h4 className="font-semibold text-xs text-zinc-500">No transactions recorded in this period</h4>
                <button
                  onClick={() => onOpenTransactionModal("Expense", null, getSelectedMonthDefaultDate())}
                  className="mt-3 text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Record first transaction
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {reportData.transactions.map((tx) => (
                  <div
                    key={tx._id}
                    className="group flex items-center justify-between p-3.5 bg-zinc-50/50 dark:bg-zinc-800/40 border border-zinc-200/40 dark:border-zinc-800/40 rounded-2xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-bold font-mono text-white shrink-0 shadow-inner"
                        style={{ backgroundColor: tx.category?.color || "#8B5CF6" }}
                      >
                        {tx.type === "Transfer" ? "TR" : tx.category?.name?.charAt(0).toUpperCase() || "UN"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-zinc-900 dark:text-zinc-200 truncate">
                          {tx.type === "Transfer"
                            ? `Transfer: ${tx.account?.name} → ${tx.destinationAccount?.name}`
                            : tx.description || tx.category?.name || "Uncategorized"}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 font-mono">
                            {getFriendlyDate(tx.date)}
                          </span>
                          <span className="text-[9px] font-bold text-violet-600 dark:text-violet-400 px-1.5 py-0.5 bg-violet-50 dark:bg-violet-950/20 rounded-full">
                            {tx.account?.name}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-xs font-bold font-mono ${
                        tx.type === "Income"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : tx.type === "Expense"
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-violet-600 dark:text-violet-400"
                      }`}>
                        {tx.type === "Income" ? "+" : tx.type === "Expense" ? "-" : ""}
                        {formatCurrency(tx.amount)}
                      </span>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => onOpenTransactionModal(tx.type, tx)}
                          className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg cursor-pointer transition-all"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteTransaction(tx._id)}
                          className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500 rounded-lg cursor-pointer transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      ) : null}
    </div>
  );
};

export default ReportsPanel;
