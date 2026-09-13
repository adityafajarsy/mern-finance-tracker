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
    <div className={className}>
      <div
        className={`transition-all duration-1000 ease-out transform ${
          isVisible
            ? "opacity-100 translate-y-0 md:translate-x-0 scale-100"
            : "opacity-0 translate-y-6 md:translate-y-0 md:translate-x-12 scale-95"
        }`}
      >
        <div className="w-[90vw] max-w-[280px] sm:max-w-[300px] md:w-76 lg:w-80 bg-white/95 dark:bg-[#071913]/95 backdrop-blur-xl border border-[#D1EADE] dark:border-[#14382C] rounded-2xl shadow-[0_18px_40px_rgba(8,36,27,0.18)] p-2.5 sm:p-3 select-none mx-auto">
          
          {/* Input Bar Simulation */}
          <div className="relative flex items-center bg-[#F4FAF6] dark:bg-[#0A221A] border border-[#D1EADE]/80 dark:border-[#1A4737] rounded-xl px-2.5 py-2 sm:py-2.5 transition-all shadow-inner">
            <Mic className="w-3 h-3 text-[#00A86B] shrink-0 mr-1.5" />
            
            <div className="flex-1 text-[11px] text-[#09261E] dark:text-white font-medium truncate flex items-center min-h-[1.15rem]">
              <span>{displayedText}</span>
              {!showResult && (
                <span className="w-0.5 h-3 bg-[#00A86B] ml-0.5 animate-pulse inline-block" />
              )}
            </div>

            {/* Enter / Send Button */}
            <div
              className={`w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200 shrink-0 ml-1.5 ${
                hasEntered || displayedText.length > 0
                  ? "bg-[#00A86B] text-white shadow-sm shadow-[#00A86B]/40"
                  : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400"
              } ${isBtnPressed ? "scale-75 bg-[#00935D]" : "scale-100"}`}
            >
              <ArrowRight className="w-3 h-3 stroke-[2.5]" />
            </div>
          </div>

          {/* Instant Result View (Expands on Enter) */}
          <div
            className={`overflow-hidden transition-all duration-500 ease-out ${
              showResult ? "max-h-36 opacity-100 mt-2.5 pt-2.5 border-t border-[#E8F5EE] dark:border-[#14382C]/70" : "max-h-0 opacity-0 mt-0 pt-0"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-[#00A86B]/10 dark:bg-[#00A86B]/20 flex items-center justify-center text-[#00A86B] shrink-0">
                  <Coffee className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-[#09261E] dark:text-white leading-tight truncate">
                    Es Teh
                  </p>
                  <span className="inline-block px-1.5 py-0.5 rounded bg-[#00A86B]/10 text-[8px] font-bold text-[#00A86B] mt-0.5">
                    Makanan & Minuman
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[11px] font-black font-mono text-rose-600 dark:text-rose-400 block whitespace-nowrap">
                  -Rp 10.000
                </span>
                <span className="text-[8px] text-[#1C5F4D] dark:text-[#88C8AC] font-medium block whitespace-nowrap">
                  Hari ini
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 mt-2 pt-1.5 border-t border-dashed border-[#D1EADE]/70 dark:border-[#1A4737] text-[8.5px] font-bold text-[#00A86B]">
              <CheckCircle2 className="w-3 h-3 text-[#00A86B] shrink-0" />
              <span className="truncate">Tersimpan otomatis tanpa perlu form!</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HeroDemoCard;
