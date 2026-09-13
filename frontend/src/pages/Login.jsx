import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AlertCircle, Eye, EyeOff, CheckCircle2, ArrowLeft, KeyRound, Mail, Sparkles, ShieldAlert } from "lucide-react";
import OtpInput from "../components/ui/OtpInput";
import hpHeroImage from "../assets/hp_hero.webp";

const Login = () => {
  // Login states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password modal/view states: "login" | "forgot_email" | "forgot_otp"
  const [viewMode, setViewMode] = useState("login");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  // Status message states
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/app");
    }
  }, [user, navigate]);

  // Standard Login Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      await login(email.trim().toLowerCase(), password);
      navigate("/app");
    } catch (err) {
      setError(err.message || "Email atau password tidak valid");
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password Step 1: Send Reset OTP
  const handleSendForgotOtp = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const cleanEmail = (forgotEmail || email).trim().toLowerCase();
      if (!cleanEmail) {
        throw new Error("Masukkan alamat email Anda");
      }

      const res = await fetch("/api/otp/send-forgot-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal mengirim kode reset");
      }

      setForgotEmail(cleanEmail);
      setSuccessMsg(data.message || `Kode reset telah dikirim ke ${cleanEmail}`);
      setViewMode("forgot_otp");
      setForgotOtp("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message || "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  // Resend Forgot Password OTP
  const handleResendForgotOtp = async () => {
    setError("");
    setSuccessMsg("");
    setResendLoading(true);

    try {
      const cleanEmail = forgotEmail.trim().toLowerCase();
      const res = await fetch("/api/otp/send-forgot-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal mengirim ulang kode reset");
      }

      setSuccessMsg(`Kode reset baru telah dikirim ke ${cleanEmail}`);
    } catch (err) {
      setError(err.message || "Gagal mengirim ulang kode");
    } finally {
      setResendLoading(false);
    }
  };

  // Forgot Password Step 2: Verify OTP & Apply New Password
  const handleVerifyAndResetPassword = async (e) => {
    e.preventDefault();
    if (forgotOtp.length < 6) {
      setError("Masukkan 6-digit kode OTP reset lengkap");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password baru minimal 6 karakter");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password tidak cocok");
      return;
    }

    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/otp/verify-reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail.trim().toLowerCase(),
          otp: forgotOtp.trim(),
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal mereset password");
      }

      // Reset success! Switch back to login with success alert prefilled
      setEmail(forgotEmail);
      setPassword("");
      setViewMode("login");
      setSuccessMsg(data.message || "Password berhasil diubah. Silakan login dengan password baru Anda.");
      setError("");
    } catch (err) {
      setError(err.message || "Gagal mereset password. Periksa kode OTP Anda.");
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
            Asisten Keuangan Pribadi
          </p>
          <p className="text-xs font-medium text-[#B7DFCD]">
            Duit kamu, makin jelas.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT PANEL: 100% Height Full-Screen Editorial Login / Forgot OTP Form     */}
      {/* ========================================================================= */}
      <div className="col-span-1 md:col-span-7 lg:col-span-7 p-6 sm:p-12 lg:p-16 flex flex-col justify-between h-full overflow-y-auto bg-white dark:bg-[#071913] relative">
        
        {/* Mobile Ambient Background Decorations (Only visible on mobile screens) */}
        <div className="md:hidden absolute inset-0 pointer-events-none overflow-hidden -z-0">
          {/* Subtle Top-Right Ambient Swirling Vector Line */}
          <div className="absolute -top-10 -right-12 w-72 h-72 opacity-25 dark:opacity-20 pointer-events-none">
            <svg viewBox="0 0 300 300" fill="none" className="w-full h-full">
              <path
                d="M 50 280 C 120 180, 240 260, 260 120 C 270 50, 180 30, 120 70 C 60 110, 80 200, 160 210 C 240 220, 280 140, 290 20"
                stroke="#00A86B"
                strokeWidth="11"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Subtle Bottom-Left Swirling Line */}
          <div className="absolute -bottom-16 -left-16 w-64 h-64 opacity-20 dark:opacity-15 pointer-events-none">
            <svg viewBox="0 0 300 300" fill="none" className="w-full h-full">
              <path
                d="M 20 280 C 80 220, 180 240, 210 160 C 240 80, 150 40, 90 90 C 40 130, 80 210, 180 210"
                stroke="#00A86B"
                strokeWidth="9"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Dot Matrix Pattern at Top-Left */}
          <div className="absolute top-20 left-4 opacity-30 dark:opacity-20 pointer-events-none">
            <svg width="70" height="70" viewBox="0 0 70 70" fill="none">
              <pattern id="mobile-dots" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="#00A86B" />
              </pattern>
              <rect width="70" height="70" fill="url(#mobile-dots)" />
            </svg>
          </div>

          {/* Soft Emerald Center Glow */}
          <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-[#00A86B]/10 dark:bg-[#00A86B]/15 blur-3xl rounded-full pointer-events-none" />
        </div>

        {/* Mobile Top Brand (Hidden on Desktop) */}
        <div className="md:hidden flex items-center justify-between pb-6 border-b border-[#D1EADE]/60 relative z-10">
          <Link to="/" className="flex items-center gap-1.5 font-display font-black text-xl tracking-tight text-[#09261E] dark:text-white">
            <span>SALDO</span>
            <span className="w-2 h-2 rounded-full bg-[#00A86B]"></span>
          </Link>
        </div>

        <div className="max-w-lg w-full mx-auto my-auto space-y-6 py-6 relative z-10">
          
          {/* ========================================================================= */}
          {/* VIEW 1: STANDARD LOGIN FORM                                               */}
          {/* ========================================================================= */}
          {viewMode === "login" && (
            <div className="space-y-6 animate-fade-in">
              {/* Header Copy */}
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00A86B]/10 text-[#00A86B] dark:text-[#00E592] text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Halo, Selamat Datang Lagi!</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-[#09261E] dark:text-white">
                  Masuk ke SALDO
                </h1>
                <p className="text-xs sm:text-sm text-[#1C5F4D] dark:text-[#88C8AC] leading-relaxed font-medium">
                  Yuk, lanjut pantau keuanganmu dan lihat gimana progress saldo kamu hari ini.
                </p>
              </div>

              {/* Success Notification */}
              {successMsg && (
                <div className="flex items-start gap-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 p-3.5 rounded-2xl animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold">{successMsg}</p>
                </div>
              )}

              {/* Error Alert */}
              {error && (
                <div className="flex items-start gap-2.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 p-3.5 rounded-2xl animate-shake">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-rose-700 dark:text-rose-300 font-semibold">{error}</p>
                </div>
              )}

              {/* Form Fields */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                
                {/* Email Field Container */}
                <div className="bg-[#F8FAF9] dark:bg-[#09261E]/50 border border-[#D1EADE]/70 dark:border-[#14382C] rounded-2xl p-3.5 focus-within:border-[#00A86B] focus-within:ring-1 focus-within:ring-[#00A86B] transition-all">
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#1C5F4D] dark:text-[#88C8AC]">
                    Alamat Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full bg-transparent text-sm font-bold text-[#09261E] dark:text-white placeholder:text-zinc-400 focus:outline-none mt-1"
                  />
                </div>

                {/* Password Field Container */}
                <div className="bg-[#F8FAF9] dark:bg-[#09261E]/50 border border-[#D1EADE]/70 dark:border-[#14382C] rounded-2xl p-3.5 focus-within:border-[#00A86B] focus-within:ring-1 focus-within:ring-[#00A86B] transition-all relative">
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#1C5F4D] dark:text-[#88C8AC]">
                    Password
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
                    <span>Ingat saya</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setViewMode("forgot_email");
                      setError("");
                      setSuccessMsg("");
                    }}
                    className="text-xs font-bold text-[#1C5F4D] dark:text-[#88C8AC] hover:text-[#00A86B] dark:hover:text-[#00E592] transition-colors cursor-pointer"
                  >
                    Lupa Password?
                  </button>
                </div>

                {/* Bottom Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5 border-t border-[#D1EADE]/50 dark:border-[#14382C]">
                  <div>
                    <p className="text-xs text-[#1C5F4D] dark:text-[#88C8AC] font-medium">
                      Belum punya akun?
                    </p>
                    <Link
                      to="/register"
                      className="text-xs font-black text-[#09261E] dark:text-white hover:text-[#00A86B] dark:hover:text-[#00A86B] transition-colors inline-flex items-center gap-0.5 mt-0.5"
                    >
                      <span>Daftar Sekarang</span>
                      <span className="text-[#00A86B] tracking-tight">{'>>>'}</span>
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="px-10 py-3.5 bg-[#00A86B] hover:bg-[#00935D] text-white rounded-2xl text-sm font-black shadow-lg shadow-[#00A86B]/25 transition-all cursor-pointer disabled:opacity-50 active:scale-98 self-stretch sm:self-auto text-center"
                  >
                    {loading ? "Masuk..." : "Masuk Sekarang"}
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 2: FORGOT PASSWORD - STEP 1 (INPUT EMAIL)                            */}
          {/* ========================================================================= */}
          {viewMode === "forgot_email" && (
            <div className="space-y-6 animate-fade-in">
              <button
                type="button"
                onClick={() => {
                  setViewMode("login");
                  setError("");
                  setSuccessMsg("");
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1C5F4D] dark:text-[#88C8AC] hover:text-[#00A86B] dark:hover:text-[#00E592] cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Login</span>
              </button>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00A86B]/15 text-[#00A86B] dark:text-[#00E592] text-xs font-bold">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Reset Password</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-[#09261E] dark:text-white">
                  Lupa Password?
                </h1>
                <p className="text-xs sm:text-sm text-[#1C5F4D] dark:text-[#88C8AC] leading-relaxed font-medium">
                  Masukkan email terdaftar Anda. Kami akan mengirimkan 6-digit kode OTP untuk mereset password akun Anda.
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 p-3.5 rounded-2xl animate-shake">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-rose-700 dark:text-rose-300 font-semibold">{error}</p>
                </div>
              )}

              <form onSubmit={handleSendForgotOtp} className="space-y-4">
                <div className="bg-[#F8FAF9] dark:bg-[#09261E]/50 border border-[#D1EADE]/70 dark:border-[#14382C] rounded-2xl p-3.5 focus-within:border-[#00A86B] focus-within:ring-1 focus-within:ring-[#00A86B] transition-all">
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#1C5F4D] dark:text-[#88C8AC]">
                    Email Terdaftar
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full bg-transparent text-sm font-bold text-[#09261E] dark:text-white placeholder:text-zinc-400 focus:outline-none mt-1"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !forgotEmail}
                  className="w-full py-4 bg-[#00A86B] hover:bg-[#00935D] text-white rounded-2xl text-sm font-black shadow-lg shadow-[#00A86B]/25 transition-all cursor-pointer disabled:opacity-50 active:scale-98 flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>{loading ? "Mengirim Kode..." : "Kirim Kode Reset Password"}</span>
                </button>
              </form>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 3: FORGOT PASSWORD - STEP 2 (OTP + NEW PASSWORD)                     */}
          {/* ========================================================================= */}
          {viewMode === "forgot_otp" && (
            <div className="space-y-6 animate-fade-in">
              <button
                type="button"
                onClick={() => {
                  setViewMode("forgot_email");
                  setError("");
                  setSuccessMsg("");
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1C5F4D] dark:text-[#88C8AC] hover:text-[#00A86B] dark:hover:text-[#00E592] cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Ganti Email Reset</span>
              </button>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00A86B]/15 text-[#00A86B] dark:text-[#00E592] text-xs font-bold">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Verifikasi & Password Baru</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-[#09261E] dark:text-white">
                  Buat Password Baru
                </h1>
                <p className="text-xs sm:text-sm text-[#1C5F4D] dark:text-[#88C8AC] leading-relaxed font-medium">
                  Masukkan 6-digit kode OTP dari email{" "}
                  <span className="font-bold text-[#09261E] dark:text-white underline decoration-[#00A86B]">{forgotEmail}</span>{" "}
                  beserta password baru Anda.
                </p>
              </div>

              {/* Success Notification */}
              {successMsg && (
                <div className="flex items-start gap-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 p-3.5 rounded-2xl animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold">{successMsg}</p>
                </div>
              )}

              {/* Error Alert */}
              {error && (
                <div className="flex items-start gap-2.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 p-3.5 rounded-2xl animate-shake">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-rose-700 dark:text-rose-300 font-semibold">{error}</p>
                </div>
              )}

              <form onSubmit={handleVerifyAndResetPassword} className="space-y-4">
                
                {/* 6 Digit OTP Input */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#1C5F4D] dark:text-[#88C8AC]">
                    Kode OTP Reset 6-Digit
                  </label>
                  <OtpInput
                    length={6}
                    value={forgotOtp}
                    onChange={setForgotOtp}
                    onResend={handleResendForgotOtp}
                    resendLoading={resendLoading}
                    resendCooldown={60}
                    disabled={loading}
                  />
                </div>

                {/* New Password Field */}
                <div className="bg-[#F8FAF9] dark:bg-[#09261E]/50 border border-[#D1EADE]/70 dark:border-[#14382C] rounded-2xl p-3.5 focus-within:border-[#00A86B] focus-within:ring-1 focus-within:ring-[#00A86B] transition-all relative">
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#1C5F4D] dark:text-[#88C8AC]">
                    Password Baru
                  </label>
                  <div className="flex items-center justify-between mt-1">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="w-full bg-transparent text-sm font-bold text-[#09261E] dark:text-white placeholder:text-zinc-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="p-1 text-zinc-400 hover:text-[#09261E] dark:hover:text-white transition-colors cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password Field */}
                <div className="bg-[#F8FAF9] dark:bg-[#09261E]/50 border border-[#D1EADE]/70 dark:border-[#14382C] rounded-2xl p-3.5 focus-within:border-[#00A86B] focus-within:ring-1 focus-within:ring-[#00A86B] transition-all">
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#1C5F4D] dark:text-[#88C8AC]">
                    Konfirmasi Password Baru
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ketik ulang password baru"
                    className="w-full bg-transparent text-sm font-bold text-[#09261E] dark:text-white placeholder:text-zinc-400 focus:outline-none mt-1"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || forgotOtp.length < 6 || !newPassword}
                  className="w-full py-4 bg-[#00A86B] hover:bg-[#00935D] text-white rounded-2xl text-sm font-black shadow-xl shadow-[#00A86B]/25 transition-all cursor-pointer disabled:opacity-50 active:scale-98 flex items-center justify-center gap-2 mt-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{loading ? "Menyimpan Password Baru..." : "Simpan Password Baru"}</span>
                </button>
              </form>
            </div>
          )}

        </div>

        {/* Footer info */}
        <div className="text-[11px] text-[#1C5F4D] dark:text-[#88C8AC] text-center pt-4">
          © {new Date().getFullYear()} SALDO. Hak cipta dilindungi.
        </div>

      </div>

    </div>
  );
};

export default Login;
