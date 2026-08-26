import { useAuth } from "../context/AuthContext";
import { LogOut, User, Sun, Moon } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const { user, logout, updateProfile } = useAuth();

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

  if (user) {
    if (user.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-[#E8F5EE]/90 dark:bg-[#071913]/90 backdrop-blur-md border-b border-[#D1E8DD] dark:border-[#14382C] transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between select-none">

        {/* Brand Logo */}
        <Link to="/app" className="flex items-center gap-1">
          <span className="text-xl font-black font-display text-[#08241B] dark:text-white tracking-tight">
            SALDO
          </span>
        </Link>

        {/* User profile controls & theme toggle */}
        {user && (
          <div className="flex items-center gap-2.5">

            {/* Theme Toggle Button */}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-[#1C5F4D] dark:text-[#88C8AC] hover:bg-white/60 dark:hover:bg-[#0D261E] rounded-xl transition-all cursor-pointer"
              title="Toggle Dark Mode"
            >
              {user.darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Profile Avatar & Info */}
            <div className="flex items-center gap-2 pl-2 border-l border-[#D1E8DD] dark:border-[#14382C]">
              <div className="w-7 h-7 bg-[#00A86B]/15 text-[#00A86B] border border-[#00A86B]/30 rounded-full flex items-center justify-center font-bold text-xs">
                {user.username ? user.username.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
              </div>
              <span className="hidden sm:inline text-xs font-bold text-[#08241B] dark:text-[#E2F2EB]">
                {user.username}
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all cursor-pointer flex items-center gap-1"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline text-xs font-bold">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
