import { useState, useEffect } from "react";
import { 
  X, 
  Search, 
  Trash2, 
  Edit2, 
  Calendar, 
  Tag, 
  Landmark, 
  Filter,
  ArrowDownRight,
  ArrowUpRight,
  ArrowLeftRight
} from "lucide-react";

const LedgerModal = ({
  isOpen,
  onClose,
  accounts = [],
  categories = [],
  authFetch,
  onEditTransaction,
  onDeleteTransaction,
  initialAccountId = null,
}) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterAccount, setFilterAccount] = useState(initialAccountId || "");
  const [filterCategory, setFilterCategory] = useState("");

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (filterType) params.append("type", filterType);
      if (filterAccount) params.append("account", filterAccount);
      if (filterCategory) params.append("category", filterCategory);

      const res = await authFetch(`/api/transactions?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setFilterAccount(initialAccountId || "");
      fetchTransactions();
    }
  }, [isOpen, initialAccountId, search, filterType, filterAccount, filterCategory]);

  if (!isOpen) return null;

  const formatCurrency = (val) => {
    return `Rp ${Math.abs(val || 0).toLocaleString("id-ID")}`;
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden animate-scale-up flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-zinc-150 dark:border-zinc-800 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight font-display">
              Transaction Ledger
            </h3>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              Audit and inspect complete transaction history
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-850/40 border-b border-zinc-150 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-4 gap-2">
          {/* Search */}
          <div className="relative sm:col-span-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-2 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-600"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="p-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-zinc-900 dark:text-white cursor-pointer"
          >
            <option value="">All Types</option>
            <option value="Expense">Expense</option>
            <option value="Income">Income</option>
            <option value="Transfer">Transfer</option>
          </select>

          {/* Account Filter */}
          <select
            value={filterAccount}
            onChange={(e) => setFilterAccount(e.target.value)}
            className="p-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-zinc-900 dark:text-white cursor-pointer"
          >
            <option value="">All Accounts</option>
            {accounts.map((a) => (
              <option key={a._id} value={a._id}>{a.name}</option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="p-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-zinc-900 dark:text-white cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Transaction Rows List */}
        <div className="flex-1 p-6 overflow-y-auto space-y-2.5">
          {loading ? (
            <div className="p-12 text-center text-xs text-zinc-400">Loading ledger...</div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center text-xs text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
              No transactions found matching the filter criteria.
            </div>
          ) : (
            transactions.map((tx) => (
              <div
                key={tx._id}
                className="flex items-center justify-between p-3.5 bg-white dark:bg-zinc-900 border border-[#EEF2F7] dark:border-zinc-800 rounded-2xl shadow-2xs hover:shadow-xs transition-all duration-200"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-mono font-bold text-white shrink-0 shadow-inner"
                    style={{ backgroundColor: tx.category?.color || (tx.type === "Transfer" ? "#7C3AED" : "#6B7280") }}
                  >
                    {tx.type === "Income" ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : tx.type === "Expense" ? (
                      <ArrowDownRight className="w-4 h-4" />
                    ) : (
                      <ArrowLeftRight className="w-4 h-4" />
                    )}
                  </div>
                  
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {tx.type === "Transfer"
                        ? `${tx.account?.name} → ${tx.destinationAccount?.name}`
                        : tx.description || tx.category?.name || "Transaction"}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] font-bold text-zinc-400 flex items-center gap-0.5">
                        <Calendar className="w-2.5 h-2.5" />
                        {formatDate(tx.date)}
                      </span>
                      <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 truncate">
                        {tx.account?.name}
                      </span>
                      {tx.category && (
                        <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-md bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 truncate">
                          {tx.category?.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-xs font-black font-mono ${
                    tx.type === "Income"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : tx.type === "Expense"
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-violet-600 dark:text-violet-400"
                  }`}>
                    {tx.type === "Income" ? "+" : tx.type === "Expense" ? "-" : ""}
                    {formatCurrency(tx.amount)}
                  </span>

                  <button
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this transaction? Balance will be reverted.")) {
                        onDeleteTransaction(tx._id);
                        fetchTransactions();
                      }
                    }}
                    className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-all cursor-pointer"
                    title="Delete Transaction"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LedgerModal;
