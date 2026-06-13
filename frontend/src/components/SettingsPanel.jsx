import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { User, Settings, Lock, Mail, DollarSign, Eye, EyeOff, CheckCircle } from "lucide-react";

const SettingsPanel = () => {
  const { user, updateProfile } = useAuth();

  // Settings states
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [currency, setCurrency] = useState(user?.currency || "IDR");
  
  // Status feedback states
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError("");

    try {
      const payload = {
        username,
        email,
        currency: "IDR",
      };

      if (password) {
        payload.password = password;
      }

      await updateProfile(payload);
      setPassword("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || "Failed to update profile details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight font-display">Settings</h2>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">Manage your financial tracker settings & profile</p>
      </div>

      {/* Settings Forms */}
      <div className="bg-white dark:bg-zinc-900 border border-[#EEF2F7] dark:border-zinc-800/80 rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300">
        
        {/* Success Feedback Alert */}
        {success && (
          <div className="mb-6 flex items-start gap-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 p-4 rounded-2xl animate-fade-in">
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-sm text-emerald-700 dark:text-emerald-300 font-semibold">Profile updated successfully!</p>
          </div>
        )}

        {/* Error Feedback Alert */}
        {error && (
          <div className="mb-6 flex items-start gap-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 p-4 rounded-2xl animate-shake">
            <User className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <p className="text-sm text-rose-700 dark:text-rose-300 font-semibold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Section: Personal Info */}
          <div className="space-y-5">
            <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-2 font-display">
              <User className="w-4.5 h-4.5 text-violet-600 dark:text-violet-400" />
              Personal Details
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Username */}
                <div>
                  <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Username</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <User className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                    </span>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-zinc-50/50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-600 dark:focus:ring-violet-500 font-medium transition-all"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Email Address</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-zinc-50/50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-600 dark:focus:ring-violet-500 font-medium transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Update Password (Optional)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Leave blank to keep current password"
                    className="w-full pl-10 pr-10 py-3 bg-zinc-50/50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-600 dark:focus:ring-violet-500 font-medium transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-violet-500/20 cursor-pointer transition-all duration-200 disabled:opacity-50"
            >
              {loading ? "Saving Changes..." : "Save Preferences"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPanel;
