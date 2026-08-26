import { useState, useEffect } from "react";
import { 
  X, 
  Search, 
  Trash2, 
  Edit3, 
  Calendar, 
  Clock, 
  Tag, 
  Landmark, 
  ArrowLeftRight,
  ArrowDownRight,
  ArrowUpRight,
  Check,
  AlertTriangle
} from "lucide-react";

const TransactionHistoryModal = ({
  isOpen,
  onClose,
  accounts = [],
  categories = [],
  authFetch,
  initialAccountId = null,
  onTransactionUpdated,
}) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterAccount, setFilterAccount] = useState(initialAccountId || "");
  const [filterCategory, setFilterCategory] = useState("");

  // Edit Transaction State
  const [editingTx, setEditingTx] = useState(null);
  const [editType, setEditType] = useState("Expense");
  const [editAmount, setEditAmount] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editAccountId, setEditAccountId] = useState("");
  const [editDestAccountId, setEditDestAccountId] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  // Delete Confirmation State
  const [deletingTx, setDeletingTx] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
      setEditingTx(null);
      setDeletingTx(null);
      fetchTransactions();
    }
  }, [isOpen, initialAccountId, search, filterType, filterAccount, filterCategory]);

  if (!isOpen) return null;

  const formatCurrency = (val) => {
    return `Rp ${Math.abs(val || 0).toLocaleString("id-ID")}`;
  };

  const formatFullTimestamp = (dateStr) => {
    if (!dateStr) return "";
    const cleanDate = typeof dateStr === "string" ? dateStr.split("T")[0] : dateStr.toISOString().split("T")[0];
    const [y, m, d] = cleanDate.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Group transactions by date heading
  const groupTransactions = (txList = []) => {
    const groups = {};
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

    txList.forEach((tx) => {
      const rawDate = tx.date || tx.createdAt;
      const cleanDate = typeof rawDate === "string" ? rawDate.split("T")[0] : rawDate.toISOString().split("T")[0];
      const [y, m, d] = cleanDate.split("-").map(Number);
      const dateObj = new Date(y, m - 1, d);

      let label = dateObj.toLocaleDateString("id-ID", { day: "numeric", month: "long" }).toUpperCase();
      let sublabel = String(y);

      if (cleanDate === todayStr) {
        label = "HARI INI";
        sublabel = dateObj.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }).toUpperCase();
      } else if (cleanDate === yesterdayStr) {
        label = "KEMARIN";
        sublabel = dateObj.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }).toUpperCase();
      }

      const key = `${label}|${sublabel}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(tx);
    });

    return groups;
  };

  const grouped = groupTransactions(transactions);

  const handleStartEdit = (tx) => {
    setEditingTx(tx);
    setEditError("");
    setEditType(tx.type);
    setEditAmount(tx.amount.toLocaleString("id-ID"));
    setEditDesc(tx.description || "");
    setEditAccountId(tx.account?._id || tx.account || "");
    setEditDestAccountId(tx.destinationAccount?._id || tx.destinationAccount || "");
    setEditCategoryId(tx.category?._id || tx.category || "");

    const rawDate = tx.date || tx.createdAt;
    const cleanDate = typeof rawDate === "string" ? rawDate.split("T")[0] : rawDate.toISOString().split("T")[0];
    setEditDate(cleanDate);
    setEditTime("12:00:00");
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setEditError("");

    const cleanAmt = parseFloat(String(editAmount).replace(/\./g, ""));
    if (isNaN(cleanAmt) || cleanAmt <= 0) {
      setEditError("Please enter a valid amount");
      return;
    }

    if (!editAccountId) {
      setEditError("Please select an account");
      return;
    }

    if (editType === "Transfer" && !editDestAccountId) {
      setEditError("Please select a destination account");
      return;
    }

    if (editType === "Transfer" && editAccountId === editDestAccountId) {
      setEditError("Source and destination accounts must be different");
      return;
    }

    const resolvedDate = editDate ? editDate.split("T")[0] : new Date().toISOString().split("T")[0];
    const combinedDateTime = `${resolvedDate}T12:00:00.000Z`;

    const payload = {
      type: editType,
      amount: cleanAmt,
      description: editDesc.trim() || (editType === "Transfer" ? "Transfer Dana" : "Transaksi"),
      date: combinedDateTime,
      account: editAccountId,
      destinationAccount: editType === "Transfer" ? editDestAccountId : undefined,
      category: editType === "Transfer" ? undefined : editCategoryId,
    };

    setIsSavingEdit(true);
    try {
      const res = await authFetch(`/api/transactions/${editingTx._id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to update transaction");
      }

      setEditingTx(null);
      await fetchTransactions();
      if (onTransactionUpdated) onTransactionUpdated();
    } catch (err) {
      setEditError(err.message || "Failed to save transaction changes");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingTx) return;
    setIsDeleting(true);
    try {
      const res = await authFetch(`/api/transactions/${deletingTx._id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeletingTx(null);
        await fetchTransactions();
        if (onTransactionUpdated) onTransactionUpdated();
      }
    } catch (err) {
      console.error("Error deleting transaction:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-fade-in font-sans">
      <div className="w-full max-w-2xl bg-white dark:bg-[#09261E] rounded-2xl shadow-2xl overflow-hidden animate-scale-up flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#D1EADE]/70 dark:border-[#14382C] flex justify-between items-center">
          <div>
            <h3 className="text-lg font-black text-[#09261E] dark:text-white tracking-tight font-display">
              Transaction History
            </h3>
            <p className="text-[11px] text-[#1C5F4D] dark:text-[#88C8AC]">
              Complete chronological audit timeline with exact seconds
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quiet Filter Strip */}
        <div className="px-6 py-2.5 bg-[#F4FAF6] dark:bg-[#071913]/60 border-b border-[#D1EADE]/70 dark:border-[#14382C] grid grid-cols-1 sm:grid-cols-4 gap-2">
          <div className="relative sm:col-span-1">
            <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-7 pr-2 py-1 bg-white dark:bg-[#09261E] border border-[#D1EADE] dark:border-[#14382C] rounded-lg text-xs font-medium text-[#09261E] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#00A86B]"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="p-1 bg-white dark:bg-[#09261E] border border-[#D1EADE] dark:border-[#14382C] rounded-lg text-xs font-medium text-[#09261E] dark:text-white cursor-pointer"
          >
            <option value="">All Types</option>
            <option value="Expense">Expense</option>
            <option value="Income">Income</option>
            <option value="Transfer">Transfer</option>
          </select>

          <select
            value={filterAccount}
            onChange={(e) => setFilterAccount(e.target.value)}
            className="p-1 bg-white dark:bg-[#09261E] border border-[#D1EADE] dark:border-[#14382C] rounded-lg text-xs font-medium text-[#09261E] dark:text-white cursor-pointer"
          >
            <option value="">All Accounts</option>
            {accounts.map((a) => (
              <option key={a._id} value={a._id}>{a.name}</option>
            ))}
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="p-1 bg-white dark:bg-[#09261E] border border-[#D1EADE] dark:border-[#14382C] rounded-lg text-xs font-medium text-[#09261E] dark:text-white cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Timeline Rows List */}
        <div className="flex-1 px-6 py-4 overflow-y-auto space-y-6">
          {loading ? (
            <div className="py-12 text-center text-xs text-zinc-400">Loading timeline...</div>
          ) : Object.keys(grouped).length === 0 ? (
            <div className="py-12 text-center text-xs text-[#1C5F4D] dark:text-[#88C8AC]">
              No transactions found matching the filter criteria.
            </div>
          ) : (
            Object.entries(grouped).map(([groupKey, txList]) => {
              const [label, sublabel] = groupKey.split("|");
              return (
                <div key={groupKey} className="space-y-2">
                  <div className="flex items-baseline gap-2 border-b border-[#D1EADE]/50 dark:border-[#14382C] pb-1">
                    <span className="text-[10px] font-extrabold tracking-widest text-[#09261E] dark:text-white uppercase">
                      {label}
                    </span>
                    <span className="text-[9px] text-[#1C5F4D] dark:text-[#88C8AC]">
                      {sublabel}
                    </span>
                  </div>

                  <div className="divide-y divide-[#D1EADE]/40 dark:divide-[#14382C]">
                    {txList.map((tx) => (
                      <div
                        key={tx._id}
                        className="py-2.5 flex items-center justify-between hover:bg-[#F4FAF6]/70 dark:hover:bg-[#071913]/40 px-2 rounded-lg transition-colors group"
                      >
                        <div className="min-w-0 flex items-center gap-3">
                          <div
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: tx.category?.color || (tx.type === "Transfer" ? "#00A86B" : "#1C5F4D") }}
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[#09261E] dark:text-white truncate">
                              {tx.type === "Transfer"
                                ? `${tx.account?.name} → ${tx.destinationAccount?.name}`
                                : tx.description || tx.category?.name || "Transaction"}
                            </p>
                            <p className="text-[10px] text-[#1C5F4D] dark:text-[#88C8AC] mt-0.5 truncate">
                              {tx.category?.name ? `${tx.category.name} · ` : ""}
                              {tx.account?.name} · {formatFullTimestamp(tx.date || tx.createdAt)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 pl-3">
                          <span className={`text-xs font-bold font-mono ${
                            tx.type === "Income"
                              ? "text-emerald-600 dark:text-emerald-400"
                              : tx.type === "Expense"
                              ? "text-[#09261E] dark:text-white"
                              : "text-[#00A86B]"
                          }`}>
                            {tx.type === "Income" ? "+" : tx.type === "Expense" ? "−" : ""}
                            {formatCurrency(tx.amount)}
                          </span>

                          <button
                            onClick={() => handleStartEdit(tx)}
                            className="p-1 text-zinc-400 hover:text-[#00A86B] rounded transition-colors cursor-pointer opacity-80 group-hover:opacity-100"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setDeletingTx(tx)}
                            className="p-1 text-zinc-400 hover:text-rose-600 rounded transition-colors cursor-pointer opacity-80 group-hover:opacity-100"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Compact In-Place Edit Modal */}
      {editingTx && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#09261E] rounded-2xl p-5 shadow-2xl animate-scale-up space-y-4">
            
            <div className="flex justify-between items-center border-b border-[#D1EADE]/70 dark:border-[#14382C] pb-3">
              <div>
                <h4 className="text-sm font-black text-[#09261E] dark:text-white font-display">
                  Edit Transaction
                </h4>
                <p className="text-[10px] text-[#1C5F4D] dark:text-[#88C8AC]">
                  Update historical details, timestamp, or category
                </p>
              </div>
              <button
                onClick={() => setEditingTx(null)}
                className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editError && (
              <div className="p-2.5 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 rounded-lg text-xs font-semibold">
                {editError}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-3">
              {/* Type Switcher */}
              <div className="flex gap-1 bg-[#F4FAF6] dark:bg-[#071913] p-0.5 rounded-lg border border-[#D1EADE] dark:border-[#14382C]">
                {["Expense", "Income", "Transfer"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setEditType(type);
                      const matchedCat = categories.find(c => c.type === type);
                      setEditCategoryId(matchedCat?._id || "");
                    }}
                    className={`flex-1 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                      editType === type
                        ? type === "Income"
                          ? "bg-emerald-600 text-white"
                          : type === "Expense"
                          ? "bg-rose-600 text-white"
                          : "bg-[#00A86B] text-white"
                        : "text-[#1C5F4D] dark:text-[#88C8AC] hover:text-[#09261E]"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Description & Amount */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#1C5F4D] dark:text-[#88C8AC] mb-1">Description</label>
                  <input
                    type="text"
                    required
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="w-full p-2 bg-[#F4FAF6] dark:bg-[#071913] border border-[#D1EADE] dark:border-[#14382C] rounded-lg text-xs font-bold text-[#09261E] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#00A86B]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#1C5F4D] dark:text-[#88C8AC] mb-1">Amount (Rp)</label>
                  <input
                    type="text"
                    required
                    value={editAmount}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "");
                      setEditAmount(raw ? Number(raw).toLocaleString("id-ID") : "");
                    }}
                    className="w-full p-2 bg-[#F4FAF6] dark:bg-[#071913] border border-[#D1EADE] dark:border-[#14382C] rounded-lg text-xs font-bold font-mono text-[#09261E] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#00A86B]"
                  />
                </div>
              </div>

              {/* Account & Category */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#1C5F4D] dark:text-[#88C8AC] mb-1">
                    {editType === "Transfer" ? "From Account" : "Account"}
                  </label>
                  <select
                    value={editAccountId}
                    onChange={(e) => setEditAccountId(e.target.value)}
                    className="w-full p-2 bg-[#F4FAF6] dark:bg-[#071913] border border-[#D1EADE] dark:border-[#14382C] rounded-lg text-xs font-bold text-[#09261E] dark:text-white"
                  >
                    {accounts.map(a => (
                      <option key={a._id} value={a._id}>{a.name}</option>
                    ))}
                  </select>
                </div>

                {editType === "Transfer" ? (
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#1C5F4D] dark:text-[#88C8AC] mb-1">To Account</label>
                    <select
                      value={editDestAccountId}
                      onChange={(e) => setEditDestAccountId(e.target.value)}
                      className="w-full p-2 bg-[#F4FAF6] dark:bg-[#071913] border border-[#D1EADE] dark:border-[#14382C] rounded-lg text-xs font-bold text-[#09261E] dark:text-white"
                    >
                      <option value="" disabled>Select destination</option>
                      {accounts.filter(a => a._id !== editAccountId).map(a => (
                        <option key={a._id} value={a._id}>{a.name}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#1C5F4D] dark:text-[#88C8AC] mb-1">Category</label>
                    <select
                      value={editCategoryId}
                      onChange={(e) => setEditCategoryId(e.target.value)}
                      className="w-full p-2 bg-[#F4FAF6] dark:bg-[#071913] border border-[#D1EADE] dark:border-[#14382C] rounded-lg text-xs font-bold text-[#09261E] dark:text-white"
                    >
                      {categories.filter(c => c.type === editType).map(c => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Exact Date & Time */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#D1EADE]/70 dark:border-[#14382C]">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#1C5F4D] dark:text-[#88C8AC] mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#00A86B]" /> Date
                  </label>
                  <input
                    type="date"
                    required
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full p-2 bg-[#F4FAF6] dark:bg-[#071913] border border-[#D1EADE] dark:border-[#14382C] rounded-lg text-xs font-bold text-[#09261E] dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#1C5F4D] dark:text-[#88C8AC] mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#00A86B]" /> Time (HH:MM:SS)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="14:30:00"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    className="w-full p-2 bg-[#F4FAF6] dark:bg-[#071913] border border-[#D1EADE] dark:border-[#14382C] rounded-lg text-xs font-mono font-bold text-[#09261E] dark:text-white"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTx(null)}
                  className="flex-1 py-2 border border-[#D1EADE] dark:border-[#14382C] text-[#1C5F4D] dark:text-[#88C8AC] rounded-lg text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="flex-1 py-2 bg-[#00A86B] hover:bg-[#00935D] text-white rounded-lg text-xs font-bold shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isSavingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      {deletingTx && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-[#09261E] rounded-2xl p-5 shadow-2xl animate-scale-up space-y-3 text-center">
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            
            <h4 className="text-sm font-black text-[#09261E] dark:text-white font-display">
              Delete this transaction?
            </h4>
            
            <p className="text-xs text-[#1C5F4D] dark:text-[#88C8AC]">
              This will remove the transaction and automatically reverse its balance effect.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingTx(null)}
                className="flex-1 py-2 border border-[#D1EADE] dark:border-[#14382C] text-[#1C5F4D] dark:text-[#88C8AC] rounded-lg text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TransactionHistoryModal;
