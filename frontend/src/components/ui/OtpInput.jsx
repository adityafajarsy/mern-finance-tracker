import { useState, useRef, useEffect } from "react";
import { RefreshCw } from "lucide-react";

const OtpInput = ({
  length = 6,
  value = "",
  onChange,
  onResend,
  resendLoading = false,
  resendCooldown = 60,
  disabled = false,
}) => {
  const [digits, setDigits] = useState(Array(length).fill(""));
  const inputRefs = useRef([]);
  const [timer, setTimer] = useState(resendCooldown);
  const [canResend, setCanResend] = useState(false);

  // Sync internal digits with external value
  useEffect(() => {
    const chars = value.slice(0, length).split("");
    const filled = Array(length).fill("").map((_, i) => chars[i] || "");
    setDigits(filled);
  }, [value, length]);

  // Countdown timer effect
  useEffect(() => {
    if (timer > 0) {
      setCanResend(false);
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleInputChange = (index, e) => {
    const val = e.target.value;
    // Allow only numeric digit
    const lastChar = val.replace(/\D/g, "").slice(-1);

    const newDigits = [...digits];
    newDigits[index] = lastChar;
    setDigits(newDigits);

    const combined = newDigits.join("");
    if (onChange) onChange(combined);

    // If character entered, auto-focus next box
    if (lastChar && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        // Current box is empty, jump to previous box and clear it
        inputRefs.current[index - 1]?.focus();
        const newDigits = [...digits];
        newDigits[index - 1] = "";
        setDigits(newDigits);
        if (onChange) onChange(newDigits.join(""));
      } else {
        const newDigits = [...digits];
        newDigits[index] = "";
        setDigits(newDigits);
        if (onChange) onChange(newDigits.join(""));
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pastedData) return;

    const newDigits = Array(length).fill("").map((_, i) => pastedData[i] || "");
    setDigits(newDigits);

    const combined = newDigits.join("");
    if (onChange) onChange(combined);

    // Focus on the next empty box or the last box
    const nextEmptyIndex = newDigits.findIndex((d) => d === "");
    const focusTarget = nextEmptyIndex === -1 ? length - 1 : nextEmptyIndex;
    inputRefs.current[focusTarget]?.focus();
  };

  const handleResendClick = () => {
    if (!canResend || resendLoading) return;
    if (onResend) {
      onResend();
      setTimer(resendCooldown);
      setCanResend(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 6 Digit Input Boxes */}
      <div className="flex items-center justify-between gap-2 sm:gap-3 select-none">
        {Array(length)
          .fill(0)
          .map((_, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digits[index]}
              onChange={(e) => handleInputChange(index, e)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              disabled={disabled}
              className={`w-11 h-13 sm:w-13 sm:h-15 text-center text-xl sm:text-2xl font-black font-mono rounded-2xl border transition-all ${
                digits[index]
                  ? "border-[#00A86B] bg-[#00A86B]/10 dark:bg-[#00A86B]/20 text-[#09261E] dark:text-[#00E592] shadow-sm shadow-[#00A86B]/20"
                  : "border-[#D1EADE]/80 dark:border-[#14382C] bg-[#F8FAF9] dark:bg-[#09261E]/50 text-[#09261E] dark:text-white"
              } focus:border-[#00A86B] focus:ring-2 focus:ring-[#00A86B]/30 focus:outline-none disabled:opacity-50`}
            />
          ))}
      </div>

      {/* Resend OTP Row with live countdown timer */}
      <div className="flex items-center justify-between text-xs text-[#1C5F4D] dark:text-[#88C8AC] pt-1">
        <span>Tidak menerima kode?</span>
        {canResend ? (
          <button
            type="button"
            onClick={handleResendClick}
            disabled={resendLoading}
            className="font-bold text-[#00A86B] hover:text-[#00935D] dark:text-[#00E592] flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resendLoading ? "animate-spin" : ""}`} />
            <span>{resendLoading ? "Mengirim..." : "Kirim Ulang Kode"}</span>
          </button>
        ) : (
          <span className="font-semibold text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
            <span>Kirim ulang dalam</span>
            <span className="font-mono font-bold text-[#00A86B]">{timer}s</span>
          </span>
        )}
      </div>
    </div>
  );
};

export default OtpInput;
