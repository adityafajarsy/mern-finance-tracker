import { useEffect, useState } from "react";

export const OrganicFlowLine = ({ className = "" }) => {
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDrawn(true);
    }, 120);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`pointer-events-none select-none overflow-visible w-full h-full ${className}`}>
      
      {/* 1. LAPTOP & DESKTOP VIEWPORT SVG (lg: and above >= 1024px) - 100% UNTOUCHED */}
      <svg
        viewBox="0 0 1600 700"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="hidden lg:block w-full h-full overflow-visible"
      >
        <defs>
          <style>
            {`
              .saldo-swirl-path-desktop {
                stroke-dasharray: 6000;
                stroke-dashoffset: ${drawn ? "0" : "6000"};
                transition: stroke-dashoffset 5.2s cubic-bezier(0.22, 1, 0.36, 1);
              }
              @keyframes calm-drift-desk {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-4px); }
              }
              .saldo-swirl-container-desk {
                animation: calm-drift-desk 10s ease-in-out infinite;
              }
            `}
          </style>
        </defs>

        <g className="saldo-swirl-container-desk">
          <path
            d="M -80 620 
               C 180 630, 460 590, 740 510 
               C 880 470, 1000 420, 1120 380 
               C 1240 330, 1360 220, 1450 250 
               C 1530 280, 1520 440, 1380 470 
               C 1260 490, 1180 410, 1260 350 
               C 1340 300, 1520 340, 1720 360"
            stroke="#00A86B"
            strokeWidth="22"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="saldo-swirl-path-desktop"
          />
        </g>
      </svg>

      {/* 2. TABLET / IPAD MINI VIEWPORT SVG (md: to lg: 768px - 1023px) - ROUND & NEVER GEPENG */}
      <svg
        viewBox="0 0 900 700"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="hidden md:block lg:hidden w-full h-full overflow-visible"
      >
        <defs>
          <style>
            {`
              .saldo-swirl-path-tablet {
                stroke-dasharray: 4500;
                stroke-dashoffset: ${drawn ? "0" : "4500"};
                transition: stroke-dashoffset 4.8s cubic-bezier(0.22, 1, 0.36, 1);
              }
              @keyframes calm-drift-tab {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-3px); }
              }
              .saldo-swirl-container-tab {
                animation: calm-drift-tab 9s ease-in-out infinite;
              }
            `}
          </style>
        </defs>

        <g className="saldo-swirl-container-tab">
          {/* Custom Proportional Curve for iPad Mini Aspect Ratio */}
          <path
            d="M -60 620 
               C 120 630, 300 580, 480 500 
               C 560 460, 620 410, 680 370 
               C 750 320, 810 230, 860 250 
               C 910 270, 900 410, 820 440 
               C 750 460, 710 390, 760 340 
               C 810 300, 890 330, 980 360"
            stroke="#00A86B"
            strokeWidth="16"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="saldo-swirl-path-tablet"
          />
        </g>
      </svg>

      {/* 3. MOBILE VIEWPORT SVG (< 768px) - 100% UNTOUCHED */}
      <svg
        viewBox="0 0 420 850"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        className="block md:hidden w-full h-full overflow-visible"
      >
        <defs>
          <style>
            {`
              .saldo-swirl-path-mobile {
                stroke-dasharray: 3000;
                stroke-dashoffset: ${drawn ? "0" : "3000"};
                transition: stroke-dashoffset 4.2s cubic-bezier(0.22, 1, 0.36, 1);
              }
            `}
          </style>
        </defs>

        <g>
          {/* Swirl strictly in lower area: Enters bottom-left (y: 780), loops behind phone, exits top-right (y: 440) */}
          <path
            d="M -50 780 
               C 50 820, 160 800, 240 730 
               C 310 670, 340 560, 270 510 
               C 190 460, 140 560, 210 630 
               C 280 690, 370 580, 480 440"
            stroke="#00A86B"
            strokeWidth="18"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="saldo-swirl-path-mobile"
          />
        </g>
      </svg>

    </div>
  );
};

export default OrganicFlowLine;
