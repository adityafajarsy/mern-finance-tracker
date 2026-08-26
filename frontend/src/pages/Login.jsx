import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import hpHeroImage from "../assets/hp_hero.webp";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/app");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/app");
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen min-h-screen bg-white dark:bg-[#071913] text-[#09261E] dark:text-[#E2F2EB] grid grid-cols-1 md:grid-cols-12 overflow-hidden font-sans select-none">
      
      {/* ========================================================================= */}
      {/* LEFT PANEL: 100% Height Full-Screen Deep Green Visual With Swirls & Dots  */}
      {/* ========================================================================= */}
      <div className="hidden md:flex md:col-span-5 lg:col-span-5 bg-gradient-to-br from-[#061F16] via-[#09261E] to-[#04140E] p-8 lg:p-12 relative flex-col justify-between overflow-hidden text-white h-full">
        
        {/* Dot Grid Matrix Pattern 1 (Top-Right) */}
        <div className="absolute top-8 right-8 opacity-25 pointer-events-none">
          <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
            <pattern id="dot-pattern-full-1" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
              <circle cx="2.5" cy="2.5" r="1.8" fill="#00A86B" />
            </pattern>
            <rect width="100" height="100" fill="url(#dot-pattern-full-1)" />
          </svg>
        </div>

        {/* Dot Grid Matrix Pattern 2 (Bottom-Left) */}
        <div className="absolute bottom-8 left-8 opacity-20 pointer-events-none">
          <svg width="90" height="90" viewBox="0 0 90 90" fill="none">
            <pattern id="dot-pattern-full-2" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="#E8F5EE" />
            </pattern>
            <rect width="90" height="90" fill="url(#dot-pattern-full-2)" />
          </svg>
        </div>

        {/* Swirling Organic Green Vector Lines */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-85">
          <svg viewBox="0 0 500 700" fill="none" className="w-full h-full">
            <path
              d="M -60 420 
                 C 80 540, 160 580, 270 540 
                 C 340 510, 360 410, 300 350 
                 C 230 280, 140 330, 160 450 
                 C 180 570, 320 600, 440 460 
                 C 510 380, 540 220, 580 130"
              stroke="#00A86B"
              strokeWidth="16"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M -40 200 
                 C 90 140, 230 180, 320 280 
                 C 400 380, 510 350, 570 240"
              stroke="#00A86B"
              strokeWidth="8"
              strokeLinecap="round"
              opacity="0.35"
            />
          </svg>
        </div>

        {/* Ambient Center Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#00A86B]/25 blur-3xl rounded-full pointer-events-none" />

        {/* Top Wordmark */}
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-1.5 font-display font-black text-2xl tracking-tight text-white hover:opacity-90 transition-opacity">
            <span>SALDO</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#00A86B]"></span>
          </Link>
        </div>

        {/* Central 3D Product Visual */}
        <div className="relative z-10 flex items-center justify-center my-auto py-6">
          <div className="relative w-56 sm:w-64 lg:w-72 transform -rotate-6 hover:rotate-0 transition-transform duration-700 ease-out">
            <img
              src={hpHeroImage}
              alt="SALDO Visual"
              className="w-full h-auto object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.6)]"
            />
          </div>
        </div>

        {/* Bottom Statement */}
        <div className="relative z-10 space-y-0.5">
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#00A86B]">
            Intelligent Finance
          </p>
          <p className="text-xs font-medium text-[#B7DFCD]">
            Your money, understood.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT PANEL: 100% Height Full-Screen Editorial Login Form                 */}
      {/* ========================================================================= */}
      <div className="col-span-1 md:col-span-7 lg:col-span-7 p-6 sm:p-12 lg:p-16 flex flex-col justify-between h-full overflow-y-auto bg-white dark:bg-[#071913]">
        
        {/* Mobile Top Brand (Hidden on Desktop) */}
        <div className="md:hidden flex items-center justify-between pb-6 border-b border-[#D1EADE]/60">
          <Link to="/" className="flex items-center gap-1.5 font-display font-black text-xl tracking-tight text-[#09261E] dark:text-white">
            <span>SALDO</span>
            <span className="w-2 h-2 rounded-full bg-[#00A86B]"></span>
          </Link>
        </div>

        <div className="max-w-lg w-full mx-auto my-auto space-y-8 py-6">
          
          {/* Header Copy */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-[#09261E] dark:text-white">
              Welcome Back!
            </h1>
            <p className="text-xs sm:text-sm text-[#1C5F4D] dark:text-[#88C8AC] leading-relaxed font-medium">
              Log in now to explore all the features and benefits of our platform and see what's new.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="flex items-start gap-2.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 p-3.5 rounded-2xl animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-700 dark:text-rose-300 font-semibold">{error}</p>
            </div>
          )}

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Email Field Container */}
            <div className="bg-[#F8FAF9] dark:bg-[#09261E]/50 border border-[#D1EADE]/70 dark:border-[#14382C] rounded-2xl p-4 focus-within:border-[#00A86B] focus-within:ring-1 focus-within:ring-[#00A86B] transition-all">
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#1C5F4D] dark:text-[#88C8AC]">
                Enter your email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="johndoe@mail.domain"
                className="w-full bg-transparent text-sm font-bold text-[#09261E] dark:text-white placeholder:text-zinc-400 focus:outline-none mt-1"
              />
            </div>

            {/* Password Field Container */}
            <div className="bg-[#F8FAF9] dark:bg-[#09261E]/50 border border-[#D1EADE]/70 dark:border-[#14382C] rounded-2xl p-4 focus-within:border-[#00A86B] focus-within:ring-1 focus-within:ring-[#00A86B] transition-all relative">
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#1C5F4D] dark:text-[#88C8AC]">
                Enter your Password
              </label>
              <div className="flex items-center justify-between mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-transparent text-sm font-bold text-[#09261E] dark:text-white placeholder:text-zinc-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-zinc-400 hover:text-[#09261E] dark:hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Options Row */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-[#1C5F4D] dark:text-[#88C8AC] font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-[#00A86B] focus:ring-[#00A86B] border-[#D1EADE] cursor-pointer"
                />
                <span>Remember my account</span>
              </label>

              <a href="#" className="text-xs font-semibold text-[#1C5F4D] dark:text-[#88C8AC] hover:text-[#00A86B] transition-colors">
                Forgot Password?
              </a>
            </div>

            {/* Bottom Row: Register link on Left & Login button on Right */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-[#D1EADE]/50 dark:border-[#14382C]">
              <div>
                <p className="text-xs text-[#1C5F4D] dark:text-[#88C8AC] font-medium">
                  Don't have an account?
                </p>
                <Link
                  to="/register"
                  className="text-xs font-black text-[#09261E] dark:text-white hover:text-[#00A86B] dark:hover:text-[#00A86B] transition-colors inline-flex items-center gap-0.5 mt-0.5"
                >
                  <span>Register Now</span>
                  <span className="text-[#00A86B] tracking-tight">{'>>>'}</span>
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-10 py-3.5 bg-[#00A86B] hover:bg-[#00935D] text-white rounded-2xl text-sm font-black shadow-lg shadow-[#00A86B]/25 transition-all cursor-pointer disabled:opacity-50 active:scale-98 self-stretch sm:self-auto text-center"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </div>

          </form>

        </div>

        {/* Footer info */}
        <div className="text-[11px] text-[#1C5F4D] dark:text-[#88C8AC] text-center pt-4">
          © {new Date().getFullYear()} SALDO. All rights reserved.
        </div>

      </div>

    </div>
  );
};

export default Login;
