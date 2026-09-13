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
            d="M -80 580 
               C 160 600, 380 610, 600 580 
               C 780 550, 940 480, 1080 390 
               C 1200 310, 1320 270, 1400 300 
               C 1480 330, 1510 440, 1440 500 
               C 1370 560, 1250 560, 1200 480 
               C 1150 410, 1200 320, 1300 260 
               C 1420 200, 1560 210, 1720 200"
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
            d="M -60 580 
               C 100 600, 240 610, 380 570 
               C 480 540, 580 470, 660 390 
               C 720 320, 790 280, 840 310 
               C 890 340, 900 440, 850 490 
               C 800 540, 730 530, 710 460 
               C 690 400, 720 330, 780 270 
               C 840 220, 910 220, 980 210"
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
