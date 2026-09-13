import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  Sparkles, 
  Check, 
  Plus, 
  Minus, 
  ArrowUpRight,
  CheckCircle2,
  Menu,
  X
} from "lucide-react";
import OrganicFlowLine from "../components/ui/OrganicFlowLine";
import HeroProductVisual from "../components/HeroProductVisual";
import hpHeroImage from "../assets/hp_hero.webp";
import hpDarkVersion from "../assets/hp-dark-version.webp";

const LandingPage = () => {
  const [openAccordion, setOpenAccordion] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Section 02 - Interactive Live Capture Demo state
  const [demoText, setDemoText] = useState("tadi beli kopi 25 ribu pake gopay");
  const [demoDraft, setDemoDraft] = useState({
    title: "Coffee",
    amount: "-Rp 25.000",
    account: "GoPay",
    category: "Food & Drinks",
    time: "Today · 14:21:03",
  });
  const [isTyping, setIsTyping] = useState(false);

  const handleSelectIdea = (text, title, amount, account, category, time) => {
    setIsTyping(true);
    setDemoText(text);
    setTimeout(() => {
      setDemoDraft({ title, amount, account, category, time });
      setIsTyping(false);
    }, 280);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const manifestoItems = [
    {
      num: "01",
      title: "Less input, zero cognitive friction",
      description: "Stop navigating complex multi-step accounting forms. Just write one plain sentence in Indonesian or English, and SALDO handles the rest.",
    },
    {
      num: "02",
      title: "Smarter, broad categorization",
      description: "SALDO automatically maps your specific items into meaningful financial categories like Food & Drinks, Transportation, and Discretionary Living.",
    },
    {
      num: "03",
      title: "Clearer spending context",
      description: "See where your money actually goes through unified cashflow intelligence rather than fragmented raw transaction lists.",
    },
    {
      num: "04",
      title: "Deterministic, trustworthy forecasting",
      description: "Know where your bank balance will stand before your next payday using real historical daily burn rates, not fabricated AI numbers.",
    },
    {
      num: "05",
      title: "Calm by design",
      description: "An intentional, editorial interface that provides clarity without overwhelming dashboard walls, badge clutter, or aggressive animations.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#E8F5EE] text-[#09261E] selection:bg-[#00A86B] selection:text-white transition-colors duration-300 relative overflow-x-hidden font-urbanist">
      
      {/* ========================================================================= */}
      {/* STICKY GLASSMORPHISM NAVBAR                                               */}
      {/* ========================================================================= */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center transition-all duration-500 pointer-events-none px-3 sm:px-6">
        <div
          className={`w-full transition-all duration-500 ease-out flex items-center justify-between pointer-events-auto ${
            scrolled
              ? "max-w-5xl 2xl:max-w-[1400px] mt-3 sm:mt-4 px-5 2xl:px-8 py-2.5 sm:py-3 2xl:py-4 bg-white/80 dark:bg-[#09261E]/80 backdrop-blur-xl border border-[#D1EADE]/90 dark:border-[#14382C] rounded-full shadow-lg shadow-[#09261E]/5"
              : "max-w-6xl 2xl:max-w-[1540px] mt-2 sm:mt-4 px-4 sm:px-8 2xl:px-10 py-4 bg-transparent border-transparent shadow-none"
          }`}
        >
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-1.5 font-display font-black text-xl 2xl:text-2xl tracking-tight text-[#09261E] dark:text-white">
            <span>SALDO</span>
            <span className="w-2 h-2 2xl:w-2.5 2xl:h-2.5 rounded-full bg-[#00A86B]"></span>
          </Link>

          {/* Desktop & Tablet Nav Links */}
          <nav className="hidden md:flex items-center md:gap-3.5 lg:gap-8 2xl:gap-12 text-[11px] lg:text-xs 2xl:text-sm font-bold text-[#14493A] dark:text-[#88C8AC] whitespace-nowrap shrink-0">
            <a href="#how-it-works" className="hover:text-[#00A86B] transition-colors">How It Works</a>
            <a href="#why-saldo" className="hover:text-[#00A86B] transition-colors">Why SALDO</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 2xl:gap-4 shrink-0">
            <Link
              to="/login"
              className="px-2.5 sm:px-3.5 py-2 text-xs 2xl:text-sm font-bold text-[#09261E] dark:text-white hover:text-[#00A86B] transition-colors whitespace-nowrap"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 sm:px-5 2xl:px-7 py-2 2xl:py-2.5 rounded-full text-xs 2xl:text-sm font-black bg-[#00A86B] hover:bg-[#00935D] text-white transition-all shadow-md shadow-[#00A86B]/20 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-xl text-[#09261E] dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-center"
              aria-label="Toggle Navigation Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-[#09261E]/85 backdrop-blur-xl md:hidden flex flex-col justify-center items-center gap-6 p-6 animate-fade-in text-center">
          <button 
            onClick={() => setMobileOpen(false)}
            className="absolute top-6 right-6 p-2.5 rounded-full bg-white/20 text-white cursor-pointer hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <a href="#how-it-works" onClick={() => setMobileOpen(false)} className="text-xl font-bold font-display text-white">How It Works</a>
          <a href="#why-saldo" onClick={() => setMobileOpen(false)} className="text-xl font-bold font-display text-white">Why SALDO</a>
          <div className="flex flex-col gap-3 w-full max-w-xs mt-4">
            <Link to="/login" onClick={() => setMobileOpen(false)} className="w-full py-3.5 bg-white/10 text-white rounded-full font-bold text-sm">
              Sign In
            </Link>
            <Link to="/register" onClick={() => setMobileOpen(false)} className="w-full py-3.5 bg-[#00A86B] text-white rounded-full font-black text-sm shadow-lg shadow-[#00A86B]/30">
              Get Started Free
            </Link>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 01 — LIGHT: HERO SECTION                                                  */}
      {/* ========================================================================= */}
      <section className="pt-24 sm:pt-28 md:pt-32 2xl:pt-40 pb-12 md:pb-16 2xl:pb-24 px-4 sm:px-6 md:px-8 max-w-6xl 2xl:max-w-[1540px] mx-auto relative">
        
        {/* Continuous Animated Organic Flow Line Motif (Spans Full Browser Viewport) */}
        <div className="absolute top-[48%] -translate-y-1/2 left-1/2 -translate-x-1/2 w-screen min-w-[100vw] h-[780px] sm:h-[820px] md:h-[650px] 2xl:h-[760px] pointer-events-none -z-0 overflow-visible flex items-center justify-center">
          <OrganicFlowLine className="w-full h-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-6 lg:gap-8 items-center relative z-10">
          
          {/* LEFT: Product Message */}
          <div className="md:col-span-7 space-y-5 md:space-y-6 2xl:space-y-8 text-center md:text-left flex flex-col items-center md:items-start">
            <div className="inline-flex items-center gap-2 px-3.5 2xl:px-4 py-1.5 2xl:py-2 rounded-full bg-white/90 border border-[#D1EADE] text-[#0E362A] text-xs 2xl:text-sm font-bold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-[#00A86B]" />
              <span>An intelligent personal finance companion</span>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-5xl lg:text-7xl 2xl:text-[92px] font-black font-display tracking-tight text-[#09261E] leading-[1.04] md:leading-[1.02]">
              Your money,<br />
              <span className="text-[#00A86B]">understood.</span>
            </h1>

            <p className="text-base sm:text-lg md:text-base lg:text-lg 2xl:text-xl text-[#1C5F4D] max-w-lg 2xl:max-w-2xl font-medium leading-relaxed mx-auto md:mx-0">
              Track spending, understand your habits, and see what's ahead without filling out endless forms.
            </p>

            <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-center md:justify-start gap-3 sm:gap-3.5 2xl:gap-5 pt-2 max-w-sm sm:max-w-none mx-auto md:mx-0">
              <Link
                to="/register"
                className="w-full sm:w-auto px-7 2xl:px-9 py-3.5 2xl:py-4 bg-[#00A86B] hover:bg-[#00935D] text-white font-black text-sm 2xl:text-base rounded-full shadow-xl shadow-[#00A86B]/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4 2xl:w-5 2xl:h-5" />
              </Link>
              <a
                href="#how-it-works"
                className="w-full sm:w-auto px-6 2xl:px-8 py-3.5 2xl:py-4 bg-white hover:bg-[#F4FAF6] border border-[#D1EADE] text-[#09261E] font-bold text-sm 2xl:text-base rounded-full transition-all flex items-center justify-center shadow-2xs"
              >
                See How It Works
              </a>
            </div>

            <div className="pt-2 flex items-center justify-center md:justify-start gap-2 text-xs 2xl:text-sm font-serif italic text-[#1C5F4D]">
              <span>Your money is always moving.</span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#00A86B] stroke-current stroke-2">
                <path d="M 4 8 Q 14 6, 18 16" strokeLinecap="round" />
                <path d="M 14 16 L 18 16 L 18 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* RIGHT: Realistic Phone Mockup */}
          <div className="md:col-span-5 flex justify-center md:justify-end relative">
            <HeroProductVisual className="relative z-10" />
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 02 — LIGHT: CAPTURE PRODUCT STORY (LIVE INTERACTIVE DEMONSTRATION)        */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="py-20 md:py-28 2xl:py-36 px-4 sm:px-6 md:px-8 max-w-6xl 2xl:max-w-[1540px] mx-auto relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 lg:gap-16 items-center">
          
          {/* LEFT: Editorial Narrative & Statement */}
          <div className="md:col-span-5 space-y-6 text-left">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#00A86B]">
              01 · Smart Capture
            </span>

            <h2 className="text-4xl sm:text-5xl font-black font-display tracking-tight text-[#09261E] leading-[1.08]">
              Tell SALDO<br />
              what happened.
            </h2>

            <p className="text-sm sm:text-base text-[#1C5F4D] leading-relaxed font-medium">
              No manual date-pickers, nested category dropdowns, or tedious form spreadsheets. Just say what you spent in plain Indonesian or English.
            </p>

            {/* Interactive Prompt Ideas */}
            <div className="space-y-2 pt-2">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#1C5F4D]">
                Try an example:
              </p>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectIdea("tadi beli kopi 25 ribu pake gopay", "Coffee", "-Rp 25.000", "GoPay", "Food & Drinks", "Today · 14:21:03")}
                  className={`p-3 rounded-xl text-xs font-bold text-left transition-all border cursor-pointer ${
                    demoText.includes("kopi") 
                      ? "bg-white border-[#00A86B] text-[#09261E] shadow-sm" 
                      : "bg-white/50 border-[#D1EADE] text-[#1C5F4D] hover:bg-white"
                  }`}
                >
                  "tadi beli kopi 25 ribu pake gopay"
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectIdea("gaji masuk 8 juta ke rekening bca", "Salary", "+Rp 8.000.000", "BCA", "Salary", "Today · 09:00:12")}
                  className={`p-3 rounded-xl text-xs font-bold text-left transition-all border cursor-pointer ${
                    demoText.includes("gaji") 
                      ? "bg-white border-[#00A86B] text-[#09261E] shadow-sm" 
                      : "bg-white/50 border-[#D1EADE] text-[#1C5F4D] hover:bg-white"
                  }`}
                >
                  "gaji masuk 8 juta ke rekening bca"
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectIdea("transfer 500 ribu dari BCA ke GoPay", "BCA → GoPay", "-Rp 500.000", "BCA", "Transfer", "Today · 11:30:45")}
                  className={`p-3 rounded-xl text-xs font-bold text-left transition-all border cursor-pointer ${
                    demoText.includes("transfer") 
                      ? "bg-white border-[#00A86B] text-[#09261E] shadow-sm" 
                      : "bg-white/50 border-[#D1EADE] text-[#1C5F4D] hover:bg-white"
                  }`}
                >
                  "transfer 500 ribu dari BCA ke GoPay"
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Realistic Interpreted Transaction Preview Presentation */}
          <div className="md:col-span-7 space-y-4">
            
            {/* Input Simulation Box */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#D1EADE] shadow-xs space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1C5F4D]">
                Natural Language Input
              </span>
              <div className="text-sm sm:text-base md:text-lg font-bold font-display text-[#09261E] flex items-center justify-between gap-2">
                <span className="truncate">"{demoText}"</span>
                <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#00A86B] text-white flex items-center justify-center shrink-0">
                  <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </span>
              </div>
            </div>

            {/* Downward connecting indicator */}
            <div className="flex justify-center -my-1">
              <div className="w-0.5 h-5 bg-[#00A86B]/40" />
            </div>

            {/* Interpreted Result Visual */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#D1EADE] shadow-md space-y-3.5">
              <div className="flex justify-between items-center border-b border-[#E8F5EE] pb-2.5">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#00A86B] flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  SALDO Understood & Categorized
                </span>
                <span className="text-[10px] font-mono text-[#1C5F4D]">
                  {demoDraft.time}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 sm:gap-4">
                <div className="min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold font-display text-[#09261E]">{demoDraft.title}</h3>
                  <p className="text-[11px] sm:text-xs text-[#1C5F4D] font-medium mt-0.5">Resolved automatically to default account</p>
                </div>
                <span className="text-xl sm:text-2xl font-black font-mono text-[#09261E] tabular-nums whitespace-nowrap shrink-0">
                  {demoDraft.amount}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-[#E8F5EE]">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-[#F4FAF6] border border-[#D1EADE] rounded-lg text-[11px] font-semibold text-[#09261E] whitespace-nowrap">
                    🏦 {demoDraft.account}
                  </span>
                  <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-[#E8F5EE] border border-[#C2E2D3] rounded-lg text-[11px] font-semibold text-[#00A86B] whitespace-nowrap">
                    🏷️ {demoDraft.category}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-bold text-[#00A86B] whitespace-nowrap">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Saved with exact second</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 02 — DARK: DUAL-DEVICE SHOWCASE (SERRA-INSPIRED ADVERTISING SHOWCASE)     */}
      {/* ========================================================================= */}
      <section className="bg-gradient-to-br from-[#061F16] via-[#09261E] to-[#04140E] text-white py-24 md:py-32 2xl:py-44 px-4 sm:px-8 relative overflow-hidden">
        
        {/* Giant Swirling Spring Vector Motif across the showcase */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-75">
          <svg viewBox="0 0 1440 600" fill="none" className="w-full h-full">
            <path
              d="M -100 450 
                 C 200 600, 350 550, 480 380 
                 C 550 280, 520 180, 440 220 
                 C 360 260, 420 400, 520 480 
                 C 620 560, 750 480, 850 320 
                 C 920 200, 890 120, 820 160 
                 C 740 210, 800 350, 920 440 
                 C 1050 540, 1200 420, 1480 180"
              stroke="#00A86B"
              strokeWidth="20"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="max-w-6xl 2xl:max-w-[1540px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-8 lg:gap-12 2xl:gap-16 items-center relative z-10">
          
          {/* LEFT: Two Overlapping iPhone Devices Mockup */}
          <div className="md:col-span-6 flex items-center justify-center relative py-4">
            
            {/* Primary Phone */}
            <div className="relative w-44 sm:w-56 md:w-64 2xl:w-80 transform -rotate-6">
              <img
                src={hpHeroImage}
                alt="SALDO Analytics Device"
                className="w-full h-auto object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.5)]"
              />
            </div>

            {/* Secondary Overlapping Phone (Dark Mode Tilted) */}
            <div className="relative w-40 sm:w-52 md:w-60 2xl:w-72 -ml-12 sm:-ml-16 md:-ml-20 2xl:-ml-28 mt-8 sm:mt-12 transform rotate-12">
              <img
                src={hpDarkVersion}
                alt="SALDO Dark Mode Companion"
                className="w-full h-auto object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.5)]"
              />
            </div>

          </div>

          {/* RIGHT: Large Editorial Copy */}
          <div className="md:col-span-6 space-y-6 2xl:space-y-8 text-left">
            <span className="text-[10px] 2xl:text-xs font-extrabold uppercase tracking-widest text-[#00A86B]">
              Effortless Intelligence
            </span>

            <h2 className="text-4xl sm:text-5xl md:text-6xl 2xl:text-7xl font-black font-display tracking-tight text-white leading-tight">
              Money management without the management.
            </h2>

            <p className="text-base sm:text-lg 2xl:text-xl text-[#B7DFCD] leading-relaxed font-medium">
              SALDO quietly organizes what happens with your money, so you can spend less time bookkeeping and more time understanding it.
            </p>

            <div className="pt-2">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-7 2xl:px-9 py-3.5 2xl:py-4 bg-[#00A86B] hover:bg-[#00935D] text-white font-black text-sm 2xl:text-base rounded-full shadow-lg shadow-[#00A86B]/30 transition-all cursor-pointer"
              >
                <span>Experience SALDO</span>
                <ArrowRight className="w-4 h-4 2xl:w-5 2xl:h-5" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 08 — LIGHT: WHY SALDO (EDITORIAL PRODUCT MANIFESTO)                       */}
      {/* ========================================================================= */}
      <section id="why-saldo" className="py-24 md:py-32 2xl:py-40 px-4 sm:px-8 max-w-4xl 2xl:max-w-6xl mx-auto relative z-10">
        
        <div className="mb-12 2xl:mb-16 space-y-2 text-left">
          <span className="text-[10px] 2xl:text-xs font-extrabold uppercase tracking-widest text-[#00A86B]">
            Why SALDO
          </span>
          <h2 className="text-4xl sm:text-5xl 2xl:text-6xl font-black font-display tracking-tight text-[#09261E]">
            Designed for clarity, not complexity.
          </h2>
        </div>

        {/* Editorial Manifesto Rows with Thin Dividers (No Container Cards) */}
        <div className="divide-y divide-[#D1EADE] border-y border-[#D1EADE]">
          {manifestoItems.map((item, idx) => {
            const isOpen = openAccordion === idx;
            return (
              <div key={idx} className="py-6 2xl:py-8 transition-colors">
                <button
                  type="button"
                  onClick={() => setOpenAccordion(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left cursor-pointer group"
                >
                  <div className="flex items-baseline gap-4 sm:gap-8 2xl:gap-12">
                    <span className="text-xs 2xl:text-sm font-mono font-bold text-[#00A86B]">
                      {item.num}
                    </span>
                    <span className="text-lg sm:text-xl 2xl:text-2xl font-bold font-display text-[#09261E] group-hover:text-[#00A86B] transition-colors">
                      {item.title}
                    </span>
                  </div>

                  <span className="text-xs 2xl:text-sm font-mono text-[#00A86B] ml-4 shrink-0">
                    {isOpen ? "—" : "+"}
                  </span>
                </button>

                {isOpen && (
                  <div className="pl-10 sm:pl-16 2xl:pl-20 pr-4 pt-3 2xl:pt-4 text-xs sm:text-sm 2xl:text-base text-[#1C5F4D] leading-relaxed font-medium animate-fade-in">
                    {item.description}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 09 — DARK / GREEN: FINAL BRAND CTA                                        */}
      {/* ========================================================================= */}
      <section className="bg-gradient-to-b from-[#061F16] to-[#04140E] text-white py-28 md:py-36 2xl:py-48 px-4 sm:px-8 text-center relative overflow-hidden">
        
        {/* Organic Flow Line as Visual Bridge */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-screen min-w-[100vw] h-[350px] 2xl:h-[450px] pointer-events-none opacity-40">
          <svg viewBox="0 0 1200 300" fill="none" className="w-full h-full">
            <path d="M -100 200 C 300 280, 600 50, 900 220 C 1050 300, 1200 150, 1350 100" stroke="#00A86B" strokeWidth="12" strokeLinecap="round" />
          </svg>
        </div>

        <div className="relative z-10 max-w-3xl 2xl:max-w-5xl mx-auto space-y-6 2xl:space-y-8">
          <h2 className="text-4xl sm:text-6xl md:text-7xl 2xl:text-8xl font-black font-display tracking-tight text-white leading-tight">
            Your money is always moving.<br />
            <span className="text-[#00A86B]">SALDO helps you see where it's going.</span>
          </h2>

          <p className="text-base sm:text-lg 2xl:text-xl text-[#B7DFCD] font-medium max-w-md 2xl:max-w-xl mx-auto">
            Say what happened. SALDO handles the rest.
          </p>

          <div className="pt-4 2xl:pt-6">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-9 2xl:px-12 py-4 2xl:py-5 bg-[#00A86B] hover:bg-[#00935D] text-white font-black text-sm 2xl:text-base rounded-full shadow-2xl shadow-[#00A86B]/40 transition-all cursor-pointer active:scale-98"
            >
              <span>Get started →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10 — FOOTER (ESTATE-STYLE MULTI-COLUMN WITH BRAND WATERMARK)              */}
      {/* ========================================================================= */}
      <footer className="bg-[#030F0B] text-white pt-20 2xl:pt-28 pb-10 2xl:pb-16 px-4 sm:px-8 md:px-16 lg:px-24 2xl:px-32 w-full overflow-hidden relative">
        <div className="max-w-7xl 2xl:max-w-[1540px] mx-auto relative z-10 space-y-16">
          
          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
            
            {/* Left Brand Details (7 cols) */}
            <div className="lg:col-span-7 flex flex-col items-start gap-6">
              <Link to="/" className="flex items-center gap-1.5 font-display font-black text-2xl tracking-tight text-white select-none">
                <span>SALDO</span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#00A86B]"></span>
              </Link>

              <p className="text-zinc-400 text-sm leading-relaxed max-w-md font-medium">
                An intelligent personal finance companion designed for clarity. Say what happened in plain language, forecast where you'll land before payday, and understand what's next.
              </p>

              <div className="flex items-center gap-3 pt-2">
                <Link
                  to="/register"
                  className="px-5 py-2.5 bg-[#00A86B] hover:bg-[#00935D] text-white rounded-full text-xs font-bold transition-all shadow-md shadow-[#00A86B]/20"
                >
                  Start Tracking Free
                </Link>
                <Link
                  to="/login"
                  className="px-4 py-2.5 text-zinc-400 hover:text-white rounded-full text-xs font-bold transition-colors"
                >
                  Sign In →
                </Link>
              </div>
            </div>

            {/* Right Link Columns (Actual Existing Routes & Sections Only) */}
            <div className="lg:col-span-5 flex justify-between gap-10 flex-wrap">
              
              {/* Product Features */}
              <div className="flex flex-col gap-3.5 min-w-[120px]">
                <span className="text-xs font-extrabold uppercase tracking-wider text-white">Features</span>
                <div className="flex flex-col gap-2.5 text-xs text-zinc-400 font-medium">
                  <a href="#how-it-works" className="hover:text-[#00A86B] transition-colors">How It Works</a>
                  <a href="#why-saldo" className="hover:text-[#00A86B] transition-colors">Why SALDO</a>
                </div>
              </div>

              {/* Application Navigation */}
              <div className="flex flex-col gap-3.5 min-w-[120px]">
                <span className="text-xs font-extrabold uppercase tracking-wider text-white">Application</span>
                <div className="flex flex-col gap-2.5 text-xs text-zinc-400 font-medium">
                  <Link to="/app" className="hover:text-[#00A86B] transition-colors">Dashboard</Link>
                  <Link to="/login" className="hover:text-[#00A86B] transition-colors">Sign In</Link>
                  <Link to="/register" className="hover:text-[#00A86B] transition-colors">Create Free Account</Link>
                </div>
              </div>

            </div>

          </div>

          {/* Divider */}
          <div className="w-full h-px bg-white/10" />

          {/* Bottom Row */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-zinc-400 font-medium">
            <p>© {new Date().getFullYear()} SALDO. All Rights Reserved.</p>
            <p className="text-zinc-500">Intelligent Personal Finance Companion</p>
          </div>

        </div>

        {/* Large Aesthetic Watermark Wordmark */}
        <div className="absolute -bottom-10 right-4 md:right-12 text-[120px] sm:text-[180px] md:text-[220px] font-black font-display text-white/[0.03] select-none pointer-events-none tracking-tighter leading-none">
          SALDO
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
