import { useAuth } from "../context/AuthContext";
import { LogOut, User, Sun, Moon, Vault } from "lucide-react";

const Navbar = () => {
  const { user, logout, updateProfile } = useAuth();

  const toggleDarkMode = async () => {
    if (!user) return;
    const nextMode = !user.darkMode;
    try {
      await updateProfile({ darkMode: nextMode });

      // Update HTML class list for Tailwind dark mode
      if (nextMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch (err) {
      console.error("Failed to toggle dark mode:", err);
    }
  };

  // Sync theme class list on mount/user change
  if (user) {
    if (user.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between select-none">

        {/* Brand Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-violet-600 dark:bg-violet-500 rounded-xl flex items-center justify-center shadow-md shadow-violet-500/20">
            <Vault className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-lg font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-0.5">
            VAULT
            <span className="text-violet-600 dark:text-violet-400 font-extrabold font-mono">.</span>
          </span>
        </div>

        {/* User profile controls & theme toggle */}
        {user && (
          <div className="flex items-center gap-3">

            {/* Theme Toggle Button */}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition-all cursor-pointer"
              title="Toggle Dark Mode"
            >
              {user.darkMode ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {/* Profile Avatar & Info */}
            <div className="flex items-center gap-2 pl-2 border-l border-zinc-200 dark:border-zinc-800">
              <div className="w-7 h-7 bg-violet-100 dark:bg-violet-950/50 border border-violet-200 dark:border-violet-900/50 text-violet-600 dark:text-violet-400 rounded-full flex items-center justify-center font-bold text-xs">
                {user.username ? user.username.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
              </div>
              <span className="hidden sm:inline text-xs font-bold text-zinc-700 dark:text-zinc-300">
                {user.username}
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              title="Logout"
            >
              <LogOut className="w-4.5 h-4.5" />
              <span className="hidden md:inline text-xs font-bold">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
