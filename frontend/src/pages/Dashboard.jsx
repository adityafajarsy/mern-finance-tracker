import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

// Views & Panels
import HomeView from "../components/HomeView";
import InsightsView from "../components/InsightsView";
import AccountsPanel from "../components/AccountsPanel";
import SettingsPanel from "../components/SettingsPanel";
import CategoriesPanel from "../components/CategoriesPanel";
import CaptureModal from "../components/CaptureModal";
import TransactionHistoryModal from "../components/TransactionHistoryModal";

// Icons
import {
  Home,
  BarChart3,
  Landmark,
  Settings,
  Plus,
  LogOut,
  Sun,
  Moon,
  User,
  ArrowLeftRight,
  X,
  Sparkles,
  ArrowUpRight
} from "lucide-react";

const Dashboard = () => {
  const { authFetch, user, updateProfile, logout, handleResponse } = useAuth();

  // Navigation State (4 primary destinations)
  const [activeTab, setActiveTab] = useState("home");

  // Global Financial Data States
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Floating Instant Input State
  const [floatingInput, setFloatingInput] = useState("");
  const [captureInitialText, setCaptureInitialText] = useState("");

  // Animated Typewriter State for AI Capture Bar
  const placeholderPhrases = [
    "Beli kopi 25rb pake GoPay...",
    "Gaji masuk 8.500.000 ke BCA...",
    "Kemarin makan siang 35k...",
    "Transfer 150rb BCA ke OVO...",
    "Beli bensin 50k cash...",
    "Langganan Spotify 55rb..."
  ];
  const [typewriterText, setTypewriterText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = placeholderPhrases[phraseIndex];
    const typingSpeed = isDeleting ? 35 : 70;
    const pauseTime = isDeleting ? 400 : 1800;

    let timeout;

    if (!isDeleting && typewriterText === currentPhrase) {
      timeout = setTimeout(() => setIsDeleting(true), pauseTime);
    } else if (isDeleting && typewriterText === "") {
      setIsDeleting(false);
      setPhraseIndex((prev) => (prev + 1) % placeholderPhrases.length);
    } else {
      timeout = setTimeout(() => {
        setTypewriterText((prev) =>
          isDeleting
            ? currentPhrase.substring(0, prev.length - 1)
            : currentPhrase.substring(0, prev.length + 1)
        );
      }, typingSpeed);
    }

    return () => clearTimeout(timeout);
  }, [typewriterText, isDeleting, phraseIndex]);

  // Modals
  const [showCaptureModal, setShowCaptureModal] = useState(false);
  const [showLedgerModal, setShowLedgerModal] = useState(false);
  const [ledgerInitialAccountId, setLedgerInitialAccountId] = useState(null);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  // Quick Transfer Modal Form States
  const [transferSource, setTransferSource] = useState("");
  const [transferDest, setTransferDest] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferDesc, setTransferDesc] = useState("Transfer Antar-Akun");
  const [transferError, setTransferError] = useState("");
  const [transferSaving, setTransferSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [accRes, catRes, sumRes] = await Promise.all([
        authFetch("/api/accounts"),
        authFetch("/api/categories"),
        authFetch("/api/stats/summary"),
      ]);

      if (accRes.ok) setAccounts(await accRes.json());
      if (catRes.ok) setCategories(await catRes.json());
      if (sumRes.ok) setSummary(await sumRes.json());
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
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

  const handleSetDefaultAccount = async (accountId) => {
    try {
      const res = await authFetch("/api/auth/profile", {
        method: "PUT",
        body: JSON.stringify({ defaultAccount: accountId }),
      });
      if (res.ok) {
        const updatedUser = await res.json();
        handleResponse(updatedUser);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- Transaction & Transfer Operations ---
  const handleSaveTransaction = async (payload) => {
    const res = await authFetch("/api/transactions", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || "Failed to save transaction");
    }

    await fetchData();
  };

  const handleExecuteTransfer = async (e) => {
    e.preventDefault();
    setTransferError("");

    const cleanAmt = parseFloat(String(transferAmount).replace(/\./g, ""));
    if (isNaN(cleanAmt) || cleanAmt <= 0) {
      setTransferError("Please enter a valid transfer amount");
      return;
    }

    if (!transferSource || !transferDest) {
      setTransferError("Please select both source and destination accounts");
      return;
    }

    if (transferSource === transferDest) {
      setTransferError("Source and destination accounts must be different");
      return;
    }

    setTransferSaving(true);
    try {
      await handleSaveTransaction({
        type: "Transfer",
        amount: cleanAmt,
        description: transferDesc.trim() || "Transfer Antar-Akun",
        account: transferSource,
        destinationAccount: transferDest,
      });

      setShowTransferModal(false);
      setTransferAmount("");
      setTransferDesc("Transfer Antar-Akun");
    } catch (err) {
      setTransferError(err.message || "Failed to execute transfer");
    } finally {
      setTransferSaving(false);
    }
  };

  // --- Category CRUD Operations ---
  const handleCreateCategory = async (payload) => {
    try {
      const res = await authFetch("/api/categories", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateCategory = async (id, payload) => {
    try {
      const res = await authFetch(`/api/categories/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
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

  // Floating Chatbox Submit
  const handleFloatingSubmit = (e) => {
    e.preventDefault();
    if (!floatingInput.trim()) return;
    setCaptureInitialText(floatingInput.trim());
    setShowCaptureModal(true);
    setFloatingInput("");
  };

  const navItems = [
    { id: "home", label: "Home", icon: <Home className="w-4 h-4" /> },
    { id: "insights", label: "Insights", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "accounts", label: "Accounts", icon: <Landmark className="w-4 h-4" /> },
    { id: "settings", label: "Settings", icon: <Settings className="w-4 h-4" /> },
  ];

  const renderActivePanel = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-2 border-[#00A86B] border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    switch (activeTab) {
      case "home":
        return (
          <HomeView
            summary={summary}
            accounts={accounts}
            onOpenCapture={() => {
              setCaptureInitialText("");
              setShowCaptureModal(true);
            }}
            onOpenLedger={() => {
              setLedgerInitialAccountId(null);
              setShowLedgerModal(true);
            }}
            onOpenTransfer={() => {
              if (accounts.length >= 2) {
                setTransferSource(accounts[0]._id);
                setTransferDest(accounts[1]._id);
                setShowTransferModal(true);
              } else {
                alert("You need at least 2 accounts to make transfers.");
              }
            }}
            onSetActiveTab={setActiveTab}
            formatCurrency={(val) => `Rp ${Number(val || 0).toLocaleString("id-ID")}`}
          />
        );

      case "insights":
        return (
          <InsightsView
            authFetch={authFetch}
            formatCurrency={(val) => `Rp ${Number(val || 0).toLocaleString("id-ID")}`}
          />
        );

      case "accounts":
        return (
          <AccountsPanel
            accounts={accounts}
            defaultAccountId={user?.defaultAccount?._id || user?.defaultAccount}
            onCreateAccount={handleCreateAccount}
            onUpdateAccount={handleUpdateAccount}
            onDeleteAccount={handleDeleteAccount}
            onSetDefaultAccount={handleSetDefaultAccount}
            onOpenLedger={(accId) => {
              setLedgerInitialAccountId(accId);
              setShowLedgerModal(true);
            }}
            onOpenTransfer={() => {
              if (accounts.length >= 2) {
                setTransferSource(accounts[0]._id);
                setTransferDest(accounts[1]._id);
                setShowTransferModal(true);
              } else {
                alert("You need at least 2 accounts to make transfers.");
              }
            }}
          />
        );

      case "settings":
        return (
          <SettingsPanel
            user={user}
            accounts={accounts}
            onUpdateProfile={updateProfile}
            onOpenCategoriesModal={() => setShowCategoriesModal(true)}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#E8F5EE] dark:bg-[#071913] text-[#09261E] dark:text-[#E2F2EB] transition-colors duration-300 flex flex-col md:flex-row font-sans relative">
      
      {/* Mobile Top Header (100% Transparent, Seamless Background) */}
      <div className="md:hidden w-full px-5 pt-3 pb-1 flex items-center justify-between bg-transparent relative z-30">
        <div className="flex items-center gap-1.5 font-display font-black text-lg tracking-tight text-[#09261E] dark:text-white">
          <span>SALDO</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#00A86B]"></span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleDarkMode}
            className="p-2 text-[#1C5F4D] dark:text-[#88C8AC] hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors cursor-pointer"
            title="Toggle Dark Mode"
          >
            {user?.darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className="w-7 h-7 bg-[#00A86B]/15 text-[#00A86B] rounded-full flex items-center justify-center font-bold text-xs shrink-0 cursor-pointer"
            title="Settings / Profile"
          >
            {user?.username ? user.username.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Desktop Editorial Sidebar (Quiet, Restrained, Non-bulky) */}
      <aside className="hidden md:flex md:flex-col md:w-56 fixed left-0 top-0 bottom-0 bg-transparent border-r border-[#D1EADE]/70 dark:border-[#14382C] z-30 p-6 justify-between select-none">
        <div className="space-y-6">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-1.5 px-2">
            <span className="text-xl font-black font-display tracking-tight text-[#09261E] dark:text-white">
              SALDO
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#00A86B]"></span>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={() => {
              setCaptureInitialText("");
              setShowCaptureModal(true);
            }}
            className="w-full py-2.5 px-4 bg-[#00A86B] hover:bg-[#00935D] text-white rounded-full text-xs font-bold shadow-sm shadow-[#00A86B]/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Capture</span>
          </button>

          {/* Navigation Links */}
          <nav className="space-y-1 pt-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-white/80 dark:bg-[#09261E] text-[#00A86B] shadow-2xs"
                      : "text-[#1C5F4D] dark:text-[#88C8AC] hover:text-[#09261E] dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5"
                  }`}
                >
                  <span className={isActive ? "text-[#00A86B]" : "opacity-70"}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="space-y-3 pt-4 border-t border-[#D1EADE]/70 dark:border-[#14382C]">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 bg-[#00A86B]/15 text-[#00A86B] rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                {user?.username ? user.username.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
              </div>
              <span className="text-xs font-bold text-[#09261E] dark:text-[#E2F2EB] truncate max-w-[90px]">
                {user?.username}
              </span>
            </div>

            <button
              onClick={toggleDarkMode}
              className="p-1.5 text-[#1C5F4D] dark:text-[#88C8AC] hover:bg-white/50 dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
              title="Toggle Dark Mode"
            >
              {user?.darkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Editorial Content Container */}
      <main className="flex-1 md:pl-56 2xl:pl-64 w-full min-w-0 pb-0 md:pb-24">
        <div className="max-w-4xl 2xl:max-w-6xl mx-auto w-full px-4 sm:px-6 py-0 md:p-10 2xl:p-12">
          {renderActivePanel()}
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 09 — DYNAMIC AI CAPTURE INPUT BAR (WITH TYPEWRITER & AMBIENT GLOW)        */}
      {/* ========================================================================= */}
      <div className="fixed bottom-22 md:bottom-8 left-1/2 -translate-x-1/2 md:left-[calc(50%+7rem)] 2xl:left-[calc(50%+8rem)] w-[92%] max-w-md md:max-w-lg 2xl:max-w-xl z-30 pointer-events-auto">
        <form
          onSubmit={handleFloatingSubmit}
          className="bg-white/95 dark:bg-[#09261E]/95 backdrop-blur-xl border border-[#00A86B]/40 dark:border-[#00A86B]/30 rounded-full shadow-2xl shadow-[#00A86B]/20 p-1.5 pl-3.5 sm:pl-4 flex items-center gap-2.5 transition-all hover:border-[#00A86B]/80 focus-within:border-[#00A86B] focus-within:ring-2 focus-within:ring-[#00A86B]/25 group"
        >
          {/* Animated AI Sparkle Indicator with Pulse Glow */}
          <div className="w-7 h-7 rounded-full bg-[#00A86B]/15 text-[#00A86B] flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-[#00A86B]" />
          </div>

          {/* Input field with typewriter animated placeholder */}
          <input
            type="text"
            value={floatingInput}
            onChange={(e) => setFloatingInput(e.target.value)}
            placeholder={typewriterText || "Tell SALDO what happened..."}
            className="flex-1 bg-transparent text-xs sm:text-sm font-semibold text-[#09261E] dark:text-white placeholder:text-[#1C5F4D]/60 dark:placeholder:text-[#88C8AC]/60 focus:outline-none min-w-0"
          />

          {/* Quick Submit Arrow Button */}
          <button
            type="submit"
            disabled={!floatingInput.trim()}
            className="w-8 h-8 rounded-full bg-[#00A86B] hover:bg-[#00935D] text-white flex items-center justify-center transition-all active:scale-90 cursor-pointer shadow-md shadow-[#00A86B]/30 disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
            title="Instant AI Capture"
          >
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* ========================================================================= */}
      {/* 10 — MOBILE BOTTOM NAVIGATION (4 ESSENTIAL DESTINATIONS)                  */}
      {/* ========================================================================= */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#09261E]/95 backdrop-blur-lg border-t border-[#D1EADE]/80 dark:border-[#14382C] md:hidden pb-safe">
        <div className="max-w-md mx-auto px-6 h-14 flex items-center justify-between">
          
          <button
            onClick={() => setActiveTab("home")}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
              activeTab === "home" ? "text-[#00A86B] font-bold" : "text-[#1C5F4D] dark:text-[#88C8AC] opacity-75"
            }`}
          >
            <Home className="w-4 h-4" />
            <span className="text-[10px]">Home</span>
          </button>

          <button
            onClick={() => setActiveTab("insights")}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
              activeTab === "insights" ? "text-[#00A86B] font-bold" : "text-[#1C5F4D] dark:text-[#88C8AC] opacity-75"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span className="text-[10px]">Insights</span>
          </button>

          <button
            onClick={() => setActiveTab("accounts")}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
              activeTab === "accounts" ? "text-[#00A86B] font-bold" : "text-[#1C5F4D] dark:text-[#88C8AC] opacity-75"
            }`}
          >
            <Landmark className="w-4 h-4" />
            <span className="text-[10px]">Accounts</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
              activeTab === "settings" ? "text-[#00A86B] font-bold" : "text-[#1C5F4D] dark:text-[#88C8AC] opacity-75"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span className="text-[10px]">Settings</span>
          </button>
        </div>
      </nav>

      {/* Hero Capture Modal */}
      <CaptureModal
        isOpen={showCaptureModal}
        onClose={() => {
          setShowCaptureModal(false);
          setCaptureInitialText("");
        }}
        initialText={captureInitialText}
        accounts={accounts}
        categories={categories}
        defaultAccountId={user?.defaultAccount?._id || user?.defaultAccount}
        onSaveTransaction={handleSaveTransaction}
        authFetch={authFetch}
      />

      {/* Transaction History Modal */}
      <TransactionHistoryModal
        isOpen={showLedgerModal}
        onClose={() => setShowLedgerModal(false)}
        accounts={accounts}
        categories={categories}
        authFetch={authFetch}
        initialAccountId={ledgerInitialAccountId}
        onTransactionUpdated={fetchData}
      />

      {/* Categories Modal */}
      {showCategoriesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-[#09261E] rounded-2xl shadow-2xl overflow-hidden animate-scale-up max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-[#D1EADE]/70 dark:border-[#14382C] flex justify-between items-center">
              <h3 className="text-sm font-black text-[#09261E] dark:text-white font-display">Manage Category Tags</h3>
              <button
                onClick={() => setShowCategoriesModal(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <CategoriesPanel
                categories={categories}
                onCreateCategory={handleCreateCategory}
                onUpdateCategory={handleUpdateCategory}
                onDeleteCategory={handleDeleteCategory}
              />
            </div>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#09261E] rounded-2xl p-6 shadow-2xl animate-scale-up space-y-4">
            <div className="flex justify-between items-center border-b border-[#D1EADE]/70 dark:border-[#14382C] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#00A86B]/15 text-[#00A86B] flex items-center justify-center font-bold">
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-black text-[#09261E] dark:text-white font-display">
                  Transfer Funds
                </h3>
              </div>
              <button
                onClick={() => setShowTransferModal(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {transferError && (
              <div className="p-2.5 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 rounded-lg text-xs font-semibold">
                {transferError}
              </div>
            )}

            <form onSubmit={handleExecuteTransfer} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#1C5F4D] dark:text-[#88C8AC] mb-1">
                  From Account (Source)
                </label>
                <select
                  value={transferSource}
                  onChange={(e) => setTransferSource(e.target.value)}
                  className="w-full p-2 bg-[#F4FAF6] dark:bg-[#071913] border border-[#D1EADE] dark:border-[#14382C] rounded-lg text-xs font-bold text-[#09261E] dark:text-white"
                >
                  {accounts.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.name} (Rp {a.balance.toLocaleString("id-ID")})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#1C5F4D] dark:text-[#88C8AC] mb-1">
                  To Account (Destination)
                </label>
                <select
                  value={transferDest}
                  onChange={(e) => setTransferDest(e.target.value)}
                  className="w-full p-2 bg-[#F4FAF6] dark:bg-[#071913] border border-[#D1EADE] dark:border-[#14382C] rounded-lg text-xs font-bold text-[#09261E] dark:text-white"
                >
                  {accounts.filter(a => a._id !== transferSource).map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.name} (Rp {a.balance.toLocaleString("id-ID")})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#1C5F4D] dark:text-[#88C8AC] mb-1">
                  Amount (Rp)
                </label>
                <input
                  type="text"
                  required
                  placeholder="0"
                  value={transferAmount}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    setTransferAmount(raw ? Number(raw).toLocaleString("id-ID") : "");
                  }}
                  className="w-full p-2 bg-[#F4FAF6] dark:bg-[#071913] border border-[#D1EADE] dark:border-[#14382C] rounded-lg text-sm font-black font-mono text-[#09261E] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#00A86B]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#1C5F4D] dark:text-[#88C8AC] mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={transferDesc}
                  onChange={(e) => setTransferDesc(e.target.value)}
                  placeholder="Transfer Dana"
                  className="w-full p-2 bg-[#F4FAF6] dark:bg-[#071913] border border-[#D1EADE] dark:border-[#14382C] rounded-lg text-xs font-bold text-[#09261E] dark:text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="flex-1 py-2 border border-[#D1EADE] dark:border-[#14382C] text-[#1C5F4D] dark:text-[#88C8AC] rounded-lg text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={transferSaving}
                  className="flex-1 py-2 bg-[#00A86B] hover:bg-[#00935D] text-white rounded-lg text-xs font-bold shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {transferSaving ? "Transferring..." : "Execute Transfer"}
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
