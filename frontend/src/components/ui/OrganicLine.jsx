import React from "react";

export const OrganicLine = ({ 
  variant = "loop", 
  className = "", 
  color = "currentColor", 
  strokeWidth = 3,
  animated = false 
}) => {
  if (variant === "hero-flow") {
    return (
      <svg
        viewBox="0 0 1200 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-auto pointer-events-none select-none ${className}`}
      >
        <path
          d="M-50 280 C 200 350, 350 180, 500 250 C 650 320, 720 380, 850 220 C 950 100, 1080 300, 1250 150"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={animated ? "animate-flow-dash" : ""}
        />
        <path
          d="M200 340 C 320 380, 480 320, 580 210 C 680 100, 780 120, 840 260 C 900 400, 1020 350, 1150 200"
          stroke={color}
          strokeWidth={strokeWidth * 0.75}
          strokeLinecap="round"
          opacity="0.4"
        />
      </svg>
    );
  }

  if (variant === "hero-loop") {
    return (
      <svg
        viewBox="0 0 900 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-auto pointer-events-none select-none ${className}`}
      >
        <path
          d="M 50 380 C 200 440, 320 360, 420 260 C 520 150, 620 100, 700 220 C 780 350, 680 440, 580 390 C 480 340, 490 180, 600 130 C 720 80, 820 160, 880 240"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (variant === "cta-sweep") {
    return (
      <svg
        viewBox="0 0 1000 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-auto pointer-events-none select-none ${className}`}
      >
        <path
          d="M-20 200 C 180 80, 380 260, 580 140 C 780 20, 920 180, 1020 100"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <path
          d="M100 240 C 300 180, 480 300, 680 180 C 850 80, 950 160, 1050 90"
          stroke={color}
          strokeWidth={strokeWidth * 0.6}
          strokeLinecap="round"
          opacity="0.35"
        />
      </svg>
    );
  }

  // Default simple organic curve
  return (
    <svg
      viewBox="0 0 400 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none ${className}`}
    >
      <path
        d="M 10 50 Q 100 10, 200 60 T 390 40"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
};

export default OrganicLine;
