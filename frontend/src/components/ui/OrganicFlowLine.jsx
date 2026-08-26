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
      
      {/* 1. DESKTOP VIEWPORT SVG (Wide 2-Column Composition) */}
      <svg
        viewBox="0 0 1600 700"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="hidden md:block w-full h-full overflow-visible"
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
            d="M -100 420 
               C 60 520, 180 580, 320 580 
               C 390 580, 425 510, 395 440 
               C 370 370, 295 400, 315 490 
               C 330 560, 400 580, 480 510 
               C 620 400, 780 270, 940 180 
               C 1010 135, 1090 145, 1070 250 
               C 1050 350, 1120 450, 1220 420 
               C 1290 390, 1360 270, 1315 180 
               C 1270 95, 1180 140, 1210 280 
               C 1235 390, 1380 290, 1720 100"
            stroke="#00A86B"
            strokeWidth="15.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="saldo-swirl-path-desktop"
          />
        </g>
      </svg>

      {/* 2. MOBILE VIEWPORT SVG (Strictly positioned in lower phone area from bottom-left to top-right) */}
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
            strokeWidth="12"
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
