import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AlertCircle, Eye, EyeOff, CheckCircle2, ArrowLeft, Mail, ShieldCheck, Sparkles } from "lucide-react";
import OtpInput from "../components/ui/OtpInput";
import hpHeroImage from "../assets/hp_hero.webp";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // OTP Verification state
  const [step, setStep] = useState("form"); // "form" | "otp"
  const [otpCode, setOtpCode] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/app");
    }
  }, [user, navigate]);

  // Step 1: Send Signup OTP
  const handleSendSignupOtp = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/otp/send-signup-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal mengirim kode verifikasi");
      }

      setSuccessMsg(data.message || `Kode verifikasi telah dikirim ke ${email}`);
      setStep("otp");
      setOtpCode("");
    } catch (err) {
      setError(err.message || "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setError("");
    setSuccessMsg("");
    setResendLoading(true);

    try {
      const res = await fetch("/api/otp/send-signup-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal mengirim ulang kode");
      }

      setSuccessMsg(`Kode baru berhasil dikirim ke ${email}`);
    } catch (err) {
      setError(err.message || "Gagal mengirim ulang kode");
    } finally {
      setResendLoading(false);
    }
  };

  // Step 2: Verify OTP & Finalize Registration
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    if (otpCode.length < 6) {
      setError("Masukkan 6-digit kode OTP lengkap");
      return;
    }

    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      // 1. Verify OTP with backend
      const verifyRes = await fetch("/api/otp/verify-signup-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: otpCode.trim(),
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        throw new Error(verifyData.message || "Kode OTP tidak valid");
      }

      // 2. Official user registration
      await register(username.trim(), email.trim().toLowerCase(), password);

      // 3. Mark user as emailVerified
      try {
        await fetch("/api/otp/mark-verified", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim().toLowerCase() }),
        });
      } catch (err) {
        // Non-blocking
        console.warn("Failed to mark email verified:", err);
      }

      // 4. Instant navigation to Dashboard
      navigate("/app");
    } catch (err) {
      setError(err.message || "Verifikasi atau registrasi gagal. Silakan coba lagi.");
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
            <pattern id="reg-dot-full-1" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
              <circle cx="2.5" cy="2.5" r="1.8" fill="#00A86B" />
            </pattern>
            <rect width="100" height="100" fill="url(#reg-dot-full-1)" />
          </svg>
        </div>

        {/* Dot Grid Matrix Pattern 2 (Bottom-Left) */}
        <div className="absolute bottom-8 left-8 opacity-20 pointer-events-none">
          <svg width="90" height="90" viewBox="0 0 90 90" fill="none">
            <pattern id="reg-dot-full-2" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="#E8F5EE" />
            </pattern>
            <rect width="90" height="90" fill="url(#reg-dot-full-2)" />
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
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#00A86B] flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Aman Lewat Verifikasi Email OTP</span>
          </p>
          <p className="text-xs font-medium text-[#B7DFCD]">
            Akun kamu terlindungi dengan verifikasi email sebelum bisa masuk.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT PANEL: 100% Height Full-Screen Editorial Register / OTP Form        */}
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
              <pattern id="mobile-reg-dots" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="#00A86B" />
              </pattern>
              <rect width="70" height="70" fill="url(#mobile-reg-dots)" />
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
          {/* STEP 1: INITIAL REGISTRATION FORM (INPUT NAME, EMAIL, PASSWORD)            */}
          {/* ========================================================================= */}
          {step === "form" && (
            <div className="space-y-6 animate-fade-in">
              {/* Header Copy */}
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00A86B]/10 text-[#00A86B] dark:text-[#00E592] text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Gratis & Gampang Banget</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-[#09261E] dark:text-white">
                  Buat Akun Gratis
                </h1>
                <p className="text-xs sm:text-sm text-[#1C5F4D] dark:text-[#88C8AC] leading-relaxed font-medium">
                  Daftar di SALDO dan mulai catat keuanganmu dengan simpel. Cukup ketik atau ngomong, beres dalam detik.
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
              <form onSubmit={handleSendSignupOtp} className="space-y-4">
                
                {/* Username Field Container */}
                <div className="bg-[#F8FAF9] dark:bg-[#09261E]/50 border border-[#D1EADE]/70 dark:border-[#14382C] rounded-2xl p-3.5 focus-within:border-[#00A86B] focus-within:ring-1 focus-within:ring-[#00A86B] transition-all">
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#1C5F4D] dark:text-[#88C8AC]">
                    Nama / Username Anda
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Aditya Fajar"
                    className="w-full bg-transparent text-sm font-bold text-[#09261E] dark:text-white placeholder:text-zinc-400 focus:outline-none mt-1"
                  />
                </div>

                {/* Email Field Container */}
                <div className="bg-[#F8FAF9] dark:bg-[#09261E]/50 border border-[#D1EADE]/70 dark:border-[#14382C] rounded-2xl p-3.5 focus-within:border-[#00A86B] focus-within:ring-1 focus-within:ring-[#00A86B] transition-all">
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#1C5F4D] dark:text-[#88C8AC]">
                    Alamat Email (Untuk Pengiriman OTP)
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
                    Buat Password
                  </label>
                  <div className="flex items-center justify-between mt-1">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
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

                {/* Terms Agreement */}
                <div className="pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-[#1C5F4D] dark:text-[#88C8AC] font-medium">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      required
                      className="w-4 h-4 rounded text-[#00A86B] focus:ring-[#00A86B] border-[#D1EADE] cursor-pointer"
                    />
                    <span>Saya menyetujui Ketentuan Layanan & Kebijakan Privasi</span>
                  </label>
                </div>

                {/* Bottom Action Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5 border-t border-[#D1EADE]/50 dark:border-[#14382C]">
                  <div>
                    <p className="text-xs text-[#1C5F4D] dark:text-[#88C8AC] font-medium">
                      Sudah punya akun?
                    </p>
                    <Link
                      to="/login"
                      className="text-xs font-black text-[#09261E] dark:text-white hover:text-[#00A86B] dark:hover:text-[#00A86B] transition-colors inline-flex items-center gap-0.5 mt-0.5"
                    >
                      <span>Login Sekarang</span>
                      <span className="text-[#00A86B] tracking-tight">{'>>>'}</span>
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !agreeTerms}
                    className="px-8 py-3.5 bg-[#00A86B] hover:bg-[#00935D] text-white rounded-2xl text-sm font-black shadow-lg shadow-[#00A86B]/25 transition-all cursor-pointer disabled:opacity-50 active:scale-98 self-stretch sm:self-auto text-center flex items-center justify-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    <span>{loading ? "Mengirim Kode..." : "Daftar & Kirim Kode"}</span>
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: 6-DIGIT EMAIL OTP VERIFICATION FORM                               */}
          {/* ========================================================================= */}
          {step === "otp" && (
            <div className="space-y-6 animate-fade-in">
              {/* Back to form button */}
              <button
                type="button"
                onClick={() => {
                  setStep("form");
                  setError("");
                  setSuccessMsg("");
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1C5F4D] dark:text-[#88C8AC] hover:text-[#00A86B] dark:hover:text-[#00E592] cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Ubah Data / Ganti Email</span>
              </button>

              {/* Header Copy */}
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00A86B]/15 text-[#00A86B] dark:text-[#00E592] text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verifikasi Email 2FA</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-[#09261E] dark:text-white">
                  Masukkan Kode OTP
                </h1>
                <p className="text-xs sm:text-sm text-[#1C5F4D] dark:text-[#88C8AC] leading-relaxed font-medium">
                  Kami telah mengirimkan 6-digit kode OTP ke{" "}
                  <span className="font-bold text-[#09261E] dark:text-white underline decoration-[#00A86B]">{email}</span>.
                  Kode berlaku selama 5 menit.
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

              {/* OTP Form */}
              <form onSubmit={handleVerifyAndRegister} className="space-y-6">
                
                {/* 6 Digit Auto-focus Input */}
                <OtpInput
                  length={6}
                  value={otpCode}
                  onChange={setOtpCode}
                  onResend={handleResendOtp}
                  resendLoading={resendLoading}
                  resendCooldown={60}
                  disabled={loading}
                />

                {/* Submit Verification Button */}
                <button
                  type="submit"
                  disabled={loading || otpCode.length < 6}
                  className="w-full py-4 bg-[#00A86B] hover:bg-[#00935D] text-white rounded-2xl text-sm font-black shadow-xl shadow-[#00A86B]/25 transition-all cursor-pointer disabled:opacity-50 active:scale-98 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{loading ? "Memverifikasi & Membuat Akun..." : "Verifikasi & Buat Akun"}</span>
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

export default Register;
