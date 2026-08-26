import { useState, useEffect } from "react";
import { Search, Calendar, Filter, Plus, Trash2, Edit2, ChevronLeft, ChevronRight, X, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const TransactionsPanel = ({
  accounts,
  categories,
  onOpenTransactionModal,
  onDeleteTransaction,
  onSetActiveTab,
}) => {
  const { authFetch, user, handleResponse } = useAuth();

  // Query states
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  
  // Results states
  const [transactions, setTransactions] = useState([]);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const formatCurrency = (amount) => {
    return `Rp ${Math.abs(amount).toLocaleString("id-ID")}`;
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 15,
        search,
        type,
        category,
        startDate,
        endDate,
      });

      const res = await authFetch(`/api/transactions?${params}`);
      const data = await handleResponse(res, "Error fetching transactions");
      setTransactions(data.transactions);
      setPages(data.pages);
      setTotal(data.total);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch transactions on query change
  useEffect(() => {
    fetchTransactions();
  }, [page, type, category, startDate, endDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  const handleResetFilters = () => {
    setSearch("");
    setType("");
    setCategory("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  // Group transactions by Date: YYYY-MM-DD
  const groupTransactionsByDate = (txList) => {
    const groups = {};
    txList.forEach((tx) => {
      const dateStr = new Date(tx.date).toISOString().split("T")[0];
      if (!groups[dateStr]) {
        groups[dateStr] = {
          date: new Date(tx.date),
          items: [],
          dailyIncome: 0,
          dailyExpense: 0,
        };
      }
      groups[dateStr].items.push(tx);
      if (tx.type === "Income") {
        groups[dateStr].dailyIncome += tx.amount;
      } else if (tx.type === "Expense") {
        groups[dateStr].dailyExpense += tx.amount;
      }
    });
    return Object.values(groups).sort((a, b) => b.date - a.date);
  };

  const grouped = groupTransactionsByDate(transactions);

  const getFriendlyDateHeader = (dateObj) => {
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    const dateStr = dateObj.toISOString().split("T")[0];

    if (dateStr === today) return "Today";
    if (dateStr === yesterday) return "Yesterday";

    return dateObj.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {onSetActiveTab && (
        <button 
          onClick={() => onSetActiveTab("accounts")}
          className="flex items-center gap-1.5 text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline cursor-pointer transition-all active:scale-95 w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Accounts
        </button>
      )}

      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight font-display">Transactions</h2>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">{total} transactions recorded</p>
        </div>
        <button
          onClick={() => onOpenTransactionModal("Expense")}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-violet-500/20 cursor-pointer transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          Add Transaction
        </button>
      </div>

      {/* Query Search Form */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search description..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-600 dark:focus:ring-violet-500 transition-all font-medium"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-2xl text-sm font-semibold cursor-pointer transition-all duration-200"
        >
          Search
        </button>
      </form>

      {/* Advanced Filter Grid */}
      <div className="bg-white dark:bg-zinc-900 border border-[#EEF2F7] dark:border-zinc-800/80 rounded-2xl p-5 space-y-4 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <span className="text-xs font-bold text-zinc-800 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 font-display">
            <Filter className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
            Filters & Ranges
          </span>
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-zinc-400 dark:text-zinc-500 text-[10px] font-bold hover:underline flex items-center gap-1 cursor-pointer transition-all"
          >
            <X className="w-3 h-3" />
            Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Type Select */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">Transaction Type</label>
            <select
              value={type}
              onChange={(e) => { setType(e.target.value); setPage(1); }}
              className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-600 dark:focus:ring-violet-500 transition-all"
            >
              <option value="">All Types</option>
              <option value="Income">Income</option>
              <option value="Expense">Expense</option>
              <option value="Transfer">Transfer</option>
            </select>
          </div>

          {/* Category Select */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">Category</label>
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-600 dark:focus:ring-violet-500 transition-all"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.type === "Income" ? "📈" : "📉"} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-600 dark:focus:ring-violet-500 transition-all"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-600 dark:focus:ring-violet-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Date-Grouped Transaction List */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-10">
            <div className="w-8 h-8 border-3 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 font-semibold">Fetching transactions...</p>
          </div>
        ) : !transactions.length ? (
          <div className="bg-white dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-850 rounded-2xl p-10 text-center text-zinc-400 dark:text-zinc-500 font-medium">
            No matching transactions found with the active filters.
          </div>
        ) : (
          grouped.map((group, gIdx) => (
            <div key={gIdx} className="space-y-2.5">
              
              {/* Group Header showing Date & Day Total Balance Shifts */}
              <div className="flex justify-between items-center px-1">
                <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 tracking-wider font-display uppercase">
                  {getFriendlyDateHeader(group.date)}
                </h4>
                <div className="flex items-center gap-3 text-[10px] font-bold tracking-wider font-mono">
                  {group.dailyIncome > 0 && (
                    <span className="text-emerald-600 dark:text-emerald-400 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/20 rounded-md">
                      +{formatCurrency(group.dailyIncome)}
                    </span>
                  )}
                  {group.dailyExpense > 0 && (
                    <span className="text-rose-500 dark:text-rose-400 px-2 py-0.5 bg-rose-50 dark:bg-rose-950/20 rounded-md">
                      -{formatCurrency(group.dailyExpense)}
                    </span>
                  )}
                </div>
              </div>

              {/* Transactions List under Date Group */}
              <div className="space-y-2">
                {group.items.map((tx) => (
                  <div
                    key={tx._id}
                    className="group flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 rounded-2xl shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center gap-3">
                      
                      {/* Dot Color category identifier */}
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold font-mono text-white shrink-0 shadow-inner"
                        style={{ backgroundColor: tx.category?.color || "#8B5CF6" }}
                      >
                        {tx.type === "Transfer" ? "TR" : tx.category?.name?.charAt(0).toUpperCase() || "UN"}
                      </div>

                      <div>
                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-200">
                          {tx.type === "Transfer"
                            ? `Transfer: ${tx.account?.name} → ${tx.destinationAccount?.name}`
                            : tx.description || tx.category?.name || "Uncategorized"}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 px-2 py-0.5 bg-violet-50 dark:bg-violet-950/20 rounded-full">
                            {tx.account?.name}
                          </span>
                          {tx.category?.name && (
                            <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500">
                              {tx.category.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      
                      {/* Amount tag */}
                      <span className={`text-sm font-bold font-mono ${
                        tx.type === "Income"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : tx.type === "Expense"
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-violet-600 dark:text-violet-400"
                      }`}>
                        {tx.type === "Income" ? "+" : tx.type === "Expense" ? "-" : ""}
                        {formatCurrency(tx.amount)}
                      </span>

                      {/* CRUD Edit/Delete Trigger buttons (visible on hover/mobile-friendly) */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => onOpenTransactionModal(tx.type, tx)}
                          className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer transition-all"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteTransaction(tx._id)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg cursor-pointer transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {pages > 1 && (
        <div className="flex justify-between items-center pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            Page {page} of {pages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-700 dark:text-zinc-300 disabled:opacity-30 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-700 dark:text-zinc-300 disabled:opacity-30 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsPanel;
