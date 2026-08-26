import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  Sparkles, 
  Check, 
  Plus, 
  Minus, 
  Shield, 
  TrendingUp, 
  Landmark, 
  PieChart, 
  Clock,
  ArrowUpRight,
  CreditCard,
  Wallet,
  CheckCircle2,
  Calendar,
  Flame,
  ArrowLeftRight
} from "lucide-react";
import OrganicFlowLine from "../components/ui/OrganicFlowLine";
import HeroProductVisual from "../components/HeroProductVisual";
import hpHeroImage from "../assets/hp_hero.webp";

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
    <div className="min-h-screen bg-[#E8F5EE] text-[#09261E] selection:bg-[#00A86B] selection:text-white transition-colors duration-300 relative overflow-x-hidden font-sans">
      
      {/* ========================================================================= */}
      {/* STICKY GLASSMORPHISM NAVBAR                                               */}
      {/* ========================================================================= */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center transition-all duration-500 pointer-events-none px-3 sm:px-6">
        <div
          className={`w-full transition-all duration-500 ease-out flex items-center justify-between pointer-events-auto ${
            scrolled
              ? "max-w-5xl mt-3 sm:mt-4 px-5 py-2.5 sm:py-3 bg-white/80 dark:bg-[#09261E]/80 backdrop-blur-xl border border-[#D1EADE]/90 dark:border-[#14382C] rounded-full shadow-lg shadow-[#09261E]/5"
              : "max-w-6xl mt-2 sm:mt-4 px-4 sm:px-8 py-4 bg-transparent border-transparent shadow-none"
          }`}
        >
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-1.5 font-display font-black text-xl tracking-tight text-[#09261E] dark:text-white">
            <span>SALDO</span>
            <span className="w-2 h-2 rounded-full bg-[#00A86B]"></span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-[#14493A] dark:text-[#88C8AC]">
            <a href="#how-it-works" className="hover:text-[#00A86B] transition-colors">How It Works</a>
            <a href="#insights" className="hover:text-[#00A86B] transition-colors">Insights</a>
            <a href="#forecast" className="hover:text-[#00A86B] transition-colors">Forecast</a>
            <a href="#accounts" className="hover:text-[#00A86B] transition-colors">Accounts</a>
            <a href="#why-saldo" className="hover:text-[#00A86B] transition-colors">Why SALDO</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-3.5 py-2 text-xs font-bold text-[#09261E] dark:text-white hover:text-[#00A86B] transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-5 py-2 rounded-full text-xs font-black bg-[#00A86B] hover:bg-[#00935D] text-white transition-all shadow-md shadow-[#00A86B]/20 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-1.5 rounded-lg text-[#09261E] dark:text-white hover:bg-black/5 transition-colors cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-[#09261E]/80 backdrop-blur-md md:hidden flex flex-col justify-center items-center gap-6 p-6 animate-fade-in text-center">
          <button 
            onClick={() => setMobileOpen(false)}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/20 text-white cursor-pointer"
          >
            ✕
          </button>
          <a href="#how-it-works" onClick={() => setMobileOpen(false)} className="text-xl font-bold font-display text-white">How It Works</a>
          <a href="#insights" onClick={() => setMobileOpen(false)} className="text-xl font-bold font-display text-white">Insights</a>
          <a href="#forecast" onClick={() => setMobileOpen(false)} className="text-xl font-bold font-display text-white">Forecast</a>
          <a href="#accounts" onClick={() => setMobileOpen(false)} className="text-xl font-bold font-display text-white">Accounts</a>
          <a href="#why-saldo" onClick={() => setMobileOpen(false)} className="text-xl font-bold font-display text-white">Why SALDO</a>
          <div className="flex flex-col gap-3 w-full max-w-xs mt-4">
            <Link to="/login" onClick={() => setMobileOpen(false)} className="w-full py-3 bg-white/10 text-white rounded-full font-bold text-sm">
              Sign In
            </Link>
            <Link to="/register" onClick={() => setMobileOpen(false)} className="w-full py-3 bg-[#00A86B] text-white rounded-full font-black text-sm shadow-lg shadow-[#00A86B]/30">
              Get Started Free
            </Link>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 01 — LIGHT: HERO SECTION                                                  */}
      {/* ========================================================================= */}
      <section className="pt-24 sm:pt-28 md:pt-32 pb-12 md:pb-16 px-4 sm:px-8 max-w-6xl mx-auto relative">
        
        {/* Continuous Animated Organic Flow Line Motif (Spans Full Browser Viewport) */}
        <div className="absolute top-[48%] -translate-y-1/2 left-1/2 -translate-x-1/2 w-screen min-w-[100vw] h-[780px] sm:h-[820px] md:h-[650px] pointer-events-none -z-0 overflow-visible flex items-center justify-center">
          <OrganicFlowLine className="w-full h-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center relative z-10">
          
          {/* LEFT: Product Message */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-[#D1EADE] text-[#0E362A] text-xs font-bold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#00A86B]"></span>
              An intelligent personal finance companion
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black font-display tracking-tight text-[#09261E] leading-[1.04]">
              Your money,<br />
              <span className="text-[#00A86B]">understood.</span>
            </h1>

            <p className="text-base sm:text-lg text-[#1C5F4D] max-w-lg font-medium leading-relaxed">
              Track spending, understand your habits, and see what's ahead without filling out endless forms.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link
                to="/register"
                className="px-7 py-3.5 bg-[#00A86B] hover:bg-[#00935D] text-white font-black text-sm rounded-full shadow-xl shadow-[#00A86B]/25 transition-all flex items-center gap-2 cursor-pointer active:scale-98"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#how-it-works"
                className="px-6 py-3.5 bg-white hover:bg-[#F4FAF6] border border-[#D1EADE] text-[#09261E] font-bold text-sm rounded-full transition-all flex items-center justify-center shadow-2xs"
              >
                See How It Works
              </a>
            </div>

            <div className="pt-3 flex items-center gap-2 text-xs font-serif italic text-[#1C5F4D]">
              <span>Your money is always moving.</span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#00A86B] stroke-current stroke-2">
                <path d="M 4 8 Q 14 6, 18 16" strokeLinecap="round" />
                <path d="M 14 16 L 18 16 L 18 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* RIGHT: Realistic Phone Mockup */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end relative">
            <HeroProductVisual className="relative z-10" />
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 02 — LIGHT: CAPTURE PRODUCT STORY (LIVE INTERACTIVE DEMONSTRATION)        */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="py-20 md:py-28 px-4 sm:px-8 max-w-6xl mx-auto relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* LEFT: Editorial Narrative & Statement */}
          <div className="lg:col-span-5 space-y-6 text-left">
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
          <div className="lg:col-span-7 space-y-4">
            
            {/* Input Simulation Box */}
            <div className="bg-white rounded-2xl p-5 border border-[#D1EADE] shadow-xs space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1C5F4D]">
                Natural Language Input
              </span>
              <div className="text-base sm:text-lg font-bold font-display text-[#09261E] flex items-center justify-between">
                <span>"{demoText}"</span>
                <span className="w-7 h-7 rounded-lg bg-[#00A86B] text-white flex items-center justify-center shrink-0 ml-2">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
            </div>

            {/* Downward connecting indicator */}
            <div className="flex justify-center -my-1">
              <div className="w-0.5 h-6 bg-[#00A86B]/40" />
            </div>

            {/* Interpreted Result Visual */}
            <div className="bg-white rounded-2xl p-6 border border-[#D1EADE] shadow-md space-y-4">
              <div className="flex justify-between items-center border-b border-[#E8F5EE] pb-3">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#00A86B] flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  SALDO Understood & Categorized
                </span>
                <span className="text-[10px] font-mono text-[#1C5F4D]">
                  {demoDraft.time}
                </span>
              </div>

              <div className="flex justify-between items-baseline">
                <div>
                  <h3 className="text-xl font-bold font-display text-[#09261E]">{demoDraft.title}</h3>
                  <p className="text-xs text-[#1C5F4D] font-medium mt-0.5">Resolved automatically to default account</p>
                </div>
                <span className="text-2xl font-black font-mono text-[#09261E] tabular-nums">
                  {demoDraft.amount}
                </span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#E8F5EE]">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-[#F4FAF6] border border-[#D1EADE] rounded-lg text-xs font-semibold text-[#09261E]">
                    🏦 {demoDraft.account}
                  </span>
                  <span className="px-2.5 py-1 bg-[#E8F5EE] border border-[#C2E2D3] rounded-lg text-xs font-semibold text-[#00A86B]">
                    🏷️ {demoDraft.category}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold text-[#00A86B]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Saved with exact second</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 03 — LIGHT: EDITORIAL WHITESPACE STATEMENT                                */}
      {/* ========================================================================= */}
      <section className="py-24 md:py-36 px-4 sm:px-8 max-w-5xl mx-auto text-center relative z-10">
        <div className="max-w-3xl mx-auto space-y-6">
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#00A86B]">
            A New Standard For Personal Finance
          </p>

          <h2 className="text-4xl sm:text-6xl md:text-7xl font-black font-display tracking-tight text-[#09261E] leading-[1.06]">
            You don't need another spreadsheet.
          </h2>

          <p className="text-lg sm:text-2xl text-[#1C5F4D] font-medium leading-relaxed max-w-2xl mx-auto">
            You just need to tell SALDO what happened. Complexity belongs inside the engine, not on your screen.
          </p>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 04 — DARK: DEEP FOREST INSIGHTS SHOWCASE                                  */}
      {/* ========================================================================= */}
      <section id="insights" className="bg-gradient-to-b from-[#061F16] via-[#09261E] to-[#051811] text-white py-24 md:py-32 px-4 sm:px-8 relative overflow-hidden">
        
        {/* Subtle Background Swirling Line */}
        <div className="absolute top-10 right-0 w-96 h-96 opacity-20 pointer-events-none">
          <svg viewBox="0 0 400 400" fill="none" className="w-full h-full">
            <path d="M 50 350 C 150 200, 250 380, 350 150" stroke="#00A86B" strokeWidth="16" strokeLinecap="round" />
          </svg>
        </div>

        <div className="max-w-6xl mx-auto space-y-12 relative z-10">
          
          {/* Header Narrative */}
          <div className="max-w-2xl space-y-4">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#00A86B]">
              02 · Financial Intelligence
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black font-display tracking-tight text-white leading-tight">
              What happened to my money?
            </h2>
            <p className="text-sm sm:text-base text-[#B7DFCD] font-medium leading-relaxed">
              SALDO turns everyday transactions into something you can actually understand. No four-corner dashboard grid, just clear narrative understanding.
            </p>
          </div>

          {/* ONE Large Integrated Financial Visualization Presentation */}
          <div className="border-t border-white/15 pt-8 space-y-8">
            
            {/* Inline Cashflow Statement */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 sm:divide-x sm:divide-white/10">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#88C8AC]">Income</span>
                <p className="text-3xl font-black font-display text-emerald-400 tabular-nums">Rp 8.500.000</p>
                <p className="text-[10px] text-[#88C8AC]">Across 3 primary streams</p>
              </div>

              <div className="space-y-1 sm:pl-8">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#88C8AC]">Spent</span>
                <p className="text-3xl font-black font-display text-rose-300 tabular-nums">Rp 5.900.000</p>
                <p className="text-[10px] text-[#88C8AC]">6% lower than previous month</p>
              </div>

              <div className="space-y-1 sm:pl-8">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#00A86B]">Net Saved</span>
                <p className="text-3xl font-black font-display text-white tabular-nums">Rp 2.600.000</p>
                <p className="text-[10px] text-[#00A86B] font-semibold">31% monthly savings rate</p>
              </div>
            </div>

            {/* Category Progress Strip */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-white">Top Flexible Expenses</span>
                <span className="text-[#88C8AC]">Food & Drinks · Transportation · Shopping</span>
              </div>
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden flex gap-1 p-0.5">
                <div className="h-full bg-[#00A86B] rounded-full w-[45%]" title="Food & Drinks 45%" />
                <div className="h-full bg-[#10B981] rounded-full w-[25%]" title="Transportation 25%" />
                <div className="h-full bg-[#34D399] rounded-full w-[15%]" title="Shopping 15%" />
                <div className="h-full bg-white/30 rounded-full w-[15%]" title="Other 15%" />
              </div>
            </div>

            {/* Contextual Discretionary AI Observation Annotation */}
            <div className="bg-white/5 border-l-4 border-[#00A86B] p-5 rounded-r-2xl space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#00A86B]">
                Contextual Observation
              </span>
              <p className="text-sm font-bold text-white">
                Food & Drinks is running Rp 300K above your usual pace.
              </p>
              <p className="text-xs text-[#B7DFCD] leading-relaxed">
                Discretionary dining accounts for 45% of this month's spending. Reducing flexible outings by Rp 200K will preserve your 34% savings target before your next payday.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 05 — LIGHT: FORECAST (DETERMINISTIC FINANCIAL INSTRUMENT)                 */}
      {/* ========================================================================= */}
      <section id="forecast" className="py-20 md:py-28 px-4 sm:px-8 max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* LEFT: Explanation */}
          <div className="lg:col-span-5 space-y-5 text-left">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#00A86B]">
              03 · Deterministic Forecast
            </span>

            <h2 className="text-4xl sm:text-5xl font-black font-display tracking-tight text-[#09261E] leading-tight">
              Know what's coming.
            </h2>

            <p className="text-sm sm:text-base text-[#1C5F4D] leading-relaxed font-medium">
              SALDO continuously calculates your daily burn rate against elapsed calendar days to project your exact wealth before your next payday.
            </p>
            <p className="text-xs text-[#1C5F4D] opacity-80">
              No AI hallucinations or fabricated guesses — pure deterministic financial math.
            </p>
          </div>

          {/* RIGHT: Financial Forecast Instrument Surface */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-[#D1EADE] shadow-lg space-y-6">
            
            <div className="flex justify-between items-baseline">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1C5F4D]">
                  Estimated Balance Before Payday
                </span>
                <h3 className="text-4xl sm:text-5xl font-black font-display tracking-tight text-[#09261E] mt-1 tabular-nums">
                  Rp 2.600.000
                </h3>
              </div>
              <span className="text-xs font-bold text-[#00A86B] bg-[#E8F5EE] px-3 py-1 rounded-full">
                At your current spending pace
              </span>
            </div>

            {/* Trajectory Timeline: TODAY → SPENDING PACE → PAYDAY */}
            <div className="space-y-2 pt-2 border-t border-[#E8F5EE]">
              <div className="flex justify-between text-xs font-bold text-[#1C5F4D]">
                <span>Today (Day 18)</span>
                <span className="text-[#00A86B]">Rp 195.000 / day pace</span>
                <span>Payday (Aug 31)</span>
              </div>

              {/* Sparkline Curve */}
              <div className="h-16 w-full pt-1">
                <svg viewBox="0 0 400 60" fill="none" className="w-full h-full">
                  <path d="M 0 45 Q 120 38, 200 24 T 400 12" stroke="#00A86B" strokeWidth="3" strokeLinecap="round" />
                  <path d="M 0 45 Q 120 38, 200 24 T 400 12 L 400 60 L 0 60 Z" fill="#00A86B" opacity="0.1" />
                  <circle cx="200" cy="24" r="4" fill="#00A86B" />
                </svg>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs text-[#1C5F4D] pt-2 border-t border-[#E8F5EE]">
              <span>13 days remaining in billing cycle</span>
              <span className="font-semibold text-[#09261E]">Projected spend: Rp 5.900.000</span>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 06 — LIGHT: ACCOUNTS (ALL YOUR MONEY. ONE CLEAR PICTURE.)                 */}
      {/* ========================================================================= */}
      <section id="accounts" className="py-20 md:py-28 px-4 sm:px-8 max-w-6xl mx-auto border-t border-[#D1EADE]/70 relative z-10">
        
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#00A86B]">
            04 · Unified Accounts
          </span>
          <h2 className="text-4xl sm:text-5xl font-black font-display tracking-tight text-[#09261E]">
            All your money. One clear picture.
          </h2>
          <p className="text-sm sm:text-base text-[#1C5F4D] font-medium">
            Seamlessly monitor Bank accounts, E-Wallets, and Cash in one place with automatic default routing.
          </p>
        </div>

        {/* Visual Account Objects Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-white rounded-2xl p-6 border border-[#D1EADE] shadow-xs space-y-4 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-xl bg-[#00A86B] text-white flex items-center justify-center font-bold">
                <Landmark className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 bg-[#E8F5EE] text-[#00A86B] rounded-md">
                Default Expense
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-[#1C5F4D]">Bank Central Asia</p>
              <h4 className="text-2xl font-black font-display text-[#09261E] mt-0.5 tabular-nums">Rp 4.200.000</h4>
            </div>
            <p className="text-[10px] text-[#1C5F4D] pt-2 border-t border-[#E8F5EE]">Primary operating account</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#D1EADE] shadow-xs space-y-4 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-xl bg-[#0284C7] text-white flex items-center justify-center font-bold">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-bold text-[#1C5F4D]">E-Wallet</span>
            </div>
            <div>
              <p className="text-xs font-bold text-[#1C5F4D]">GoPay Wallet</p>
              <h4 className="text-2xl font-black font-display text-[#09261E] mt-0.5 tabular-nums">Rp 500.000</h4>
            </div>
            <p className="text-[10px] text-[#1C5F4D] pt-2 border-t border-[#E8F5EE]">Instant daily coffee & ride-hail</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#D1EADE] shadow-xs space-y-4 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-xl bg-[#059669] text-white flex items-center justify-center font-bold">
                <CreditCard className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-bold text-[#1C5F4D]">Cash</span>
            </div>
            <div>
              <p className="text-xs font-bold text-[#1C5F4D]">Physical Cash Wallet</p>
              <h4 className="text-2xl font-black font-display text-[#09261E] mt-0.5 tabular-nums">Rp 200.000</h4>
            </div>
            <p className="text-[10px] text-[#1C5F4D] pt-2 border-t border-[#E8F5EE]">Street food & parking petty cash</p>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 07 — DARK: DUAL-DEVICE SHOWCASE (SERRA-INSPIRED ADVERTISING SHOWCASE)     */}
      {/* ========================================================================= */}
      <section className="bg-gradient-to-br from-[#061F16] via-[#09261E] to-[#04140E] text-white py-24 md:py-32 px-4 sm:px-8 relative overflow-hidden">
        
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

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* LEFT: Two Overlapping iPhone Devices Mockup */}
          <div className="lg:col-span-6 flex items-center justify-center relative py-4">
            
            {/* Primary Phone */}
            <div className="relative w-44 sm:w-56 md:w-64 transform -rotate-6">
              <img
                src={hpHeroImage}
                alt="SALDO Analytics Device"
                className="w-full h-auto object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.5)]"
              />
            </div>

            {/* Secondary Overlapping Phone (Tilted) */}
            <div className="relative w-40 sm:w-52 md:w-60 -ml-12 sm:-ml-16 md:-ml-20 mt-8 sm:mt-12 transform rotate-12">
              <img
                src={hpHeroImage}
                alt="SALDO Capture Device"
                className="w-full h-auto object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.5)]"
              />
            </div>

          </div>

          {/* RIGHT: Large Editorial Copy */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#00A86B]">
              Effortless Intelligence
            </span>

            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black font-display tracking-tight text-white leading-tight">
              Money management without the management.
            </h2>

            <p className="text-base sm:text-lg text-[#B7DFCD] leading-relaxed font-medium">
              SALDO quietly organizes what happens with your money, so you can spend less time bookkeeping and more time understanding it.
            </p>

            <div className="pt-2">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#00A86B] hover:bg-[#00935D] text-white font-black text-sm rounded-full shadow-lg shadow-[#00A86B]/30 transition-all cursor-pointer"
              >
                <span>Experience SALDO</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 08 — LIGHT: WHY SALDO (EDITORIAL PRODUCT MANIFESTO)                       */}
      {/* ========================================================================= */}
      <section id="why-saldo" className="py-24 md:py-32 px-4 sm:px-8 max-w-4xl mx-auto relative z-10">
        
        <div className="mb-12 space-y-2 text-left">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#00A86B]">
            Why SALDO
          </span>
          <h2 className="text-4xl sm:text-5xl font-black font-display tracking-tight text-[#09261E]">
            Designed for clarity, not complexity.
          </h2>
        </div>

        {/* Editorial Manifesto Rows with Thin Dividers (No Container Cards) */}
        <div className="divide-y divide-[#D1EADE] border-y border-[#D1EADE]">
          {manifestoItems.map((item, idx) => {
            const isOpen = openAccordion === idx;
            return (
              <div key={idx} className="py-6 transition-colors">
                <button
                  type="button"
                  onClick={() => setOpenAccordion(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left cursor-pointer group"
                >
                  <div className="flex items-baseline gap-4 sm:gap-8">
                    <span className="text-xs font-mono font-bold text-[#00A86B]">
                      {item.num}
                    </span>
                    <span className="text-lg sm:text-xl font-bold font-display text-[#09261E] group-hover:text-[#00A86B] transition-colors">
                      {item.title}
                    </span>
                  </div>

                  <span className="text-xs font-mono text-[#00A86B] ml-4 shrink-0">
                    {isOpen ? "—" : "+"}
                  </span>
                </button>

                {isOpen && (
                  <div className="pl-10 sm:pl-16 pr-4 pt-3 text-xs sm:text-sm text-[#1C5F4D] leading-relaxed font-medium animate-fade-in">
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
      <section className="bg-gradient-to-b from-[#061F16] to-[#04140E] text-white py-28 md:py-36 px-4 sm:px-8 text-center relative overflow-hidden">
        
        {/* Organic Flow Line as Visual Bridge */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-screen min-w-[100vw] h-[350px] pointer-events-none opacity-40">
          <svg viewBox="0 0 1200 300" fill="none" className="w-full h-full">
            <path d="M -100 200 C 300 280, 600 50, 900 220 C 1050 300, 1200 150, 1350 100" stroke="#00A86B" strokeWidth="12" strokeLinecap="round" />
          </svg>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-black font-display tracking-tight text-white leading-tight">
            Your money is always moving.<br />
            <span className="text-[#00A86B]">SALDO helps you see where it's going.</span>
          </h2>

          <p className="text-base sm:text-lg text-[#B7DFCD] font-medium max-w-md mx-auto">
            Say what happened. SALDO handles the rest.
          </p>

          <div className="pt-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-9 py-4 bg-[#00A86B] hover:bg-[#00935D] text-white font-black text-sm rounded-full shadow-2xl shadow-[#00A86B]/40 transition-all cursor-pointer active:scale-98"
            >
              <span>Get started →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10 — FOOTER (ESTATE-STYLE MULTI-COLUMN WITH BRAND WATERMARK)              */}
      {/* ========================================================================= */}
      <footer className="bg-[#030F0B] text-white pt-20 pb-10 px-4 sm:px-8 md:px-16 lg:px-24 w-full overflow-hidden relative">
        <div className="max-w-7xl mx-auto relative z-10 space-y-16">
          
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

            {/* Right Link Columns (5 cols) */}
            <div className="lg:col-span-5 flex justify-between gap-8 flex-wrap">
              
              {/* Product */}
              <div className="flex flex-col gap-4 min-w-[100px]">
                <span className="text-xs font-extrabold uppercase tracking-wider text-white">Product</span>
                <div className="flex flex-col gap-2.5 text-xs text-zinc-400 font-medium">
                  <a href="#how-it-works" className="hover:text-[#00A86B] transition-colors">Smart Capture</a>
                  <a href="#insights" className="hover:text-[#00A86B] transition-colors">Unified Insights</a>
                  <a href="#forecast" className="hover:text-[#00A86B] transition-colors">Forecasting</a>
                  <a href="#accounts" className="hover:text-[#00A86B] transition-colors">Multi-Accounts</a>
                  <a href="#why-saldo" className="hover:text-[#00A86B] transition-colors">Why SALDO</a>
                </div>
              </div>

              {/* Company */}
              <div className="flex flex-col gap-4 min-w-[100px]">
                <span className="text-xs font-extrabold uppercase tracking-wider text-white">Company</span>
                <div className="flex flex-col gap-2.5 text-xs text-zinc-400 font-medium">
                  <Link to="/" className="hover:text-[#00A86B] transition-colors">About Us</Link>
                  <Link to="/" className="hover:text-[#00A86B] transition-colors">Philosophy</Link>
                  <Link to="/" className="hover:text-[#00A86B] transition-colors">Security & Privacy</Link>
                  <Link to="/" className="hover:text-[#00A86B] transition-colors">Careers</Link>
                  <Link to="/" className="hover:text-[#00A86B] transition-colors">Contact</Link>
                </div>
              </div>

              {/* Social */}
              <div className="flex flex-col gap-4 min-w-[100px]">
                <span className="text-xs font-extrabold uppercase tracking-wider text-white">Social</span>
                <div className="flex flex-col gap-2.5 text-xs text-zinc-400 font-medium">
                  <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-[#00A86B] transition-colors">Twitter / X</a>
                  <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-[#00A86B] transition-colors">GitHub</a>
                  <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-[#00A86B] transition-colors">LinkedIn</a>
                  <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-[#00A86B] transition-colors">Instagram</a>
                </div>
              </div>

            </div>

          </div>

          {/* Divider */}
          <div className="w-full h-px bg-white/10" />

          {/* Bottom Row */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-zinc-400 font-medium">
            <p>© {new Date().getFullYear()} SALDO. All Rights Reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Security Architecture</a>
            </div>
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
