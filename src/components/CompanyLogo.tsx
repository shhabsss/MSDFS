import React, { useState } from 'react';

interface CompanyLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'compact' | 'badge';
  theme?: 'dark' | 'light' | 'auto';
  showTagline?: boolean;
}

/**
 * CompanyLogo for MSD Facility Services
 * Displays the authentic company branding with:
 * - Golden "MSD" letters with black contour
 * - Curved green leaf emblem with veins
 * - "FACILITY SERVICES" typography in emerald green and gold
 * Features high-res image loading with seamless SVG vector fallback.
 */
export const CompanyLogo: React.FC<CompanyLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'full',
  theme = 'auto',
  showTagline = false
}) => {
  const [imgError, setImgError] = useState(false);

  // Height mappings based on size
  const heightClasses = {
    sm: 'h-7',
    md: 'h-10',
    lg: 'h-14',
    xl: 'h-20'
  };

  const imgHeight = heightClasses[size] || 'h-10';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {!imgError ? (
        <div className="relative flex items-center shrink-0 bg-white/95 rounded-xl p-1 shadow-xs border border-amber-200/50">
          <img
            src="/logo.png"
            alt="MSD Facility Services Logo"
            className={`${imgHeight} w-auto object-contain transition-transform duration-200`}
            onError={() => setImgError(true)}
          />
        </div>
      ) : (
        /* Pixel-perfect vector SVG fallback matching uploaded logo */
        <div className="flex items-center shrink-0 bg-white rounded-xl px-2 py-1 shadow-xs border border-amber-300">
          <svg
            viewBox="0 0 320 110"
            className={`${imgHeight} w-auto`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* MSD Text in Gold with Black Outline */}
            <text
              x="8"
              y="90"
              fontFamily="Impact, 'Arial Black', sans-serif"
              fontSize="92"
              fontWeight="900"
              fill="#D4A017"
              stroke="#111111"
              strokeWidth="3.5"
              letterSpacing="2"
            >
              MSD
            </text>

            {/* Green Leaf Emblem on Top Right */}
            <g transform="translate(145, -5) scale(0.95)">
              {/* Leaf body */}
              <path
                d="M 12 75 C 25 35, 75 10, 145 2 C 125 30, 85 58, 45 74 Z"
                fill="#0F8A50"
                stroke="#0A683B"
                strokeWidth="2.5"
              />
              {/* Leaf central stem vein */}
              <path
                d="M 12 75 C 60 48, 100 28, 145 2"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Leaf diagonal veins */}
              <path
                d="M 45 56 L 62 42 M 72 45 L 94 30 M 102 32 L 122 17"
                stroke="#E2F4EA"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </g>

            {/* FACILITY text in emerald green */}
            <text
              x="148"
              y="72"
              fontFamily="'Arial Black', Montserrat, sans-serif"
              fontSize="29"
              fontWeight="900"
              fill="#0F8A50"
              letterSpacing="2.5"
            >
              FACILITY
            </text>

            {/* SERVICES text in gold with dark green outline */}
            <text
              x="148"
              y="102"
              fontFamily="'Arial Black', Montserrat, sans-serif"
              fontSize="27"
              fontWeight="900"
              fill="#D4A017"
              stroke="#0F8A50"
              strokeWidth="1.2"
              letterSpacing="2"
            >
              SERVICES
            </text>
          </svg>
        </div>
      )}

      {showTagline && (
        <div className="flex flex-col justify-center leading-tight">
          <span className="font-extrabold text-xs tracking-wider text-amber-400 uppercase">
            Facility Services
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            Puducherry
          </span>
        </div>
      )}
    </div>
  );
};
