import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { TrendingUp, PieChart, Calendar, AlertCircle } from "lucide-react";

const AnalyticsPanel = ({ user }) => {
  const { authFetch } = useAuth();
  
  const [trends, setTrends] = useState([]);
  const [breakdown, setBreakdown] = useState({ totalExpense: 0, breakdown: [] });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("6"); // past 6 months

  const formatCurrency = (amount) => {
    return `Rp ${amount.toLocaleString("id-ID")}`;
  };

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Fetch Monthly Trends
      const trendRes = await authFetch(`/api/stats/monthly-trends?months=${timeRange}`);
      const trendData = await trendRes.json();
      if (trendRes.ok) {
        setTrends(trendData);
      }

      // Fetch Category Breakdown
      const breakRes = await authFetch(`/api/stats/category-breakdown`);
      const breakData = await breakRes.json();
      if (breakRes.ok) {
        setBreakdown(breakData);
      }
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  // --- SVG Custom Bar Chart Calculations ---
  const renderBarChart = () => {
    if (!trends || !trends.length) return null;

    const chartHeight = 160;
    const chartWidth = 500;
    const padding = 30;
    const graphHeight = chartHeight - padding * 2;
    const graphWidth = chartWidth - padding * 2;

    // Find the maximum value to scale the graph y-axis
    const maxVal = Math.max(
      ...trends.map((t) => Math.max(t.income, t.expense)),
      1000 // default minimum ceiling
    );

    const getX = (index) => padding + (index * graphWidth) / trends.length + graphWidth / (trends.length * 2) - 15;
    const getY = (val) => chartHeight - padding - (val / maxVal) * graphHeight;
    const getBarHeight = (val) => (val / maxVal) * graphHeight;

    return (
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto overflow-visible select-none">
        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const y = chartHeight - padding - ratio * graphHeight;
          return (
            <g key={idx}>
              <line
                x1={padding}
                y1={y}
                x2={chartWidth - padding}
                y2={y}
                className="stroke-zinc-100 dark:stroke-zinc-800"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <text
                x={padding - 8}
                y={y + 3}
                textAnchor="end"
                className="fill-zinc-400 dark:fill-zinc-500 text-[8px] font-bold font-mono"
              >
                {ratio === 0 ? "0" : ratio === 1 ? `Max` : `${ratio * 100}%`}
              </text>
            </g>
          );
        })}

        {/* Grouped Bars */}
        {trends.map((t, idx) => {
          const x = getX(idx);
          const incomeBarHeight = getBarHeight(t.income);
          const expenseBarHeight = getBarHeight(t.expense);
          
          return (
            <g key={idx} className="group cursor-pointer">
              {/* Tooltip background trigger bounds */}
              <rect
                x={x - 10}
                y={padding}
                width={50}
                height={graphHeight}
                className="fill-transparent hover:fill-zinc-50/10 dark:hover:fill-zinc-800/10 transition-colors"
              />
              
              {/* Income Bar (Emerald) */}
              <rect
                x={x}
                y={getY(t.income)}
                width={12}
                height={Math.max(incomeBarHeight, 2)}
                rx={4}
                className="fill-emerald-500/80 dark:fill-emerald-500/60 hover:fill-emerald-500 transition-all duration-200"
              />
              
              {/* Expense Bar (Rose) */}
              <rect
                x={x + 15}
                y={getY(t.expense)}
                width={12}
                height={Math.max(expenseBarHeight, 2)}
                rx={4}
                className="fill-rose-500/80 dark:fill-rose-500/60 hover:fill-rose-500 transition-all duration-200"
              />

              {/* Month Label */}
              <text
                x={x + 13}
                y={chartHeight - padding + 16}
                textAnchor="middle"
                className="fill-zinc-500 dark:fill-zinc-400 text-[9px] font-bold uppercase tracking-wider font-display"
              >
                {t.label.split(" ")[0]}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  // --- SVG Custom Donut Chart Calculations ---
  const renderDonutChart = () => {
    const data = breakdown.breakdown || [];
    if (!data.length) return null;

    const r = 50;
    const circumference = 2 * Math.PI * r; // 314.159
    let accumulatedPercent = 0;

    return (
      <svg viewBox="0 0 160 160" className="w-40 h-40 transform -rotate-90 select-none">
        <circle cx="80" cy="80" r={r} fill="transparent" className="stroke-zinc-100 dark:stroke-zinc-800/60" strokeWidth="18" />
        {data.map((item, idx) => {
          const strokeLength = (item.percentage / 100) * circumference;
          const strokeOffset = circumference - (accumulatedPercent / 100) * circumference;
          accumulatedPercent += item.percentage;

          return (
            <circle
              key={idx}
              cx="80"
              cy="80"
              r={r}
              fill="transparent"
              stroke={item.color}
              strokeWidth="20"
              strokeDasharray={`${strokeLength} ${circumference}`}
              strokeDashoffset={strokeOffset}
              strokeLinecap={item.percentage > 4 ? "round" : "butt"}
              className="transition-all duration-300 hover:stroke-[22] cursor-pointer"
            />
          );
        })}
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Toggle */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight font-display">Analytics</h2>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">Financial statistics & trends</p>
        </div>

        {/* Timeframe Selector */}
        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-2xl">
          {["6", "12"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                timeRange === range
                  ? "bg-white dark:bg-zinc-700 text-violet-600 dark:text-violet-400 shadow-sm font-extrabold"
                  : "text-zinc-500 dark:text-zinc-400"
              }`}
            >
              {range} Months
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 border-3 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-semibold">Generating charts...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Monthly Income vs Expense Trends Chart */}
          <div className="bg-white dark:bg-zinc-900 border border-[#EEF2F7] dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-200">Income vs Expenses</h3>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider font-display">Historical Comparison</p>
                </div>
              </div>
            </div>

            {/* Custom SVG Bar Chart Container */}
            <div className="w-full flex items-center justify-center py-4 bg-zinc-50/30 dark:bg-zinc-950/20 rounded-2xl p-2 border border-zinc-100/50 dark:border-zinc-850/50">
              {renderBarChart()}
            </div>

            {/* Chart Legends */}
            <div className="flex justify-center gap-6 text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block"></span>
                Income
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-rose-500 rounded-full inline-block"></span>
                Expenses
              </span>
            </div>
          </div>

          {/* Category Expenses Breakdown Donut Chart */}
          <div className="bg-white dark:bg-zinc-900 border border-[#EEF2F7] dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400 rounded-xl flex items-center justify-center">
                  <PieChart className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-200">Expense Breakdown</h3>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider font-display">This Month by Category</p>
                </div>
              </div>
            </div>

            {/* Donut Chart and Legend Split */}
            {!breakdown.breakdown?.length ? (
              <div className="h-44 flex flex-col items-center justify-center gap-2 border border-dashed border-zinc-250 dark:border-zinc-800 rounded-2xl text-zinc-400 dark:text-zinc-500">
                <AlertCircle className="w-6 h-6 text-zinc-305 dark:text-zinc-700" />
                <span className="text-xs font-bold">No expenses recorded this month.</span>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
                
                {/* SVG Donut */}
                <div className="relative flex items-center justify-center shrink-0">
                  {renderDonutChart()}
                  {/* Central Text displaying Total Spent */}
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-display">Total Spent</span>
                    <span className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200 font-mono mt-0.5">
                      {formatCurrency(breakdown.totalExpense)}
                    </span>
                  </div>
                </div>

                {/* Categories Legend List */}
                <div className="flex-1 space-y-2.5 w-full max-h-48 overflow-y-auto pr-1">
                  {breakdown.breakdown.slice(0, 4).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs font-bold text-zinc-800 dark:text-zinc-300">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="truncate max-w-[85px]">{item.name}</span>
                      </span>
                      <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500 font-bold">
                        {item.percentage}% ({formatCurrency(item.total)})
                      </span>
                    </div>
                  ))}
                  {breakdown.breakdown.length > 4 && (
                    <p className="text-[9px] font-bold text-violet-600 dark:text-violet-400 text-center uppercase tracking-widest pt-2 font-display">
                      + {breakdown.breakdown.length - 4} more categories
                    </p>
                  )}
                </div>

              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default AnalyticsPanel;
