import { useState } from "react";
import { Plus, Edit2, Trash2, ArrowLeftRight, Landmark, CreditCard, Wallet, HelpCircle, FileText, CheckCircle2 } from "lucide-react";
import OrganicLine from "./ui/OrganicLine";

const AccountsPanel = ({
  accounts = [],
  defaultAccountId = null,
  onCreateAccount,
  onUpdateAccount,
  onDeleteAccount,
  onOpenLedger,
  onSetDefaultAccount,
  onOpenTransfer,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editAccount, setEditAccount] = useState(null);

  // Form states
  const [name, setName] = useState("");
  const [type, setType] = useState("Bank");
  const [balance, setBalance] = useState("");
  const [color, setColor] = useState("#00A86B");

  const formatCurrency = (amount) => {
    return `Rp ${(amount || 0).toLocaleString("id-ID")}`;
  };

  const handleBalanceChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    if (rawValue === "") {
      setBalance("");
      return;
    }
    setBalance(Number(rawValue).toLocaleString("id-ID"));
  };

  const getAccountIcon = (accType) => {
    switch (accType) {
      case "Bank":
        return <Landmark className="w-4 h-4" />;
      case "E-Wallet":
        return <CreditCard className="w-4 h-4" />;
      case "Cash":
        return <Wallet className="w-4 h-4" />;
      default:
        return <HelpCircle className="w-4 h-4" />;
    }
  };

  const handleOpenCreate = () => {
    setEditAccount(null);
    setName("");
    setType("Bank");
    setBalance("");
    setColor("#00A86B");
    setShowForm(true);
  };

  const handleOpenEdit = (acc) => {
    setEditAccount(acc);
    setName(acc.name);
    setType(acc.type);
    setBalance(acc.balance.toLocaleString("id-ID"));
    setColor(acc.color || "#00A86B");
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanBalance = parseFloat(String(balance).replace(/\./g, ""));
    const payload = {
      name,
      type,
      balance: isNaN(cleanBalance) ? 0 : cleanBalance,
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
    <div className="space-y-8 animate-fade-in font-sans max-w-3xl pb-4">
      
      {/* 1. DOMINANT TOTAL WEALTH STATEMENT */}
      <section className="space-y-2 border-b border-[#D1EADE]/70 dark:border-[#14382C] pb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#1C5F4D] dark:text-[#88C8AC]">
              Total Wealth
            </span>
            <h1 className="text-4xl sm:text-5xl font-black font-display tracking-tight text-[#09261E] dark:text-white tabular-nums">
              {formatCurrency(totalSum)}
            </h1>
            <p className="text-xs text-[#1C5F4D] dark:text-[#88C8AC]">
              Distributed across {accounts.length} {accounts.length === 1 ? "account" : "registered accounts"}
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onOpenTransfer}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-white dark:bg-[#09261E] border border-[#D1EADE] dark:border-[#14382C] text-[#09261E] dark:text-white rounded-xl text-xs font-bold hover:bg-[#F4FAF6] cursor-pointer transition-all shadow-2xs"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-[#00A86B]" />
              <span>Transfer</span>
            </button>

            <button
              onClick={handleOpenCreate}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-[#00A86B] hover:bg-[#00935D] text-white rounded-xl text-xs font-bold shadow-md shadow-[#00A86B]/20 cursor-pointer transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Account</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. EXPRESSIVE ACCOUNT OBJECTS */}
      <section className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#1C5F4D] dark:text-[#88C8AC]">
            Registered Accounts
          </span>
          <button
            onClick={() => onOpenLedger()}
            className="text-xs font-bold text-[#00A86B] hover:underline cursor-pointer"
          >
            All History →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {accounts.map((acc) => {
            const isDefault = defaultAccountId === acc._id;
            return (
              <div
                key={acc._id}
                className="bg-white dark:bg-[#09261E] border border-[#D1EADE]/80 dark:border-[#14382C] rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all relative overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ backgroundColor: acc.color || "#00A86B" }}
                      >
                        {getAccountIcon(acc.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-[#09261E] dark:text-white">{acc.name}</h4>
                          {isDefault && (
                            <span className="text-[8px] font-extrabold uppercase px-1 py-0.2 bg-[#E8F5EE] dark:bg-[#00A86B]/20 text-[#00A86B] rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-[9px] text-[#1C5F4D] dark:text-[#88C8AC] font-medium">{acc.type}</p>
                      </div>
                    </div>

                    <div className="flex gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEdit(acc)}
                        className="p-1 text-zinc-400 hover:text-[#00A86B] rounded cursor-pointer"
                        title="Edit Account"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onDeleteAccount(acc._id)}
                        className="p-1 text-zinc-400 hover:text-rose-600 rounded cursor-pointer"
                        title="Delete Account"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] font-bold uppercase text-[#1C5F4D] dark:text-[#88C8AC] tracking-wider">
                      Balance
                    </span>
                    <p className="text-xl font-black font-display text-[#09261E] dark:text-white tracking-tight mt-0.5 tabular-nums">
                      {formatCurrency(acc.balance)}
                    </p>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-[#D1EADE]/50 dark:border-[#14382C] flex items-center justify-between text-xs">
                  {!isDefault && onSetDefaultAccount ? (
                    <button
                      onClick={() => onSetDefaultAccount(acc._id)}
                      className="text-[10px] font-bold text-[#1C5F4D] dark:text-[#88C8AC] hover:text-[#00A86B] flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      Set as Default
                    </button>
                  ) : (
                    <span className="text-[10px] font-semibold text-[#00A86B] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Default Account
                    </span>
                  )}

                  <button
                    onClick={() => onOpenLedger(acc._id)}
                    className="text-[10px] font-bold text-[#00A86B] hover:underline cursor-pointer"
                  >
                    History →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Account Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#09261E] rounded-2xl p-6 shadow-2xl animate-scale-up space-y-4">
            <h3 className="text-base font-black text-[#09261E] dark:text-white font-display">
              {editAccount ? "Edit Account" : "Add New Account"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#1C5F4D] dark:text-[#88C8AC] mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BCA, GoPay, Cash"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 bg-[#F4FAF6] dark:bg-[#071913] border border-[#D1EADE] dark:border-[#14382C] rounded-lg text-xs font-bold text-[#09261E] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#00A86B]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#1C5F4D] dark:text-[#88C8AC] mb-1">
                  Account Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full p-2 bg-[#F4FAF6] dark:bg-[#071913] border border-[#D1EADE] dark:border-[#14382C] rounded-lg text-xs font-bold text-[#09261E] dark:text-white"
                >
                  <option value="Bank">Bank</option>
                  <option value="E-Wallet">E-Wallet</option>
                  <option value="Cash">Cash</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#1C5F4D] dark:text-[#88C8AC] mb-1">
                  Initial Balance (Rp)
                </label>
                <input
                  type="text"
                  required
                  placeholder="0"
                  value={balance}
                  onChange={handleBalanceChange}
                  className="w-full p-2 bg-[#F4FAF6] dark:bg-[#071913] border border-[#D1EADE] dark:border-[#14382C] rounded-lg text-xs font-mono font-black text-[#09261E] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#00A86B]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#1C5F4D] dark:text-[#88C8AC] mb-1">
                  Theme Color
                </label>
                <div className="flex gap-2">
                  {["#00A86B", "#10B981", "#059669", "#0284C7", "#7C3AED", "#F59E0B"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-6 h-6 rounded-lg transition-all ${color === c ? "ring-2 ring-offset-2 ring-[#00A86B] scale-110" : ""}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2 border border-[#D1EADE] dark:border-[#14382C] text-[#1C5F4D] dark:text-[#88C8AC] rounded-lg text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#00A86B] hover:bg-[#00935D] text-white rounded-lg text-xs font-bold shadow-sm cursor-pointer"
                >
                  {editAccount ? "Simpan Perubahan" : "Buat Rekening"}
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
