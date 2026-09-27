import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Wallet,
  CalendarDays,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

const ACCOUNT_TYPES = ["Cash", "Bank", "E-Wallet"];

const DAY_LABELS = {
  1: "1 (Awal bulan)",
  5: "5",
  10: "10",
  15: "15 (Pertengahan bulan)",
  20: "20",
  25: "25",
  26: "26",
  27: "27",
  28: "28 (Akhir bulan aman)",
};

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, authFetch, updateProfile } = useAuth();

  const [step, setStep] = useState(1); // 1 = saldo awal, 2 = tanggal siklus
  const [accounts, setAccounts] = useState([]);
  const [balances, setBalances] = useState({});
  const [cycleStartDay, setCycleStartDay] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Fetch user accounts
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await authFetch("/api/accounts");
        if (res.ok) {
          const data = await res.json();
          setAccounts(data);
          // Pre-fill balances with 0
          const initial = {};
          data.forEach((a) => {
            initial[a._id] = "";
          });
          setBalances(initial);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchAccounts();
  }, []);

  const handleBalanceChange = (id, value) => {
    const raw = value.replace(/\D/g, "");
    setBalances((prev) => ({ ...prev, [id]: raw ? Number(raw).toLocaleString("id-ID") : "" }));
  };

  const handleStep1Next = async () => {
    setSaving(true);
    setError("");
    try {
      // Update each account balance
      await Promise.all(
        accounts.map(async (acc) => {
          const raw = String(balances[acc._id] || "0").replace(/\./g, "").replace(/,/g, "");
          const numBalance = parseFloat(raw) || 0;
          if (numBalance !== acc.balance) {
            const res = await authFetch(`/api/accounts/${acc._id}`, {
              method: "PUT",
              body: JSON.stringify({ ...acc, balance: numBalance }),
            });
            if (!res.ok) throw new Error("Gagal menyimpan saldo akun");
          }
        })
      );
      setStep(2);
    } catch (err) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    setError("");
    try {
      await updateProfile({ cycleStartDay });
      navigate("/app");
    } catch (err) {
      setError(err.message || "Gagal menyimpan pengaturan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E8F5EE] dark:bg-[#071913] flex flex-col items-center justify-center px-4 py-12 font-sans select-none">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#00A86B]/10 blur-3xl rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8 space-y-2">
          <div className="flex items-center justify-center gap-1.5 font-display font-black text-2xl tracking-tight text-[#09261E] dark:text-white">
            <span>SALDO</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#00A86B]" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00A86B]/10 text-[#00A86B] text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Setup Awal · Cuma sekali</span>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 justify-center mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  step === s
                    ? "bg-[#00A86B] text-white shadow-md shadow-[#00A86B]/30"
                    : step > s
                    ? "bg-[#00A86B]/20 text-[#00A86B]"
                    : "bg-[#D1EADE] dark:bg-[#14382C] text-[#1C5F4D] dark:text-[#88C8AC]"
                }`}
              >
                {step > s ? <Check className="w-3.5 h-3.5" /> : s}
              </div>
              {s < 2 && <div className={`h-0.5 w-12 rounded-full ${step > s ? "bg-[#00A86B]" : "bg-[#D1EADE] dark:bg-[#14382C]"}`} />}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-[#09261E] rounded-2xl shadow-xl border border-[#D1EADE]/70 dark:border-[#14382C] overflow-hidden">
          
          {/* ======================================================= */}
          {/* STEP 1: Saldo Awal                                       */}
          {/* ======================================================= */}
          {step === 1 && (
            <div className="p-6 space-y-6 animate-fade-in">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#00A86B]/15 text-[#00A86B] flex items-center justify-center shrink-0">
                  <Wallet className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-[#09261E] dark:text-white font-display tracking-tight">
                    Berapa saldo rekening kamu sekarang?
                  </h2>
                  <p className="text-xs text-[#1C5F4D] dark:text-[#88C8AC] mt-0.5 leading-relaxed">
                    Isi saldo awal masing-masing rekening. Boleh dikosongkan kalau belum tahu atau isi nanti di tab Rekening.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {accounts.map((acc) => (
                  <div
                    key={acc._id}
                    className="bg-[#F4FAF6] dark:bg-[#071913] rounded-xl p-3.5 border border-[#D1EADE]/60 dark:border-[#14382C] focus-within:border-[#00A86B] focus-within:ring-1 focus-within:ring-[#00A86B] transition-all"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: acc.color || "#00A86B" }}
                        />
                        <span className="text-xs font-bold text-[#09261E] dark:text-white">
                          {acc.name}
                        </span>
                        <span className="text-[10px] text-[#1C5F4D] dark:text-[#88C8AC] font-medium">
                          {acc.type}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs font-bold text-[#1C5F4D] dark:text-[#88C8AC] shrink-0">Rp</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="0"
                        value={balances[acc._id] || ""}
                        onChange={(e) => handleBalanceChange(acc._id, e.target.value)}
                        className="w-full bg-transparent text-sm font-black text-[#09261E] dark:text-white placeholder:text-zinc-400 focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {error && (
                <p className="text-xs text-rose-600 font-semibold">{error}</p>
              )}

              <button
                onClick={handleStep1Next}
                disabled={saving}
                className="w-full py-3 bg-[#00A86B] hover:bg-[#00935D] text-white rounded-xl text-sm font-black shadow-md shadow-[#00A86B]/25 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? "Menyimpan..." : (
                  <>
                    <span>Selanjutnya</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* ======================================================= */}
          {/* STEP 2: Tanggal Mulai Siklus                            */}
          {/* ======================================================= */}
          {step === 2 && (
            <div className="p-6 space-y-6 animate-fade-in">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#00A86B]/15 text-[#00A86B] flex items-center justify-center shrink-0">
                  <CalendarDays className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-[#09261E] dark:text-white font-display tracking-tight">
                    Kamu gajian / dapet duit tanggal berapa?
                  </h2>
                  <p className="text-xs text-[#1C5F4D] dark:text-[#88C8AC] mt-0.5 leading-relaxed">
                    SALDO akan menghitung income dan pengeluaran dari tanggal ini sampai tanggal yang sama bulan berikutnya, bukan dari tanggal 1.
                  </p>
                </div>
              </div>

              {/* Number picker for day 1-31 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-[#F4FAF6] dark:bg-[#071913] rounded-xl p-4 border border-[#D1EADE]/60 dark:border-[#14382C]">
                  <button
                    type="button"
                    onClick={() => setCycleStartDay((d) => Math.max(1, d - 1))}
                    className="w-9 h-9 rounded-lg bg-[#E8F5EE] dark:bg-[#14382C] text-[#09261E] dark:text-white flex items-center justify-center cursor-pointer hover:bg-[#D1EADE] dark:hover:bg-[#1C5F4D] transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="text-center">
                    <p className="text-4xl font-black font-display text-[#00A86B] tabular-nums leading-none">
                      {cycleStartDay}
                    </p>
                    <p className="text-xs text-[#1C5F4D] dark:text-[#88C8AC] mt-1 font-medium">
                      setiap bulan
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCycleStartDay((d) => Math.min(31, d + 1))}
                    className="w-9 h-9 rounded-lg bg-[#E8F5EE] dark:bg-[#14382C] text-[#09261E] dark:text-white flex items-center justify-center cursor-pointer hover:bg-[#D1EADE] dark:hover:bg-[#1C5F4D] transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick select shortcuts */}
                <div className="flex flex-wrap gap-2">
                  {[1, 5, 10, 15, 20, 25, 26, 27, 28].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setCycleStartDay(d)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        cycleStartDay === d
                          ? "bg-[#00A86B] text-white shadow-sm"
                          : "bg-[#E8F5EE] dark:bg-[#14382C] text-[#1C5F4D] dark:text-[#88C8AC] hover:bg-[#D1EADE] dark:hover:bg-[#1C5F4D]"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>

                {/* Preview label */}
                <div className="bg-[#F4FAF6] dark:bg-[#071913] rounded-xl p-3 border border-[#D1EADE]/60 dark:border-[#14382C]">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#1C5F4D] dark:text-[#88C8AC] mb-1">
                    Preview Periode Aktif
                  </p>
                  <p className="text-xs font-bold text-[#09261E] dark:text-white">
                    {(() => {
                      const d = cycleStartDay;
                      const now = new Date();
                      const refDay = now.getDate();
                      let startMonth = now.getMonth();
                      let startYear = now.getFullYear();
                      if (refDay < d) {
                        startMonth -= 1;
                        if (startMonth < 0) { startMonth = 11; startYear -= 1; }
                      }
                      const lastDayOfStart = new Date(startYear, startMonth + 1, 0).getDate();
                      const startDay = Math.min(d, lastDayOfStart);
                      const periodStart = new Date(startYear, startMonth, startDay);

                      let endMonth = startMonth + 1;
                      let endYear = startYear;
                      if (endMonth > 11) { endMonth = 0; endYear += 1; }
                      const lastDayOfEnd = new Date(endYear, endMonth + 1, 0).getDate();
                      const endDay = Math.min(d, lastDayOfEnd) - 1;
                      const periodEnd = endDay < 1
                        ? new Date(endYear, endMonth, 0)
                        : new Date(endYear, endMonth, endDay);

                      const fmt = (date) => date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
                      return `${fmt(periodStart)} - ${fmt(periodEnd)}`;
                    })()}
                  </p>
                </div>

                {cycleStartDay >= 29 && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                    Catatan: Untuk bulan yang tidak punya tanggal {cycleStartDay} (misal Februari), sistem otomatis menyesuaikan ke hari terakhir bulan tersebut.
                  </p>
                )}
              </div>

              {error && (
                <p className="text-xs text-rose-600 font-semibold">{error}</p>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-none px-4 py-3 border border-[#D1EADE] dark:border-[#14382C] text-[#1C5F4D] dark:text-[#88C8AC] rounded-xl text-xs font-bold cursor-pointer hover:bg-[#E8F5EE] dark:hover:bg-[#14382C] transition-colors"
                >
                  Kembali
                </button>
                <button
                  onClick={handleFinish}
                  disabled={saving}
                  className="flex-1 py-3 bg-[#00A86B] hover:bg-[#00935D] text-white rounded-xl text-sm font-black shadow-md shadow-[#00A86B]/25 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? "Menyimpan..." : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Selesai & Masuk Dashboard</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Skip link */}
        <button
          type="button"
          onClick={() => navigate("/app")}
          className="w-full text-center text-xs text-[#1C5F4D] dark:text-[#88C8AC] mt-4 cursor-pointer hover:text-[#00A86B] transition-colors"
        >
          Lewati untuk sekarang, atur nanti di Pengaturan
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
