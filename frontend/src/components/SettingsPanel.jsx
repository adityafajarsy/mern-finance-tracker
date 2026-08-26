import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  User, 
  Mail, 
  Moon, 
  Sun, 
  DollarSign, 
  Tag, 
  Check, 
  ShieldCheck,
  Landmark,
  LogOut
} from "lucide-react";

const SettingsPanel = ({ accounts = [], onOpenCategoriesModal }) => {
  const { user, updateProfile, logout } = useAuth();

  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currency, setCurrency] = useState(user?.currency || "IDR");
  const [defaultAccount, setDefaultAccount] = useState(user?.defaultAccount?._id || user?.defaultAccount || "");
  const [darkMode, setDarkMode] = useState(user?.darkMode || false);
  const [password, setPassword] = useState("");

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const payload = {
        username,
        email,
        currency,
        darkMode,
        defaultAccount: defaultAccount || null,
      };
      if (password) {
        payload.password = password;
      }

      await updateProfile(payload);
      setSuccessMsg("Settings saved successfully.");
      setPassword("");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg(err.message || "Failed to update profile settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-8 animate-fade-in pb-12 font-sans">
      
      {/* Header */}
      <div className="border-b border-[#D1EADE]/70 dark:border-[#14382C] pb-4">
        <h2 className="text-2xl sm:text-3xl font-black text-[#09261E] dark:text-white tracking-tight font-display">
          Settings
        </h2>
        <p className="text-xs text-[#1C5F4D] dark:text-[#88C8AC] mt-0.5">
          Configure preferences, default automation, and personal profile
        </p>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4" />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 rounded-lg text-xs font-bold">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-8">
        
        {/* 1. PROFILE SECTION (QUIET EDITORIAL) */}
        <section className="space-y-4">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#1C5F4D] dark:text-[#88C8AC]">
            Profile Details
          </span>

          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-[#09261E] dark:text-white mb-1">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2.5 bg-white dark:bg-[#09261E] border border-[#D1EADE] dark:border-[#14382C] rounded-lg text-xs font-bold text-[#09261E] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#00A86B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#09261E] dark:text-white mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 bg-white dark:bg-[#09261E] border border-[#D1EADE] dark:border-[#14382C] rounded-lg text-xs font-bold text-[#09261E] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#00A86B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#09261E] dark:text-white mb-1">New Password (leave blank to keep current)</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2.5 bg-white dark:bg-[#09261E] border border-[#D1EADE] dark:border-[#14382C] rounded-lg text-xs font-bold text-[#09261E] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#00A86B]"
              />
            </div>
          </div>
        </section>

        {/* 2. AUTOMATION & PREFERENCES SECTION */}
        <section className="space-y-4 pt-4 border-t border-[#D1EADE]/70 dark:border-[#14382C]">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#1C5F4D] dark:text-[#88C8AC]">
            Automation & Display
          </span>

          <div className="space-y-4 pt-1">
            {/* Default Expense Account */}
            <div>
              <label className="block text-xs font-bold text-[#09261E] dark:text-white mb-1">
                Default Expense Account
              </label>
              <p className="text-[11px] text-[#1C5F4D] dark:text-[#88C8AC] mb-2">
                When you record an expense without explicitly mentioning an account, SALDO automatically resolves it to this account.
              </p>
              <select
                value={defaultAccount}
                onChange={(e) => setDefaultAccount(e.target.value)}
                className="w-full p-2.5 bg-white dark:bg-[#09261E] border border-[#D1EADE] dark:border-[#14382C] rounded-lg text-xs font-bold text-[#09261E] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#00A86B] cursor-pointer"
              >
                <option value="">Auto-detect / First Account</option>
                {accounts.map((a) => (
                  <option key={a._id} value={a._id}>{a.name} ({a.type})</option>
                ))}
              </select>
            </div>

            {/* Display Currency */}
            <div>
              <label className="block text-xs font-bold text-[#09261E] dark:text-white mb-1">
                Display Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full p-2.5 bg-white dark:bg-[#09261E] border border-[#D1EADE] dark:border-[#14382C] rounded-lg text-xs font-bold text-[#09261E] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#00A86B] cursor-pointer"
              >
                <option value="IDR">IDR (Indonesian Rupiah - Rp)</option>
                <option value="USD">USD (US Dollar - $)</option>
                <option value="EUR">EUR (Euro - €)</option>
              </select>
            </div>

            {/* Dark Mode Toggle */}
            <div className="flex justify-between items-center pt-2">
              <div>
                <p className="text-xs font-bold text-[#09261E] dark:text-white">Dark Mode Appearance</p>
                <p className="text-[11px] text-[#1C5F4D] dark:text-[#88C8AC]">Toggle between soft mint and deep forest foundations</p>
              </div>
              <button
                type="button"
                onClick={() => setDarkMode(!darkMode)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${darkMode ? "bg-[#00A86B]" : "bg-zinc-300"}`}
              >
                <span className={`w-4.5 h-4.5 bg-white rounded-full absolute top-0.75 transition-transform ${darkMode ? "left-5.5" : "left-1"}`} />
              </button>
            </div>
          </div>
        </section>

        {/* 3. CATEGORIES SECTION */}
        <section className="space-y-3 pt-4 border-t border-[#D1EADE]/70 dark:border-[#14382C]">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#1C5F4D] dark:text-[#88C8AC]">
                Category Tags
              </span>
              <p className="text-xs text-[#09261E] dark:text-white font-bold mt-0.5">Manage Categories & Labels</p>
            </div>
            <button
              type="button"
              onClick={onOpenCategoriesModal}
              className="px-3.5 py-1.5 bg-[#E8F5EE] dark:bg-[#071913] border border-[#D1EADE] dark:border-[#14382C] text-[#00A86B] rounded-lg text-xs font-bold hover:bg-[#D3ECE0] transition-colors cursor-pointer"
            >
              Manage Tags →
            </button>
          </div>
        </section>

        {/* 4. ACTIONS & SIGN OUT */}
        <div className="pt-4 border-t border-[#D1EADE]/70 dark:border-[#14382C] space-y-3">
          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 bg-[#00A86B] hover:bg-[#00935D] text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Preferences"}
          </button>

          <button
            type="button"
            onClick={logout}
            className="w-full py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

      </form>
    </div>
  );
};

export default SettingsPanel;
