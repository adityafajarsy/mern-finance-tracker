import { useState, useEffect } from "react";
import { ArrowRight, CheckCircle2, Mic, Coffee } from "lucide-react";

export const HeroDemoCard = ({ className = "" }) => {
  const fullText = "gua abis beli es teh 10ribu";
  const [displayedText, setDisplayedText] = useState("");
  const [hasEntered, setHasEntered] = useState(false);
  const [isBtnPressed, setIsBtnPressed] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let timeoutId;
    let charIndex = 0;
    let isCancelled = false;

    // Initial entrance delay
    timeoutId = setTimeout(() => {
      if (isCancelled) return;
      setIsVisible(true);
      startTypingCycle();
    }, 400);

    const startTypingCycle = () => {
      setDisplayedText("");
      setHasEntered(false);
      setIsBtnPressed(false);
      setShowResult(false);
      charIndex = 0;

      // Small pause after slide in before typing begins
      timeoutId = setTimeout(() => {
        if (isCancelled) return;
        typeNextChar();
      }, 700);
    };

    const typeNextChar = () => {
      if (isCancelled) return;
      if (charIndex < fullText.length) {
        setDisplayedText(fullText.slice(0, charIndex + 1));
        charIndex++;
        // Natural typing speed variation (40ms - 80ms)
        const delay = 45 + Math.random() * 35;
        timeoutId = setTimeout(typeNextChar, delay);
      } else {
        // Finished typing, pause before clicking enter
        timeoutId = setTimeout(() => {
          if (isCancelled) return;
          setHasEntered(true);
          // Simulate button press
          timeoutId = setTimeout(() => {
            if (isCancelled) return;
            setIsBtnPressed(true);
            // Show result after press
            timeoutId = setTimeout(() => {
              if (isCancelled) return;
              setIsBtnPressed(false);
              setShowResult(true);
              // Wait 3.8s before restarting cycle
              timeoutId = setTimeout(() => {
                if (isCancelled) return;
                startTypingCycle();
              }, 3800);
            }, 300);
          }, 450);
        }, 500);
      }
    };

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div
      className={`transition-all duration-1000 ease-out transform ${
        isVisible
          ? "translate-x-0 translate-y-0 opacity-100 scale-100"
          : "translate-y-6 md:translate-y-0 md:translate-x-28 opacity-0 scale-95"
      } ${className}`}
    >
      <div className="w-[90%] sm:w-80 lg:w-84 max-w-[290px] sm:max-w-none bg-white/95 dark:bg-[#071913]/95 backdrop-blur-xl border border-[#D1EADE] dark:border-[#14382C] rounded-2xl shadow-[0_18px_40px_rgba(8,36,27,0.18)] p-2.5 sm:p-3.5 select-none mx-auto">
        
        {/* Input Bar Simulation */}
        <div className="relative flex items-center bg-[#F4FAF6] dark:bg-[#0A221A] border border-[#D1EADE]/80 dark:border-[#1A4737] rounded-xl px-2.5 sm:px-3.5 py-2 sm:py-3 transition-all shadow-inner">
          <Mic className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#00A86B] shrink-0 mr-1.5 sm:mr-2" />
          
          <div className="flex-1 text-[11px] sm:text-xs text-[#09261E] dark:text-white font-medium truncate flex items-center min-h-[1.15rem] sm:min-h-[1.25rem]">
            <span>{displayedText}</span>
            {!showResult && (
              <span className="w-0.5 h-3 sm:h-3.5 bg-[#00A86B] ml-0.5 animate-pulse inline-block" />
            )}
          </div>

          {/* Enter / Send Button */}
          <div
            className={`w-5.5 h-5.5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center transition-all duration-200 shrink-0 ml-1.5 ${
              hasEntered || displayedText.length > 0
                ? "bg-[#00A86B] text-white shadow-sm shadow-[#00A86B]/40"
                : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400"
            } ${isBtnPressed ? "scale-75 bg-[#00935D]" : "scale-100"}`}
          >
            <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5]" />
          </div>
        </div>

        {/* Instant Result View (Expands on Enter) */}
        <div
          className={`overflow-hidden transition-all duration-500 ease-out ${
            showResult ? "max-h-36 opacity-100 mt-2.5 pt-2.5 sm:mt-3 sm:pt-3 border-t border-[#E8F5EE] dark:border-[#14382C]/70" : "max-h-0 opacity-0 mt-0 pt-0"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-[#00A86B]/10 dark:bg-[#00A86B]/20 flex items-center justify-center text-[#00A86B] shrink-0">
                <Coffee className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] sm:text-xs font-bold text-[#09261E] dark:text-white leading-tight truncate">
                  Es Teh
                </p>
                <span className="inline-block px-1.5 py-0.5 rounded-md bg-[#00A86B]/10 text-[8.5px] sm:text-[9px] font-bold text-[#00A86B] mt-0.5">
                  Makanan & Minuman
                </span>
              </div>
            </div>

            <div className="text-right shrink-0 ml-2">
              <span className="text-[11px] sm:text-xs font-black font-mono text-rose-600 dark:text-rose-400 block">
                -Rp 10.000
              </span>
              <span className="text-[8.5px] sm:text-[9px] text-[#1C5F4D] dark:text-[#88C8AC] font-medium">
                Hari ini
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 mt-2 pt-1.5 sm:mt-2.5 sm:pt-2 border-t border-dashed border-[#D1EADE]/70 dark:border-[#1A4737] text-[9px] sm:text-[10px] font-bold text-[#00A86B]">
            <CheckCircle2 className="w-3 h-3 text-[#00A86B] shrink-0" />
            <span>Tersimpan otomatis tanpa perlu form!</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HeroDemoCard;
