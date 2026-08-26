import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

// Panel imports
import DashboardOverview from "../components/DashboardOverview";
import TransactionsPanel from "../components/TransactionsPanel";
import AccountsPanel from "../components/AccountsPanel";
import CategoriesPanel from "../components/CategoriesPanel";
import AnalyticsPanel from "../components/AnalyticsPanel";
import SettingsPanel from "../components/SettingsPanel";
import ReportsPanel from "../components/ReportsPanel";

// Icons
import {
  Home,
  FileText,
  Landmark,
  BarChart3,
  Tag,
  Settings,
  X,
  Plus,
  BookOpen,
  LogOut,
  Sun,
  Moon,
  User,
  Vault
} from "lucide-react";

const Dashboard = () => {
  const { authFetch, user, handleResponse } = useAuth();

  const formatCurrency = (amount) => {
    return `Rp ${amount.toLocaleString("id-ID")}`;
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    const rawValue = value.replace(/\D/g, "");
    if (rawValue === "") {
      setAmount("");
      return;
    }
    const formatted = Number(rawValue).toLocaleString("id-ID");
    setAmount(formatted);
  };

  // Navigation state
  const [activeTab, setActiveTab] = useState("overview");

  // Global Finance States
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Transaction Modal state
  const [showTxModal, setShowTxModal] = useState(false);
  const [txModalType, setTxModalType] = useState("Expense"); // Income, Expense, Transfer
  const [editTx, setEditTx] = useState(null);

  // Modal Form States
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [destAccountId, setDestAccountId] = useState("");
  const [modalError, setModalError] = useState("");

  const fetchData = async () => {
    try {
      // Fetch Accounts
      const accRes = await authFetch("/api/accounts");
      const accData = await accRes.json();
      if (accRes.ok) setAccounts(accData);

      // Fetch Categories
      const catRes = await authFetch("/api/categories");
      const catData = await catRes.json();
      if (catRes.ok) setCategories(catData);

      // Fetch Stats Summary
      const summaryRes = await authFetch("/api/stats/summary");
      const summaryData = await summaryRes.json();
      if (summaryRes.ok) setSummary(summaryData);

    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- CRUD Account Operations ---
  const handleCreateAccount = async (accountPayload) => {
    try {
      const res = await authFetch("/api/accounts", {
        method: "POST",
        body: JSON.stringify(accountPayload),
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateAccount = async (id, accountPayload) => {
    try {
      const res = await authFetch(`/api/accounts/${id}`, {
        method: "PUT",
        body: JSON.stringify(accountPayload),
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAccount = async (id) => {
    try {
      const res = await authFetch(`/api/accounts/${id}`, {
        method: "DELETE",
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // --- CRUD Category Operations ---
  const handleCreateCategory = async (categoryPayload) => {
    try {
      const res = await authFetch("/api/categories", {
        method: "POST",
        body: JSON.stringify(categoryPayload),
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateCategory = async (id, categoryPayload) => {
    try {
      const res = await authFetch(`/api/categories/${id}`, {
        method: "PUT",
        body: JSON.stringify(categoryPayload),
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      const res = await authFetch(`/api/categories/${id}`, {
        method: "DELETE",
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // --- CRUD Transaction Operations ---
  const handleOpenTransactionModal = (type, tx = null, defaultDate = null) => {
    setTxModalType(type);
    setEditTx(tx);
    setModalError("");

    if (tx) {
      setAmount(tx.amount.toLocaleString("id-ID"));
      setDescription(tx.description || "");
      setDate(new Date(tx.date).toISOString().split("T")[0]);
      setAccountId(tx.account?._id || tx.account || "");
      setCategoryId(tx.category?._id || tx.category || "");
      setDestAccountId(tx.destinationAccount?._id || tx.destinationAccount || "");
    } else {
      setAmount("");
      setDescription("");
      setDate(defaultDate || new Date().toISOString().split("T")[0]);
      setAccountId(accounts[0]?._id || "");

      const filteredCats = categories.filter((c) => c.type === type);
      setCategoryId(filteredCats[0]?._id || "");
      setDestAccountId(accounts.find(a => a._id !== accounts[0]?._id)?._id || "");
    }
    setShowTxModal(true);
  };

  const handleSaveTransaction = async (e) => {
    e.preventDefault();
    setModalError("");

    const cleanAmountStr = amount.replace(/\./g, "");
    const parsedAmount = parseFloat(cleanAmountStr);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setModalError("Please enter a valid amount greater than 0");
      return;
    }

    if (!accountId) {
      setModalError("Please select an account");
      return;
    }

    if (txModalType !== "Transfer" && !categoryId) {
      setModalError("Please select a category");
      return;
    }

    if (txModalType === "Transfer" && !destAccountId) {
      setModalError("Please select a destination account");
      return;
    }

    const payload = {
      type: txModalType,
      amount: parsedAmount,
      description,
      date,
      account: accountId,
      category: txModalType === "Transfer" ? undefined : categoryId,
      destinationAccount: txModalType === "Transfer" ? destAccountId : undefined,
    };

    try {
      let res;
      if (editTx) {
        res = await authFetch(`/api/transactions/${editTx._id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        res = await authFetch("/api/transactions", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      const data = await handleResponse(res, "Failed to save transaction");
      setShowTxModal(false);
      fetchData(); // reload dashboard stats and balances
    } catch (err) {
      setModalError(err.message || "Network error, please try again");
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!confirm("Are you sure you want to delete this transaction? The account balances will be reverted.")) {
      return;
    }

    try {
      const res = await authFetch(`/api/transactions/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Helper to adjust category picker dynamically in modal when tab switches
  const handleModalTypeChange = (newType) => {
    setTxModalType(newType);
    const filteredCats = categories.filter((c) => c.type === newType);
    setCategoryId(filteredCats[0]?._id || "");
  };

  // Render the selected sub-panel
  const renderActivePanel = () => {
    switch (activeTab) {
      case "overview":
        return (
          <DashboardOverview
            summary={summary}
            user={user}
            onSetActiveTab={setActiveTab}
            onOpenTransactionModal={handleOpenTransactionModal}
          />
        );
      case "transactions":
        return (
          <TransactionsPanel
            accounts={accounts}
            categories={categories}
            onOpenTransactionModal={handleOpenTransactionModal}
            onDeleteTransaction={handleDeleteTransaction}
            onSetActiveTab={setActiveTab}
          />
        );
      case "accounts":
        return (
          <AccountsPanel
            accounts={accounts}
            user={user}
            onCreateAccount={handleCreateAccount}
            onUpdateAccount={handleUpdateAccount}
            onDeleteAccount={handleDeleteAccount}
            onOpenTransactionModal={handleOpenTransactionModal}
            onSetActiveTab={setActiveTab}
          />
        );
      case "reports":
        return (
          <ReportsPanel
            authFetch={authFetch}
            handleResponse={handleResponse}
            formatCurrency={formatCurrency}
            accounts={accounts}
            categories={categories}
            summary={summary}
            onOpenTransactionModal={handleOpenTransactionModal}
            onDeleteTransaction={handleDeleteTransaction}
            onSetActiveTab={setActiveTab}
          />
        );
      case "categories":
        return (
          <CategoriesPanel
            categories={categories}
            onCreateCategory={handleCreateCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
            onSetActiveTab={setActiveTab}
          />
        );
      case "analytics":
        return <AnalyticsPanel user={user} onSetActiveTab={setActiveTab} />;
      case "settings":
        return <SettingsPanel onSetActiveTab={setActiveTab} />;
      default:
        return <div>Sub-panel not found.</div>;
    }
  };

  const navItems = [
    { id: "overview", label: "Home", icon: <Home className="w-4.5 h-4.5" /> },
    { id: "accounts", label: "Accounts", icon: <Landmark className="w-4.5 h-4.5" /> },
    { id: "reports", label: "Reports", icon: <BookOpen className="w-4.5 h-4.5" /> },
    { id: "settings", label: "Settings", icon: <Settings className="w-4.5 h-4.5" /> },
  ];

  const toggleDarkMode = async () => {
    if (!user) return;
    const nextMode = !user.darkMode;
    try {
      await updateProfile({ darkMode: nextMode });
      if (nextMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch (err) {
      console.error("Failed to toggle dark mode:", err);
    }
  };

  const { logout, updateProfile } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold tracking-wide">Synchronizing vault...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white transition-colors duration-300 flex flex-col md:flex-row pb-20 md:pb-0">

      {/* Mobile Top Navbar (Hidden on Desktop) */}
      <div className="md:hidden w-full">
        <Navbar />
      </div>

      {/* Desktop Navigation Sidebar (Hidden on Mobile) */}
      <aside className="hidden md:flex md:flex-col md:w-64 fixed left-0 top-0 bottom-0 bg-white dark:bg-zinc-900/40 backdrop-blur-md border-r border-zinc-200/80 dark:border-zinc-800/80 z-30 p-6 justify-between select-none">
        <div className="space-y-8">
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-8 h-8 bg-violet-600 dark:bg-violet-500 rounded-xl flex items-center justify-center shadow-md shadow-violet-500/20">
              <Vault className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-0.5">
              WALLET
              <span className="text-violet-600 dark:text-violet-400">.</span>
            </span>
          </div>

          {/* Quick Action Button */}
          <button
            onClick={() => handleOpenTransactionModal("Expense")}
            className="w-full py-2.5 px-4 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-violet-500/15 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4" />
            Record Entry
          </button>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${isActive
                      ? "bg-violet-50/50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                    }`}
                >
                  <span className={`transition-transform duration-200 ${isActive ? "scale-110" : ""}`}>
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer (Profile + Settings Controls) */}
        <div className="space-y-4 pt-6 border-t border-zinc-200/80 dark:border-zinc-800/80">
          {/* Profile Card */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 bg-violet-100 dark:bg-violet-950/50 border border-violet-200 dark:border-violet-900/50 text-violet-600 dark:text-violet-400 rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                {user?.username ? user.username.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
              </div>
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 truncate">
                {user?.username}
              </span>
            </div>

            {/* Dark Mode Switcher in Sidebar */}
            <button
              onClick={toggleDarkMode}
              className="p-1.5 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all cursor-pointer"
              title="Toggle Dark Mode"
            >
              {user?.darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          {/* Logout button */}
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-2xl text-xs font-bold transition-all cursor-pointer"
          >
            <LogOut className="w-4.5 h-4.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main className="flex-1 md:pl-64 w-full min-w-0">
        <div className="max-w-5xl mx-auto w-full px-4 py-6 md:p-8">
          {renderActivePanel()}
        </div>
      </main>

      {/* Mobile Bottom Tab Navigation Bar (Sticky on mobile only) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200/80 dark:border-zinc-800/80 transition-colors duration-300 md:hidden pb-safe">
        <div className="max-w-md mx-auto px-2 h-16 flex items-center justify-around relative">
          {/* Home */}
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex flex-col items-center gap-1 transition-all cursor-pointer ${activeTab === "overview"
                ? "text-violet-600 dark:text-violet-400 scale-105 font-bold"
                : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-700"
              }`}
          >
            <Home className="w-4.5 h-4.5" />
            <span className="text-[9px] tracking-wide font-medium">Home</span>
          </button>

          {/* Accounts */}
          <button
            onClick={() => setActiveTab("accounts")}
            className={`flex flex-col items-center gap-1 transition-all cursor-pointer ${activeTab === "accounts"
                ? "text-violet-600 dark:text-violet-400 scale-105 font-bold"
                : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-700"
              }`}
          >
            <Landmark className="w-4.5 h-4.5" />
            <span className="text-[9px] tracking-wide font-medium">Accounts</span>
          </button>

          {/* Center Plus Button (float slightly above with thick border) */}
          <button
            onClick={() => handleOpenTransactionModal("Expense")}
            className="w-12 h-12 bg-violet-600 dark:bg-violet-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-violet-500/35 transform active:scale-95 transition-all -mt-6 border-4 border-white dark:border-zinc-900 z-50 hover:bg-violet-750 cursor-pointer"
            title="Add Transaction"
          >
            <Plus className="w-6 h-6" />
          </button>

          {/* Reports */}
          <button
            onClick={() => setActiveTab("reports")}
            className={`flex flex-col items-center gap-1 transition-all cursor-pointer ${activeTab === "reports"
                ? "text-violet-600 dark:text-violet-400 scale-105 font-bold"
                : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-700"
              }`}
          >
            <BookOpen className="w-4.5 h-4.5" />
            <span className="text-[9px] tracking-wide font-medium">Reports</span>
          </button>

          {/* Settings */}
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex flex-col items-center gap-1 transition-all cursor-pointer ${activeTab === "settings"
                ? "text-violet-600 dark:text-violet-400 scale-105 font-bold"
                : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-700"
              }`}
          >
            <Settings className="w-4.5 h-4.5" />
            <span className="text-[9px] tracking-wide font-medium">Settings</span>
          </button>
        </div>
      </nav>

      {/* Transaction Modal Overlay (Income / Expense / Transfer overlay drawer) */}
      {showTxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl animate-scale-up relative">
            <button
              onClick={() => setShowTxModal(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 dark:text-zinc-500 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">
              {editTx ? "Edit Transaction" : "Record Transaction"}
            </h3>

            {/* Error banner */}
            {modalError && (
              <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-semibold">
                {modalError}
              </div>
            )}

            {/* Type selector tabs */}
            {!editTx && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {["Expense", "Income", "Transfer"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleModalTypeChange(type)}
                    className={`py-2 px-3 border rounded-xl text-xs font-bold transition-all cursor-pointer ${txModalType === type
                        ? type === "Income"
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400"
                          : type === "Expense"
                            ? "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-400"
                            : "bg-violet-50 border-violet-200 text-violet-700 dark:bg-violet-950/20 dark:border-violet-900/50 dark:text-violet-400"
                        : "border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                      }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleSaveTransaction} className="space-y-4">
              {/* Amount input */}
              <div>
                <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Amount</label>
                <input
                  type="text"
                  required
                  placeholder="0"
                  value={amount}
                  onChange={handleAmountChange}
                  className="w-full p-2.5 bg-zinc-50/50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-600 dark:focus:ring-violet-500 font-medium"
                />
              </div>

              {/* Source Account input */}
              <div>
                <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                  {txModalType === "Transfer" ? "Source Account" : "Account"}
                </label>
                <select
                  required
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full p-2.5 bg-zinc-50/50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-600 dark:focus:ring-violet-500 font-medium"
                >
                  <option value="" disabled>Select Account</option>
                  {accounts.map((acc) => (
                    <option key={acc._id} value={acc._id}>{acc.name} ({formatCurrency(acc.balance)})</option>
                  ))}
                </select>
              </div>

              {/* Destination Account (Only for Transfers) */}
              {txModalType === "Transfer" && (
                <div>
                  <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Destination Account</label>
                  <select
                    required
                    value={destAccountId}
                    onChange={(e) => setDestAccountId(e.target.value)}
                    className="w-full p-2.5 bg-zinc-50/50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-600 dark:focus:ring-violet-500 font-medium"
                  >
                    <option value="" disabled>Select Destination Account</option>
                    {accounts.filter(a => a._id !== accountId).map((acc) => (
                      <option key={acc._id} value={acc._id}>{acc.name} ({formatCurrency(acc.balance)})</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Category selector (Not for Transfers) */}
              {txModalType !== "Transfer" && (
                <div>
                  <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Category Tag</label>
                  <select
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full p-2.5 bg-zinc-50/50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-600 dark:focus:ring-violet-500 font-medium"
                  >
                    <option value="" disabled>Select Category</option>
                    {categories.filter(c => c.type === txModalType).map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Date selection */}
              <div>
                <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-2.5 bg-zinc-50/50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-600 dark:focus:ring-violet-500 font-medium"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Notes / Description</label>
                <input
                  type="text"
                  placeholder="e.g. Starbucks, Monthly salary bonus"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 bg-zinc-50/50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-600 dark:focus:ring-violet-500 font-medium"
                />
              </div>

              {/* Save Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTxModal(false)}
                  className="flex-1 py-2.5 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl text-sm font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600 text-white rounded-xl text-sm font-bold shadow-md shadow-violet-500/15 cursor-pointer"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
