import { useState, useEffect, useRef } from "react";
import { 
  X, 
  Sparkles, 
  ArrowRight, 
  Check, 
  Tag, 
  Landmark, 
  ArrowLeftRight, 
  HelpCircle, 
  SlidersHorizontal,
  Calendar
} from "lucide-react";

const CaptureModal = ({
  isOpen,
  onClose,
  accounts = [],
  categories = [],
  defaultAccountId = null,
  initialText = "",
  onSaveTransaction,
  authFetch,
}) => {
  const [inputText, setInputText] = useState("");
  const [isInterpreting, setIsInterpreting] = useState(false);
  const [interpretationError, setInterpretationError] = useState("");
  const [draftResult, setDraftResult] = useState(null);
  const [isManualMode, setIsManualMode] = useState(false);

  // Editable Draft & Manual States
  const [txType, setTxType] = useState("Expense");
  const [txAmount, setTxAmount] = useState("");
  const [txDescription, setTxDescription] = useState("");
  const [txManualDate, setTxManualDate] = useState("");
  const [txResolvedDate, setTxResolvedDate] = useState("");
  const [txAccountId, setTxAccountId] = useState("");
  const [txDestAccountId, setTxDestAccountId] = useState("");
  const [txCategoryId, setTxCategoryId] = useState("");
  const [txItems, setTxItems] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const inputRef = useRef(null);

  const interpretText = async (textToInterpret) => {
    if (!textToInterpret || !textToInterpret.trim()) return;
    setIsInterpreting(true);
    setInterpretationError("");
    setDraftResult(null);

    try {
      const res = await authFetch("/api/capture/interpret", {
        method: "POST",
        body: JSON.stringify({ text: textToInterpret.trim() }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "SALDO couldn't understand that transaction.");
      }

      const data = await res.json();
      setDraftResult(data);

      const d = data.draft;
      setTxType(d.type || "Expense");
      setTxAmount(d.amount !== null && d.amount !== undefined ? d.amount.toLocaleString("id-ID") : "");
      setTxDescription(d.description || "");
      setTxResolvedDate(d.date || new Date().toISOString().split("T")[0]);
      setTxAccountId(d.account?._id || accounts[0]?._id || "");
      setTxDestAccountId(d.destinationAccount?._id || accounts.find(a => a._id !== (d.account?._id || accounts[0]?._id))?._id || "");
      setTxCategoryId(d.category?._id || categories.find(c => c.type === (d.type || "Expense"))?._id || "");
      setTxItems(d.items || []);
    } catch (err) {
      console.error("Interpret error:", err);
      setInterpretationError(err.message || "SALDO couldn't understand that transaction. Try something like 'makan 25 ribu'.");
    } finally {
      setIsInterpreting(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const textToUse = initialText || "";
      const todayStr = new Date().toISOString().split("T")[0];
      setInputText(textToUse);
      setIsInterpreting(false);
      setInterpretationError("");
      setDraftResult(null);
      setIsManualMode(false);
      setSaveError("");
      
      const defaultAcc = defaultAccountId || accounts[0]?._id || "";
      const defaultCat = categories.find(c => c.type === "Expense")?._id || categories[0]?._id || "";
      setTxType("Expense");
      setTxAmount("");
      setTxDescription("");
      setTxManualDate(todayStr);
      setTxResolvedDate(todayStr);
      setTxAccountId(defaultAcc);
      setTxDestAccountId(accounts.find(a => a._id !== defaultAcc)?._id || "");
      setTxCategoryId(defaultCat);
      setTxItems([]);

      if (textToUse.trim()) {
        interpretText(textToUse);
      } else {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 80);
      }
    }
  }, [isOpen, initialText, defaultAccountId, accounts, categories]);

  if (!isOpen) return null;

  const formatCurrency = (val) => {
    if (!val && val !== 0) return "Rp 0";
    return `Rp ${Number(val).toLocaleString("id-ID")}`;
  };

  const handleAmountRawChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (raw === "") {
      setTxAmount("");
      return;
    }
    setTxAmount(Number(raw).toLocaleString("id-ID"));
  };

  // 1. Submit text to AI Capture Brain
  const handleInterpret = async (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    setIsInterpreting(true);
    setInterpretationError("");
    setDraftResult(null);

    try {
      const res = await authFetch("/api/capture/interpret", {
        method: "POST",
        body: JSON.stringify({ text: inputText.trim() }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "SALDO couldn't understand that transaction.");
      }

      const data = await res.json();
      setDraftResult(data);

      if (data.draft) {
        const d = data.draft;
        setTxType(d.type || "Expense");
        setTxAmount(d.amount !== null && d.amount !== undefined ? d.amount.toLocaleString("id-ID") : "");
        setTxDescription(d.description || "");
        setTxResolvedDate(d.date || new Date().toISOString().split("T")[0]);
        setTxAccountId(d.account?._id || accounts[0]?._id || "");
        setTxDestAccountId(d.destinationAccount?._id || accounts.find(a => a._id !== (d.account?._id || accounts[0]?._id))?._id || "");
        setTxCategoryId(d.category?._id || categories.find(c => c.type === (d.type || "Expense"))?._id || "");
        setTxItems(d.items || []);
      }
    } catch (err) {
      console.error("Interpret error:", err);
      setInterpretationError(err.message || "SALDO couldn't understand that transaction. Try something like 'makan 25 ribu'.");
    } finally {
      setIsInterpreting(false);
    }
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "";
    const cleanDate = dateStr.split("T")[0];
    const [y, m, d] = cleanDate.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }).toUpperCase();
  };

  const isBackdated = (dateStr) => {
    if (!dateStr) return false;
    const cleanDate = dateStr.split("T")[0];
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    return cleanDate < todayStr;
  };

  // 2. Confirm and Save Transaction
  const handleConfirmSave = async (e) => {
    e?.preventDefault();
    setSaveError("");

    const cleanAmount = parseFloat(String(txAmount).replace(/\./g, ""));
    if (isNaN(cleanAmount) || cleanAmount <= 0) {
      setSaveError("Please enter a valid amount greater than 0");
      return;
    }

    if (!txAccountId) {
      setSaveError("Please select an account");
      return;
    }

    if (txType === "Transfer" && !txDestAccountId) {
      setSaveError("Please select a destination account for transfer");
      return;
    }

    if (txType !== "Transfer" && !txCategoryId) {
      setSaveError("Please select a category");
      return;
    }

    // Preserve the exact resolved historical transaction date (Midday UTC ensures exact date across all world timezones):
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const rawDateStr = isManualMode
      ? (txManualDate || todayStr)
      : (txResolvedDate || draftResult?.draft?.date || todayStr);
    const resolvedDateStr = rawDateStr.split("T")[0];
    const transactionDateIso = `${resolvedDateStr}T12:00:00.000Z`;

    const payload = {
      type: txType,
      amount: cleanAmount,
      description: txDescription.trim() || (txType === "Transfer" ? "Transfer Dana" : "Transaksi"),
      date: transactionDateIso,
      account: txAccountId,
      destinationAccount: txType === "Transfer" ? txDestAccountId : undefined,
      category: txType === "Transfer" ? undefined : txCategoryId,
      items: txItems.map(item => ({
        description: item.description,
        amount: item.amount,
        category: item.category?._id || item.category,
      })),
    };

    setIsSaving(true);
    try {
      await onSaveTransaction(payload);
      onClose();
    } catch (err) {
      setSaveError(err.message || "Failed to save transaction. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const samplePrompts = [
    "makan siang 35k pake BCA",
    "gaji masuk 8 juta",
    "beli bensin 50rb",
    "transfer 200rb dari BCA ke GoPay",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in font-sans">
      <div className="w-full max-w-md bg-white dark:bg-[#0D261E] border border-[#D1E8DD] dark:border-[#14382C] rounded-3xl shadow-2xl overflow-hidden animate-scale-up flex flex-col max-h-[92vh]">
        
        {/* Compact Header */}
        <div className="px-5 py-3.5 border-b border-[#D1E8DD] dark:border-[#14382C] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#00A86B]/15 text-[#00A86B] flex items-center justify-center font-bold">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#08241B] dark:text-white tracking-tight font-display">
                {isManualMode ? "Manual Entry" : "Capture Transaction"}
              </h3>
              <p className="text-[10px] text-[#1C5F4D] dark:text-[#88C8AC]">
                {isManualMode ? "Fill in details manually" : "Tell SALDO what happened in plain text"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsManualMode(!isManualMode)}
              className="px-2 py-1 text-[10px] font-bold rounded-lg border border-[#D1E8DD] dark:border-[#14382C] hover:bg-[#E8F5EE] dark:hover:bg-[#08241B] text-[#1C5F4D] dark:text-[#88C8AC] transition-all flex items-center gap-1 cursor-pointer"
            >
              <SlidersHorizontal className="w-2.5 h-2.5" />
              {isManualMode ? "AI Mode" : "Manual"}
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5">

          {/* AI One-Textbox Mode */}
          {!isManualMode && (
            <div className="space-y-2.5">
              <form onSubmit={handleInterpret} className="relative">
                <div className="relative flex flex-col bg-[#F4FAF6] dark:bg-[#08241B]/70 border border-[#D1E8DD] dark:border-[#14382C] rounded-2xl p-2.5 focus-within:ring-2 focus-within:ring-[#00A86B] focus-within:border-transparent transition-all">
                  <textarea
                    ref={inputRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleInterpret();
                      }
                    }}
                    rows={2}
                    placeholder="e.g. 'gua abis beli cilok 5k' or 'gaji masuk 8jt' or 'transfer 100k BCA ke GoPay'..."
                    className="w-full bg-transparent text-xs text-[#08241B] dark:text-white placeholder:text-zinc-400 focus:outline-none font-medium resize-none"
                  />

                  <div className="flex items-center justify-between pt-1 border-t border-[#D1E8DD]/60 dark:border-[#14382C] mt-1">
                    <span className="text-[9px] text-[#1C5F4D] dark:text-[#88C8AC] font-medium">
                      Press <kbd className="px-1 py-0.2 bg-white dark:bg-[#0D261E] rounded border border-[#D1E8DD] dark:border-[#14382C] text-[8px] font-mono">Enter</kbd> to interpret
                    </span>

                    <button
                      type="submit"
                      disabled={isInterpreting || !inputText.trim()}
                      className="px-3 py-1.5 bg-[#00A86B] hover:bg-[#00935D] disabled:opacity-50 text-white rounded-xl text-[11px] font-bold shadow-md shadow-[#00A86B]/20 transition-all flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {isInterpreting ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Interpreting...</span>
                        </>
                      ) : (
                        <>
                          <span>Interpret</span>
                          <ArrowRight className="w-3 h-3" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>

              {/* Sample Prompt Chips */}
              {!draftResult && !isInterpreting && (
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#1C5F4D] dark:text-[#88C8AC]">
                    Ideas:
                  </span>
                  {samplePrompts.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setInputText(p);
                        setTimeout(() => inputRef.current?.focus(), 50);
                      }}
                      className="px-2 py-0.5 bg-[#E8F5EE] dark:bg-[#08241B] hover:bg-[#D3ECE0] text-[#0E362A] dark:text-[#E2F2EB] text-[10px] font-medium rounded-md transition-all border border-[#D1E8DD] dark:border-[#14382C] cursor-pointer"
                    >
                      "{p}"
                    </button>
                  ))}
                </div>
              )}

              {/* Interpretation Error */}
              {interpretationError && (
                <div className="p-2.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-400 flex items-start gap-2">
                  <HelpCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px]">{interpretationError}</p>
                    <button
                      type="button"
                      onClick={() => setIsManualMode(true)}
                      className="mt-0.5 text-[10px] font-bold underline cursor-pointer"
                    >
                      Switch to manual entry
                    </button>
                  </div>
                </div>
              )}

              {/* Boundary Response (Non-transaction / Prompt injection) */}
              {draftResult?.isBoundaryResponse && (
                <div className="p-3.5 bg-[#F4FAF6] dark:bg-[#08241B]/60 border border-[#D1EADE] dark:border-[#14382C] rounded-2xl text-xs space-y-1.5 animate-fade-in">
                  <div className="flex items-center gap-1.5 text-[#00A86B] font-bold text-[10px] uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>SALDO Assistant</span>
                  </div>
                  <p className="text-xs text-[#09261E] dark:text-white font-medium leading-relaxed">
                    {draftResult.boundaryMessage}
                  </p>
                </div>
              )}

              {/* Clarification Alert */}
              {draftResult?.needsClarification && (
                <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-xl text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-start gap-2">
                  <HelpCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                  <div>
                    <p className="text-[11px] font-bold">{draftResult.clarificationQuestion || "Please enter amount below"}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* DRAFT PREVIEW OR MANUAL FORM */}
          {(draftResult?.draft || isManualMode) && (
            <div className="space-y-3 pt-2 border-t border-[#D1E8DD] dark:border-[#14382C] animate-fade-in">
              
              {/* Header with Type Selector */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#00A86B] flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  {isManualMode ? "Manual Details" : "SALDO Understood"}
                </span>
                
                {/* Compact Intent Selector */}
                <div className="flex gap-1 bg-[#E8F5EE] dark:bg-[#08241B] p-0.5 rounded-lg border border-[#D1E8DD] dark:border-[#14382C]">
                  {["Expense", "Income", "Transfer"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setTxType(type);
                        const matchedCat = categories.find(c => c.type === type);
                        setTxCategoryId(matchedCat?._id || "");
                      }}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                        txType === type
                          ? type === "Income"
                            ? "bg-emerald-600 text-white shadow-2xs"
                            : type === "Expense"
                            ? "bg-rose-600 text-white shadow-2xs"
                            : "bg-[#00A86B] text-white shadow-2xs"
                          : "text-[#1C5F4D] dark:text-[#88C8AC] hover:text-[#08241B]"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Compact Preview Card */}
              <div className="bg-[#F4FAF6] dark:bg-[#08241B]/60 border border-[#D1E8DD] dark:border-[#14382C] rounded-2xl p-3.5 space-y-2.5">
                
                {/* Date Display Row: e.g. 23 AUG 2026 [Backdated] vs 26 AUG 2026 [Today] */}
                <div className="flex items-center justify-between pb-2 border-b border-[#D1E8DD]/60 dark:border-[#14382C]">
                  <div className="flex items-center gap-1.5 text-xs font-black font-display text-[#08241B] dark:text-white uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5 text-[#00A86B]" />
                    <span>{formatDisplayDate(isManualMode ? txManualDate : (txResolvedDate || draftResult?.draft?.date))}</span>
                  </div>
                  {isBackdated(isManualMode ? txManualDate : (txResolvedDate || draftResult?.draft?.date)) ? (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60 shadow-2xs">
                      Backdated
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60 shadow-2xs">
                      Today
                    </span>
                  )}
                </div>

                {/* Top Row: Description (Left) & Amount (Right) */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      required
                      placeholder="Description (e.g. Cilok)"
                      value={txDescription}
                      onChange={(e) => setTxDescription(e.target.value)}
                      className="w-full bg-transparent text-sm font-bold text-[#08241B] dark:text-white focus:outline-none placeholder:text-zinc-400 border-b border-transparent focus:border-[#00A86B] transition-colors"
                    />
                  </div>

                  <div className="relative flex items-center shrink-0">
                    <span className="text-xs font-mono font-bold text-zinc-400 mr-1">Rp</span>
                    <input
                      type="text"
                      required
                      placeholder="0"
                      value={txAmount}
                      onChange={handleAmountRawChange}
                      className="w-28 py-0.5 px-1.5 bg-white dark:bg-[#0D261E] border border-[#D1E8DD] dark:border-[#14382C] rounded-lg text-sm font-black text-[#08241B] dark:text-white font-mono text-right focus:outline-none focus:ring-1.5 focus:ring-[#00A86B]"
                    />
                  </div>
                </div>

                {/* Bottom Row: Account & Category Selectors */}
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#D1E8DD]/60 dark:border-[#14382C]">
                  {/* Account Selector Chip */}
                  <div className="flex items-center gap-1 bg-white dark:bg-[#0D261E] border border-[#D1E8DD] dark:border-[#14382C] rounded-xl px-2 py-1 text-xs">
                    <Landmark className="w-3 h-3 text-[#00A86B] shrink-0" />
                    <select
                      value={txAccountId}
                      onChange={(e) => setTxAccountId(e.target.value)}
                      className="bg-transparent text-[11px] font-bold text-[#08241B] dark:text-white focus:outline-none cursor-pointer max-w-[120px] truncate"
                    >
                      {accounts.map((acc) => (
                        <option key={acc._id} value={acc._id}>
                          {acc.name} ({formatCurrency(acc.balance)})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Destination Account (For Transfer) or Category (For Income/Expense) */}
                  {txType === "Transfer" ? (
                    <div className="flex items-center gap-1 bg-white dark:bg-[#0D261E] border border-[#D1E8DD] dark:border-[#14382C] rounded-xl px-2 py-1 text-xs">
                      <ArrowLeftRight className="w-3 h-3 text-[#00A86B] shrink-0" />
                      <select
                        value={txDestAccountId}
                        onChange={(e) => setTxDestAccountId(e.target.value)}
                        className="bg-transparent text-[11px] font-bold text-[#08241B] dark:text-white focus:outline-none cursor-pointer max-w-[120px] truncate"
                      >
                        <option value="" disabled>Destination</option>
                        {accounts.filter(a => a._id !== txAccountId).map((acc) => (
                          <option key={acc._id} value={acc._id}>
                            {acc.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 bg-white dark:bg-[#0D261E] border border-[#D1E8DD] dark:border-[#14382C] rounded-xl px-2 py-1 text-xs">
                      <Tag className="w-3 h-3 text-[#00A86B] shrink-0" />
                      <select
                        value={txCategoryId}
                        onChange={(e) => setTxCategoryId(e.target.value)}
                        className="bg-transparent text-[11px] font-bold text-[#08241B] dark:text-white focus:outline-none cursor-pointer max-w-[120px] truncate"
                      >
                        {categories.filter(c => c.type === txType).map((cat) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Manual Mode Date Input */}
                  {isManualMode && (
                    <div className="flex items-center gap-1 bg-white dark:bg-[#0D261E] border border-[#D1E8DD] dark:border-[#14382C] rounded-xl px-2 py-1 text-xs">
                      <Calendar className="w-3 h-3 text-[#00A86B] shrink-0" />
                      <input
                        type="date"
                        value={txManualDate}
                        onChange={(e) => setTxManualDate(e.target.value)}
                        className="bg-transparent text-[11px] font-bold text-[#08241B] dark:text-white focus:outline-none cursor-pointer"
                      />
                    </div>
                  )}
                </div>

                {/* Multi-Item Sub-items Breakdown (if present) */}
                {txItems.length > 0 && (
                  <div className="pt-1.5 border-t border-[#D1E8DD]/60 dark:border-[#14382C] space-y-1">
                    <p className="text-[9px] font-extrabold uppercase tracking-wider text-[#1C5F4D] dark:text-[#88C8AC]">
                      Breakdown ({txItems.length} items)
                    </p>
                    <div className="space-y-1">
                      {txItems.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[11px] px-2 py-1 bg-white dark:bg-[#0D261E] rounded-lg border border-[#D1E8DD] dark:border-[#14382C]">
                          <span className="font-semibold text-[#08241B] dark:text-white">{item.description}</span>
                          <span className="font-mono font-bold text-[#08241B] dark:text-white">{formatCurrency(item.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Save Error */}
              {saveError && (
                <div className="p-2 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-400">
                  {saveError}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 border border-[#D1E8DD] dark:border-[#14382C] text-[#1C5F4D] dark:text-[#88C8AC] hover:bg-[#E8F5EE] dark:hover:bg-[#08241B] rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSave}
                  disabled={isSaving}
                  className="flex-2 py-2.5 bg-[#00A86B] hover:bg-[#00935D] text-white rounded-2xl text-xs font-black shadow-md shadow-[#00A86B]/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-98"
                >
                  {isSaving ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirm & Save</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CaptureModal;
