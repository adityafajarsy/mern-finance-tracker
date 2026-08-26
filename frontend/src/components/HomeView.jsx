import { useState } from "react";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  ArrowLeftRight, 
  Plus, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  ChevronRight,
  Flame,
  ArrowRight,
  Sparkles,
  Search,
  SlidersHorizontal,
  Landmark,
  Wallet,
  Coins
} from "lucide-react";
import MobileHeroWave from "./ui/MobileHeroWave";

const HomeView = ({
  summary,
  accounts = [],
  onOpenCapture,
  onOpenLedger,
  onSetActiveTab,
  formatCurrency,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAccountFilter, setSelectedAccountFilter] = useState(null);

  const currentMonthData = summary?.currentMonth || {
    income: 0,
    expense: 0,
    netSavings: 0,
    savingsRate: 0,
    incomeShift: 0,
    expenseShift: 0,
    savingsShift: 0,
  };

  const totalWealth = summary?.totalWealthBalance || accounts.reduce((acc, curr) => acc + curr.balance, 0);
  const forecast = summary?.forecast;
  const recommendation = summary?.recommendations?.[0];
  const savingsRate = currentMonthData?.savingsRate !== undefined && currentMonthData?.savingsRate !== null
    ? currentMonthData.savingsRate
    : (currentMonthData.income > 0 ? Math.max(0, Math.round((currentMonthData.netSavings / currentMonthData.income) * 100)) : 0);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "GOOD MORNING";
    if (hour < 17) return "GOOD AFTERNOON";
    return "GOOD EVENING";
  };

  // Group transactions by Date label (Hari Ini, Kemarin, Tanggal)
  const groupTransactionsByDate = (txs = []) => {
    const groups = {};
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

    // Filter by search and selected account chip if any
    const filtered = txs.filter((tx) => {
      const desc = (tx.description || tx.category?.name || "").toLowerCase();
      const accName = (tx.account?.name || "").toLowerCase();
      const destAccName = (tx.destinationAccount?.name || "").toLowerCase();
      const matchesSearch = !searchQuery.trim() || desc.includes(searchQuery.toLowerCase()) || accName.includes(searchQuery.toLowerCase());
      const matchesAccount = !selectedAccountFilter || String(tx.account?._id || tx.account) === String(selectedAccountFilter) || String(tx.destinationAccount?._id || tx.destinationAccount) === String(selectedAccountFilter);
      return matchesSearch && matchesAccount;
    });

    filtered.forEach((tx) => {
      const rawDate = tx.date || tx.createdAt;
      const cleanDate = typeof rawDate === "string" ? rawDate.split("T")[0] : rawDate.toISOString().split("T")[0];
      const [y, m, d] = cleanDate.split("-").map(Number);
      const dateObj = new Date(y, m - 1, d);

      let label = dateObj.toLocaleDateString("id-ID", { day: "numeric", month: "long" }).toUpperCase();
      if (cleanDate === todayStr) {
        label = "TODAY";
      } else if (cleanDate === yesterdayStr) {
        label = "YESTERDAY";
      }

      if (!groups[label]) groups[label] = [];
      groups[label].push(tx);
    });

    return groups;
  };

  const recentList = summary?.recentTransactions || [];
  const groupedRecent = groupTransactionsByDate(recentList.slice(0, 10));

  const formatTimeOnly = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const getAccountIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "bank":
        return <Landmark className="w-3.5 h-3.5" />;
      case "e-wallet":
      case "wallet":
        return <Wallet className="w-3.5 h-3.5" />;
      default:
        return <Coins className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in font-sans max-w-2xl mx-auto pb-10">
      
      {/* ========================================================================= */}
      {/* 01 — FINANCIAL HERO & ORGANIC WAVE                                        */}
      {/* ========================================================================= */}
      <section className="relative pt-2 pb-1 overflow-hidden">
        {/* Subtle Horizontal Animated Wave flowing behind balance */}
        <div className="absolute -top-3 left-0 right-0 h-32 opacity-70 pointer-events-none -z-0">
          <MobileHeroWave className="animate-wave-drift" />
        </div>

        <div className="relative z-10 space-y-1.5">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#1C5F4D] dark:text-[#88C8AC]">
            {getGreeting()}
          </p>

          <p className="text-xs font-medium text-[#1C5F4D] dark:text-[#88C8AC]">
            You currently have
          </p>

          <h1 className="text-4xl sm:text-5xl font-black font-display tracking-tight text-[#08241B] dark:text-white tabular-nums">
            {formatCurrency(totalWealth)}
          </h1>

          <div className="flex items-center gap-2 pt-0.5 text-xs text-[#1C5F4D] dark:text-[#88C8AC]">
            <span>Across {accounts.length} registered {accounts.length === 1 ? "account" : "accounts"}</span>
            <span>·</span>
            <button
              onClick={() => onSetActiveTab("accounts")}
              className="text-[#00A86B] font-bold hover:underline cursor-pointer flex items-center gap-0.5"
            >
              <span>View breakdown</span>
              <ArrowRight className="w-3 h-3 inline" />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 02 — ONE DOMINANT CONTEXTUAL INSIGHT PILL                                 */}
      {/* ========================================================================= */}
      <section>
        <button
          onClick={() => onSetActiveTab("insights")}
          className="w-full bg-white/80 dark:bg-[#09261E]/90 border border-[#D1EADE] dark:border-[#14382C] rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 text-left hover:border-[#00A86B]/60 transition-all shadow-2xs group cursor-pointer"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-7 h-7 rounded-xl bg-[#00A86B]/15 text-[#00A86B] flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <p className="text-xs font-bold text-[#09261E] dark:text-white truncate">
              {recommendation?.title || `You saved ${savingsRate}% of your income this month`}
            </p>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-bold text-[#00A86B] shrink-0">
            <span className="hidden sm:inline">View Insights</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>
      </section>

      {/* ========================================================================= */}
      {/* 03 — COMPACT MONTHLY SNAPSHOT (HORIZONTAL EDITORIAL STRIP)                 */}
      {/* ========================================================================= */}
      <section className="bg-white/80 dark:bg-[#09261E]/80 border border-[#D1EADE] dark:border-[#14382C] rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-widest text-[#1C5F4D] dark:text-[#88C8AC]">
          <span>This Month</span>
          <span>{new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
        </div>

        <div className="grid grid-cols-3 gap-2 divide-x divide-[#D1EADE]/70 dark:divide-[#14382C]">
          
          {/* Income Column */}
          <div className="space-y-0.5 pr-2">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#1C5F4D] dark:text-[#88C8AC]">
              Income
            </span>
            <p className="text-sm sm:text-base font-black font-display text-[#08241B] dark:text-white tabular-nums truncate">
              {formatCurrency(currentMonthData.income)}
            </p>
            <p className="text-[9px] text-[#1C5F4D] dark:text-[#88C8AC] truncate">
              {currentMonthData.incomeShift >= 0 ? "↑" : "↓"} {Math.abs(currentMonthData.incomeShift || 0)}% vs last mo
            </p>
          </div>

          {/* Spent Column */}
          <div className="space-y-0.5 px-2">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#1C5F4D] dark:text-[#88C8AC]">
              Spent
            </span>
            <p className="text-sm sm:text-base font-black font-display text-[#08241B] dark:text-white tabular-nums truncate">
              {formatCurrency(currentMonthData.expense)}
            </p>
            <p className="text-[9px] text-[#1C5F4D] dark:text-[#88C8AC] truncate">
              {currentMonthData.expenseShift >= 0 ? "↑" : "↓"} {Math.abs(currentMonthData.expenseShift || 0)}% vs last mo
            </p>
          </div>

          {/* Saved Column (Strongest Accent) */}
          <div className="space-y-0.5 pl-2">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#00A86B]">
              Saved
            </span>
            <p className="text-sm sm:text-base font-black font-display text-[#00A86B] tabular-nums truncate">
              {formatCurrency(currentMonthData.netSavings)}
            </p>
            <p className="text-[9px] font-semibold text-[#00A86B] truncate">
              {savingsRate}% savings
            </p>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 04 — COMPACT SIGNATURE FORECAST SURFACE                                   */}
      {/* ========================================================================= */}
      {forecast && (
        <section className="bg-gradient-to-br from-[#0B2C22] to-[#04140E] text-[#E8F5EE] rounded-2xl p-4 sm:p-5 shadow-lg shadow-[#08241B]/10 relative overflow-hidden space-y-2.5">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#88C8AC] relative z-10">
            <span className="font-extrabold uppercase tracking-widest text-[#00A86B] flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-[#00A86B]" />
              Before Payday Forecast
            </span>
            <span className="bg-white/10 px-2 py-0.5 rounded-full text-[9px]">
              {forecast.daysRemaining} days left · Day {forecast.daysElapsed}/{forecast.daysInMonth}
            </span>
          </div>

          <div className="relative z-10 flex items-baseline justify-between gap-2">
            <div>
              <p className="text-[10px] text-[#88C8AC] font-medium">
                Estimated month-end balance
              </p>
              <h3 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white tabular-nums">
                {formatCurrency(forecast.estimatedEndOfMonthBalance)}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-[9px] text-[#88C8AC] block">Daily burn pace</span>
              <span className="text-xs font-bold font-mono text-white">{formatCurrency(forecast.dailyBurnRate)}/day</span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-[#88C8AC] relative z-10">
            <button
              onClick={() => onSetActiveTab("insights")}
              className="text-[#00A86B] hover:text-[#10B981] text-[11px] font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>See complete forecast projection</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 05 — ACTIVITY STREAM (ACTIVITY-FIRST COMPOSITION WITH SEARCH & FILTER)      */}
      {/* ========================================================================= */}
      <section className="bg-white dark:bg-[#09261E] rounded-3xl border border-[#D1EADE] dark:border-[#14382C] p-4 sm:p-5 space-y-4 shadow-xs">
        
        {/* Quick Accounts Chips Horizontal Bar */}
        {accounts.length > 0 && (
          <div className="space-y-2 pb-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#1C5F4D] dark:text-[#88C8AC]">
                Accounts
              </span>
              <button
                onClick={() => onSetActiveTab("accounts")}
                className="text-[10px] font-bold text-[#00A86B] hover:underline cursor-pointer"
              >
                Manage
              </button>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 select-none no-scrollbar">
              <button
                onClick={() => setSelectedAccountFilter(null)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedAccountFilter === null
                    ? "bg-[#00A86B] text-white shadow-2xs"
                    : "bg-[#F4FAF6] dark:bg-[#071913] text-[#1C5F4D] dark:text-[#88C8AC] border border-[#D1EADE]/80 dark:border-[#14382C]"
                }`}
              >
                <span>All</span>
              </button>

              {accounts.map((acc) => {
                const isSelected = selectedAccountFilter === acc._id;
                return (
                  <button
                    key={acc._id}
                    onClick={() => setSelectedAccountFilter(isSelected ? null : acc._id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-[#00A86B] text-white shadow-2xs"
                        : "bg-[#F4FAF6] dark:bg-[#071913] text-[#09261E] dark:text-white border border-[#D1EADE]/80 dark:border-[#14382C]"
                    }`}
                  >
                    <span className="opacity-70">{getAccountIcon(acc.type)}</span>
                    <span>{acc.name}</span>
                    <span className="font-mono text-[10px] opacity-80">({formatCurrency(acc.balance)})</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Section Heading with Search & History */}
        <div className="pt-2 border-t border-[#D1EADE]/60 dark:border-[#14382C] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-black font-display text-[#09261E] dark:text-white uppercase tracking-wider">
              Recent Activity
            </span>
            <button
              onClick={onOpenLedger}
              className="text-xs font-bold text-[#00A86B] hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>History</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Integrated Compact Search Bar */}
          <div className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search transactions..."
                className="w-full pl-8 pr-3 py-1.5 bg-[#F4FAF6] dark:bg-[#071913] border border-[#D1EADE]/80 dark:border-[#14382C] rounded-xl text-xs font-medium text-[#09261E] dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#00A86B]"
              />
            </div>
            <button
              onClick={onOpenLedger}
              className="p-2 rounded-xl bg-[#F4FAF6] dark:bg-[#071913] border border-[#D1EADE]/80 dark:border-[#14382C] text-[#1C5F4D] dark:text-[#88C8AC] hover:text-[#00A86B] cursor-pointer"
              title="Filter & History"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Chronological Activity List with Date Separators */}
        {Object.keys(groupedRecent).length === 0 ? (
          <div className="py-8 text-center text-xs text-[#1C5F4D] dark:text-[#88C8AC]">
            No transactions found. Capture your first transaction with the button below!
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            {Object.entries(groupedRecent).map(([dateLabel, txs]) => (
              <div key={dateLabel} className="space-y-2">
                <p className="text-[10px] font-extrabold tracking-widest text-[#1C5F4D] dark:text-[#88C8AC] uppercase">
                  {dateLabel}
                </p>

                <div className="divide-y divide-[#D1EADE]/50 dark:divide-[#14382C]">
                  {txs.map((tx) => (
                    <div
                      key={tx._id}
                      className="py-2.5 flex items-center justify-between hover:bg-[#F4FAF6]/60 dark:hover:bg-[#08241B]/40 px-1 rounded-xl transition-colors cursor-pointer"
                      onClick={onOpenLedger}
                    >
                      <div className="min-w-0 flex items-center gap-3">
                        {/* Circular Icon with Soft Colored Background */}
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: `${tx.category?.color || (tx.type === "Transfer" ? "#00A86B" : "#1C5F4D")}18`,
                            color: tx.category?.color || (tx.type === "Transfer" ? "#00A86B" : "#1C5F4D"),
                          }}
                        >
                          {tx.type === "Income" ? (
                            <ArrowDownRight className="w-4 h-4 text-emerald-600 rotate-180" />
                          ) : tx.type === "Transfer" ? (
                            <ArrowLeftRight className="w-4 h-4 text-blue-600" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#08241B] dark:text-white truncate">
                            {tx.type === "Transfer"
                              ? `${tx.account?.name} → ${tx.destinationAccount?.name}`
                              : tx.description || tx.category?.name || "Transaction"}
                          </p>
                          <p className="text-[10px] text-[#1C5F4D] dark:text-[#88C8AC] mt-0.5 truncate">
                            {tx.category?.name ? `${tx.category.name} · ` : ""}
                            {tx.account?.name} · {formatTimeOnly(tx.date || tx.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0 pl-3">
                        <span className={`text-xs font-black font-mono ${
                          tx.type === "Income"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : tx.type === "Transfer"
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-[#08241B] dark:text-white"
                        }`}>
                          {tx.type === "Income" ? "+" : tx.type === "Expense" ? "−" : ""}
                          {formatCurrency(tx.amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
};

export default HomeView;
