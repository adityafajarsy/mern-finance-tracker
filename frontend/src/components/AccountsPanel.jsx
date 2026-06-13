import { useState } from "react";
import { Plus, Edit2, Trash2, ArrowLeftRight, Landmark, CreditCard, Wallet, HelpCircle } from "lucide-react";

const AccountsPanel = ({
  accounts,
  user,
  onCreateAccount,
  onUpdateAccount,
  onDeleteAccount,
  onOpenTransactionModal,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editAccount, setEditAccount] = useState(null);

  // Form states
  const [name, setName] = useState("");
  const [type, setType] = useState("Bank");
  const [balance, setBalance] = useState("");
  const [color, setColor] = useState("#7C3AED");

  const formatCurrency = (amount) => {
    return `Rp ${amount.toLocaleString("id-ID")}`;
  };

  const handleBalanceChange = (e) => {
    const value = e.target.value;
    const rawValue = value.replace(/\D/g, "");
    if (rawValue === "") {
      setBalance("");
      return;
    }
    const formatted = Number(rawValue).toLocaleString("id-ID");
    setBalance(formatted);
  };

  const getAccountIcon = (accType) => {
    switch (accType) {
      case "Bank":
        return <Landmark className="w-5 h-5" />;
      case "E-Wallet":
        return <CreditCard className="w-5 h-5" />;
      case "Cash":
        return <Wallet className="w-5 h-5" />;
      default:
        return <HelpCircle className="w-5 h-5" />;
    }
  };

  const handleOpenCreate = () => {
    setEditAccount(null);
    setName("");
    setType("Bank");
    setBalance("");
    setColor("#7C3AED");
    setShowForm(true);
  };

  const handleOpenEdit = (acc) => {
    setEditAccount(acc);
    setName(acc.name);
    setType(acc.type);
    setBalance(acc.balance.toLocaleString("id-ID"));
    setColor(acc.color);
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanBalanceStr = balance.toString().replace(/\./g, "");
    const payload = {
      name,
      type,
      balance: parseFloat(cleanBalanceStr) || 0,
      color,
    };

    if (editAccount) {
      onUpdateAccount(editAccount._id, payload);
    } else {
      onCreateAccount(payload);
    }
    setShowForm(false);
  };

  const totalSum = accounts.reduce((acc, curr) => acc + curr.balance, 0);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight font-display">Accounts</h2>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
            Total overall wealth: <span className="font-semibold text-zinc-700 dark:text-zinc-300 font-mono">{formatCurrency(totalSum)}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onOpenTransactionModal("Transfer")}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-2xl text-xs font-bold cursor-pointer transition-all duration-200"
          >
            <ArrowLeftRight className="w-4 h-4" />
            Transfer
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-violet-500/20 cursor-pointer transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            Add Account
          </button>
        </div>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {accounts.map((acc) => (
          <div
            key={acc._id}
            className="relative overflow-hidden bg-white dark:bg-zinc-900 border border-[#EEF2F7] dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-750 transition-all duration-300 flex flex-col justify-between h-40 group"
          >
            {/* Soft background visual cue (low opacity account-colored data wave) */}
            <div 
              className="absolute right-0 bottom-0 pointer-events-none opacity-[0.06] dark:opacity-[0.04] translate-x-2 translate-y-2 select-none group-hover:scale-105 transition-transform duration-500"
              style={{ color: acc.color }}
            >
              <svg width="130" height="90" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 60 C30 45, 60 75, 90 45 C105 30, 115 40, 120 35 L120 80 L0 80 Z" fill="currentColor" />
                <path d="M0 60 C30 45, 60 75, 90 45 C105 30, 115 40, 120 35" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
              </svg>
            </div>

            {/* Title / Header */}
            <div className="flex justify-between items-start z-10">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs border border-zinc-100 dark:border-zinc-800/80 transition-all duration-300 shrink-0"
                  style={{ backgroundColor: acc.color + "12", color: acc.color }}
                >
                  {getAccountIcon(acc.type)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-200 tracking-tight">{acc.name}</h4>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider font-display">
                    {acc.type}
                  </span>
                </div>
              </div>

              {/* Edit / Delete Buttons */}
              <div className="flex gap-1">
                <button
                  onClick={() => handleOpenEdit(acc)}
                  className="p-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-400 dark:text-zinc-500 rounded-lg cursor-pointer transition-colors"
                  title="Edit Account"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete account "${acc.name}"? All associated transactions will be deleted!`)) {
                      onDeleteAccount(acc._id);
                    }
                  }}
                  className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500 rounded-lg cursor-pointer transition-colors"
                  title="Delete Account"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Balance display */}
            <div className="z-10">
              <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Balance</p>
              <h3 className="text-2xl font-black text-zinc-900 dark:text-white leading-none mt-1 font-mono tracking-tight">
                {formatCurrency(acc.balance)}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Account Creation / Edit Overlay Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl animate-scale-up">
            <h3 className="text-lg font-black text-zinc-900 dark:text-white mb-4 tracking-tight font-display">
              {editAccount ? "Edit Account" : "Add Account"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Account Name */}
              <div>
                <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Account Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bank BCA, Cash Wallet"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 bg-zinc-50/50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-600 dark:focus:ring-violet-500 font-medium"
                />
              </div>

              {/* Type Grid selection */}
              <div>
                <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Account Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {["Bank", "Cash", "E-Wallet"].map((accType) => (
                    <button
                      key={accType}
                      type="button"
                      onClick={() => setType(accType)}
                      className={`py-2.5 px-3 border rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                        type === accType
                          ? "bg-violet-50 border-violet-200 text-violet-700 dark:bg-violet-950/20 dark:border-violet-900/50 dark:text-violet-400"
                          : "border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                      }`}
                    >
                      {accType}
                    </button>
                  ))}
                </div>
              </div>

              {/* Balance */}
              <div>
                <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Initial Balance</label>
                <input
                  type="text"
                  placeholder="0"
                  value={balance}
                  onChange={handleBalanceChange}
                  className="w-full p-3 bg-zinc-50/50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-600 dark:focus:ring-violet-500 font-mono"
                />
              </div>

              {/* Theme Color Picker */}
              <div>
                <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Color Label</label>
                <div className="flex gap-3 flex-wrap">
                  {["#7C3AED", "#10B981", "#F59E0B", "#EF4444", "#EC4899", "#3B82F6", "#06B6D4", "#6B7280"].map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => setColor(hex)}
                      className={`w-7 h-7 rounded-full cursor-pointer transition-transform duration-200 border-2 ${
                        color === hex ? "scale-110 border-zinc-400 dark:border-zinc-300" : "border-transparent"
                      }`}
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-2xl text-sm font-semibold cursor-pointer transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-violet-500/25 cursor-pointer transition-all duration-200"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountsPanel;
