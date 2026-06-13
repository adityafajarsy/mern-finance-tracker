import { ArrowUpRight, ArrowDownRight, PlusCircle, ArrowLeftRight, Calendar, TrendingUp, TrendingDown } from "lucide-react";

const DashboardOverview = ({ summary, user, onSetActiveTab, onOpenTransactionModal }) => {
  const formatCurrency = (amount) => {
    const currencySymbol = "Rp ";
    const formatted = Math.abs(amount).toLocaleString("id-ID");
    return `${amount < 0 ? "-" : ""}${currencySymbol}${formatted}`;
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const currentMonth = summary?.currentMonth || { income: 0, expense: 0, netSavings: 0 };
  const prevMonth = summary?.prevMonth || { income: 0, expense: 0 };

  const calcPercentShift = (curr, prev) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return Math.round(((curr - prev) / Math.abs(prev)) * 100);
  };

  const incomeShift = calcPercentShift(currentMonth.income, prevMonth.income);
  const expenseShift = calcPercentShift(currentMonth.expense, prevMonth.expense);
  const prevNetSavings = prevMonth.income - prevMonth.expense;
  const savingsShift = calcPercentShift(currentMonth.netSavings, prevNetSavings);

  return (
    <div className="space-y-6">
      
      {/* Top Banner Card: Total Balance (Responsive Adaptive Card Style) */}
      <div className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-2xl p-6 shadow-sm hover:shadow-md dark:shadow-xl relative overflow-hidden transition-all duration-300 border border-[#EEF2F7] dark:border-zinc-850 select-none">
        <div className="absolute top-0 right-0 w-48 h-48 bg-violet-600/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col justify-between h-full">
          <div>
            <p className="text-zinc-450 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Total Wealth Balance</p>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight mt-2 font-mono">
              {formatCurrency(summary?.totalBalance || 0)}
            </h1>
          </div>
          <div className="flex justify-between items-center mt-8 border-t border-zinc-100 dark:border-zinc-900 pt-4">
            <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-550 uppercase tracking-wider">Vault Registry Active</span>
            <button 
              onClick={() => onSetActiveTab("accounts")}
              className="text-xs font-bold bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-850 hover:text-zinc-900 dark:hover:text-white px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              Manage Accounts
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Income & Expense Splitted Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Monthly Income Card */}
        <div className="bg-white dark:bg-zinc-900 border border-[#EEF2F7] dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100/10 dark:border-emerald-900/10 flex items-center justify-center shadow-xs">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <div>
                <p className="text-zinc-400 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Income This Month</p>
                <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1 font-mono tracking-tight">
                  {formatCurrency(currentMonth.income)}
                </h3>
              </div>
            </div>
            
            {/* Floating Status Pill */}
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-xl shadow-2xs border ${
              incomeShift >= 0 
                ? "bg-emerald-50/50 text-emerald-700 border-emerald-100/30 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/20" 
                : "bg-rose-50/50 text-rose-700 border-rose-100/30 dark:bg-rose-950/20 dark:text-rose-450 dark:border-rose-900/20"
            }`}>
              {incomeShift >= 0 ? "↑" : "↓"} {Math.abs(incomeShift)}%
            </span>
          </div>
        </div>

        {/* Monthly Expense Card */}
        <div className="bg-white dark:bg-zinc-900 border border-[#EEF2F7] dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-100/10 dark:border-rose-900/10 flex items-center justify-center shadow-xs">
                <ArrowDownRight className="w-5 h-5" />
              </div>
              <div>
                <p className="text-zinc-400 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Expenses This Month</p>
                <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1 font-mono tracking-tight">
                  {formatCurrency(currentMonth.expense)}
                </h3>
              </div>
            </div>
            
            {/* Floating Status Pill */}
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-xl shadow-2xs border ${
              expenseShift <= 0 
                ? "bg-emerald-50/50 text-emerald-700 border-emerald-100/30 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/20" 
                : "bg-rose-50/50 text-rose-700 border-rose-100/30 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/20"
            }`}>
              {expenseShift >= 0 ? "↑" : "↓"} {Math.abs(expenseShift)}%
            </span>
          </div>
        </div>
      </div>

      {/* Net Monthly Savings Card with Bright Green Gradient Icon */}
      <div className="p-5 rounded-2xl border border-emerald-500/15 dark:border-emerald-500/20 bg-white dark:bg-zinc-900 bg-gradient-to-r from-emerald-500/[0.04] to-teal-500/[0.02] flex items-center justify-between transition-all duration-300 relative overflow-hidden group shadow-sm hover:shadow-md">
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 dark:from-emerald-500 dark:to-teal-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/15 dark:shadow-none transition-transform duration-300 group-hover:scale-105">
            {savingsShift >= 0 ? (
              <TrendingUp className="w-5 h-5" />
            ) : (
              <TrendingDown className="w-5 h-5" />
            )}
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 opacity-90 font-display">Monthly Net Savings</p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-lg font-extrabold font-mono text-zinc-900 dark:text-white">
                {formatCurrency(currentMonth.netSavings)}
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-lg flex items-center gap-0.5 ${
                savingsShift >= 0 
                  ? "bg-emerald-100/70 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" 
                  : "bg-rose-100/70 text-rose-700 dark:bg-rose-950/40 dark:text-rose-450"
              }`}>
                {savingsShift >= 0 ? "+" : ""}{savingsShift}%
              </span>
              <span className="text-zinc-400 dark:text-zinc-500 text-[10px] font-medium">
                vs last month
              </span>
            </div>
          </div>
        </div>
        <span className={`text-[10px] font-bold px-2.5 py-1 bg-white/60 dark:bg-zinc-900/60 border rounded-xl shrink-0 ${
          currentMonth.netSavings >= 0 
            ? "text-emerald-700 dark:text-emerald-400 border-emerald-500/25" 
            : "text-amber-700 dark:text-amber-400 border-amber-500/25"
        }`}>
          {currentMonth.netSavings >= 0 ? "Under budget" : "Over budget"}
        </span>
      </div>

      {/* Quick Transaction Action buttons */}
      <div>
        <h4 className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 mb-3 uppercase tracking-widest pl-1">Quick Actions</h4>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => onOpenTransactionModal("Income")}
            className="flex flex-col items-center gap-2.5 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800 shadow-2xs transition-all cursor-pointer text-center text-emerald-600 dark:text-emerald-400"
          >
            <PlusCircle className="w-5.5 h-5.5" />
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Add Income</span>
          </button>
          
          <button
            onClick={() => onOpenTransactionModal("Expense")}
            className="flex flex-col items-center gap-2.5 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800 shadow-2xs transition-all cursor-pointer text-center text-rose-500 dark:text-rose-400"
          >
            <PlusCircle className="w-5.5 h-5.5" />
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Add Expense</span>
          </button>

          <button
            onClick={() => onOpenTransactionModal("Transfer")}
            className="flex flex-col items-center gap-2.5 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800 shadow-2xs transition-all cursor-pointer text-center text-violet-600 dark:text-violet-400"
          >
            <ArrowLeftRight className="w-5.5 h-5.5" />
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-350">Transfer</span>
          </button>
        </div>
      </div>

      {/* Recent Activity List */}
      <div>
        <div className="flex justify-between items-center mb-3 px-1">
          <h4 className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Recent Activity</h4>
          <button
            onClick={() => onSetActiveTab("transactions")}
            className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline cursor-pointer"
          >
            View All
          </button>
        </div>

        <div className="space-y-2.5">
          {!summary?.recentTransactions?.length ? (
            <div className="bg-white dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-850 rounded-3xl p-8 text-center text-zinc-400 dark:text-zinc-500 text-xs font-semibold">
              No transactions added yet. Click one of the buttons above to get started!
            </div>
          ) : (
            summary.recentTransactions.map((tx) => (
              <div
                key={tx._id}
                className="flex items-center justify-between p-3.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl shadow-2xs hover:shadow-xs transition-all duration-300"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div 
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-bold font-mono text-white shrink-0 shadow-inner"
                    style={{ backgroundColor: tx.category?.color || "#6B7280" }}
                  >
                    {tx.type === "Transfer" ? "TR" : tx.category?.name?.charAt(0).toUpperCase() || "UN"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">
                      {tx.type === "Transfer" 
                        ? `Transfer: ${tx.account?.name} → ${tx.destinationAccount?.name}` 
                        : tx.description || tx.category?.name || "Uncategorized"}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 flex items-center gap-1 shrink-0">
                        <Calendar className="w-3 h-3" />
                        {formatDate(tx.date)}
                      </span>
                      <span className="text-[9px] font-semibold text-violet-600 dark:text-violet-400 px-1.5 py-0.5 bg-violet-50 dark:bg-violet-950/20 border border-violet-100/20 dark:border-violet-900/10 rounded-lg truncate">
                        {tx.account?.name || "Account"}
                      </span>
                    </div>
                  </div>
                </div>
                <span className={`text-xs font-extrabold font-mono shrink-0 ${
                  tx.type === "Income" 
                    ? "text-emerald-600 dark:text-emerald-400" 
                    : tx.type === "Expense" 
                    ? "text-rose-600 dark:text-rose-400" 
                    : "text-violet-600 dark:text-violet-400"
                }`}>
                  {tx.type === "Income" ? "+" : tx.type === "Expense" ? "-" : ""}
                  {formatCurrency(tx.amount)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
