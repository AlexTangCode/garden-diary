import React from 'react';

interface HenGraphicProps {
  color?: string;
  size?: number;
}

const HenGraphic: React.FC<HenGraphicProps> = ({ color = '#E5D3C5', size = 140 }) => {
  const s = size / 140;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 140 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Body */}
      <ellipse cx="70" cy="88" rx="42" ry="36" fill={color} />
      {/* Head */}
      <circle cx="70" cy="48" r="22" fill={color} />
      {/* Comb */}
      <path d="M62 30 Q65 18 70 26 Q73 14 78 24 Q83 16 84 28" stroke="#D48C45" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      {/* Wattle */}
      <ellipse cx="66" cy="60" rx="5" ry="7" fill="#D48C45" opacity="0.85" />
      {/* Beak */}
      <path d="M82 50 L92 53 L82 56 Z" fill="#D48C45" />
      {/* Eye */}
      <circle cx="80" cy="46" r="4" fill="white" />
      <circle cx="81" cy="46" r="2.2" fill="#2D2D2D" />
      <circle cx="82" cy="44.5" r="0.9" fill="white" />
      {/* Wing detail */}
      <ellipse cx="48" cy="88" rx="14" ry="22" fill={color} opacity="0.6"
        transform="rotate(-15 48 88)" />
      <ellipse cx="92" cy="88" rx="14" ry="22" fill={color} opacity="0.6"
        transform="rotate(15 92 88)" />
      {/* Tail feathers */}
      <path d="M112 78 Q128 60 122 88" stroke={color} strokeWidth="8" strokeLinecap="round" fill="none" />
      <path d="M110 72 Q130 50 126 80" stroke={color} strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.7" />
      {/* Legs */}
      <rect x="60" y="120" width="7" height="16" rx="3.5" fill="#D48C45" />
      <rect x="74" y="120" width="7" height="16" rx="3.5" fill="#D48C45" />
      {/* Feet */}
      <path d="M55 136 L64 136 M64 136 L68 130" stroke="#D48C45" strokeWidth="3" strokeLinecap="round" />
      <path d="M69 136 L78 136 M78 136 L82 130" stroke="#D48C45" strokeWidth="3" strokeLinecap="round" />
      {/* Body shading */}
      <ellipse cx="70" cy="88" rx="42" ry="36" fill="rgba(255,255,255,0.08)" />
    </svg>
  );
};

export default HenGraphic;
