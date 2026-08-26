import React from "react";

export const MobileHeroWave = ({ className = "" }) => {
  return (
    <div className={`w-full overflow-hidden pointer-events-none select-none ${className}`}>
      <svg
        viewBox="0 0 500 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
      >
        <defs>
          <linearGradient id="mobileWaveGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00A86B" stopOpacity="0.1" />
            <stop offset="30%" stopColor="#00A86B" stopOpacity="0.45" />
            <stop offset="70%" stopColor="#10B981" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#00A86B" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="mobileWaveGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D1EADE" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#00A86B" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Primary Organic Flow Wave */}
        <path
          d="M -20 90 C 80 140, 160 40, 260 85 C 360 130, 420 60, 520 75"
          stroke="url(#mobileWaveGrad1)"
          strokeWidth="3.5"
          strokeLinecap="round"
          className="animate-wave-draw"
          style={{
            strokeDasharray: 700,
            strokeDashoffset: 0,
            animation: "waveDraw 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          }}
        />

        {/* Secondary Harmonizing Flow Line */}
        <path
          d="M 20 120 C 120 70, 220 130, 320 65 C 400 15, 460 80, 520 110"
          stroke="url(#mobileWaveGrad2)"
          strokeWidth="2"
          strokeLinecap="round"
          style={{
            strokeDasharray: 700,
            strokeDashoffset: 0,
            animation: "waveDraw 2.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          }}
        />
      </svg>
    </div>
  );
};

export default MobileHeroWave;
