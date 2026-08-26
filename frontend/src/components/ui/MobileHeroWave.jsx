import React, { useState, useEffect } from "react";

export const MobileHeroWave = ({ className = "" }) => {
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDrawn(true);
    }, 60);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`w-full h-full overflow-visible pointer-events-none select-none flex items-center justify-center ${className}`}>
      
      {/* 1. DESKTOP WIDE-VIEWPORT SWIRL (Stretches gracefully edge-to-edge on desktop) */}
      <svg
        viewBox="0 0 1400 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="hidden md:block w-full h-full overflow-visible"
      >
        <defs>
          <style>
            {`
              .saldo-desk-swirl-path {
                stroke-dasharray: 4500;
                stroke-dashoffset: ${drawn ? "0" : "4500"};
                transition: stroke-dashoffset 4.5s cubic-bezier(0.22, 1, 0.36, 1);
              }
              @keyframes desk-swirl-float {
                0%, 100% { transform: translateY(0px) rotate(0deg); }
                50% { transform: translateY(-3.5px) rotate(0.3deg); }
              }
              .saldo-desk-swirl-group {
                animation: desk-swirl-float 9s ease-in-out infinite;
                transform-origin: center;
              }
            `}
          </style>
        </defs>

        <g className="saldo-desk-swirl-group">
          {/* Broad, elegant flowing curve extending way past both ends */}
          <path
            d="M -120 230 
               C 120 270, 300 260, 480 190 
               C 620 130, 710 40, 620 15 
               C 530 -8, 460 90, 570 170 
               C 700 260, 960 180, 1550 50"
            stroke="#00A86B"
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="saldo-desk-swirl-path opacity-50 dark:opacity-40"
          />
        </g>
      </svg>

      {/* 2. MOBILE PORTRAIT-VIEWPORT SWIRL */}
      <svg
        viewBox="0 0 800 260"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="block md:hidden w-full h-full overflow-visible"
      >
        <defs>
          <style>
            {`
              .saldo-hero-swirl-path {
                stroke-dasharray: 3500;
                stroke-dashoffset: ${drawn ? "0" : "3500"};
                transition: stroke-dashoffset 4.2s cubic-bezier(0.22, 1, 0.36, 1);
              }
              @keyframes hero-swirl-float {
                0%, 100% { transform: translateY(0px) rotate(0deg); }
                50% { transform: translateY(-4px) rotate(0.4deg); }
              }
              .saldo-hero-swirl-group {
                animation: hero-swirl-float 8s ease-in-out infinite;
                transform-origin: center;
              }
            `}
          </style>
        </defs>

        <g className="saldo-hero-swirl-group">
          <path
            d="M -120 200 
               C 20 250, 160 230, 300 160 
               C 400 110, 460 20, 360 5 
               C 250 -10, 180 110, 280 190 
               C 380 260, 560 170, 920 40"
            stroke="#00A86B"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="saldo-hero-swirl-path opacity-50 dark:opacity-40"
          />
        </g>
      </svg>

    </div>
  );
};

export default MobileHeroWave;
