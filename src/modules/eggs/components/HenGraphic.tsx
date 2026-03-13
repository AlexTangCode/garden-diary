import React from 'react';

interface HenGraphicProps {
  color?: string;
  size?: number;
}

const HenGraphic: React.FC<HenGraphicProps> = ({ color = '#E5D3C5', size = 160 }) => {
  return (
    <svg
      width={size}
      height={size * 0.75}
      viewBox="0 0 200 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Shadow */}
      <ellipse cx="95" cy="138" rx="62" ry="8" fill={color} opacity="0.25" />

      {/* Body — wide flat oval */}
      <ellipse cx="95" cy="105" rx="62" ry="38" fill={color} />

      {/* Wing — overlapping curved shape on body */}
      <ellipse cx="80" cy="102" rx="36" ry="24"
        fill={color === '#E5D3C5' ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.25)'}
        transform="rotate(-8 80 102)" />

      {/* Tail feathers — right side, fanned out */}
      <ellipse cx="152" cy="88" rx="18" ry="10" fill={color}
        transform="rotate(-30 152 88)" />
      <ellipse cx="158" cy="98" rx="18" ry="10" fill={color}
        transform="rotate(-10 158 98)" />
      <ellipse cx="157" cy="110" rx="16" ry="9" fill={color}
        transform="rotate(12 157 110)" />

      {/* Neck */}
      <ellipse cx="42" cy="90" rx="16" ry="20" fill={color} />

      {/* Head */}
      <circle cx="34" cy="72" r="20" fill={color} />

      {/* Comb */}
      <path d="M26 55 Q29 44 33 52 Q36 42 40 50 Q44 43 46 52"
        fill="#C8603A" />

      {/* Wattle */}
      <ellipse cx="28" cy="82" rx="6" ry="8" fill="#C8603A" opacity="0.9" />

      {/* Beak */}
      <path d="M16 72 L8 75 L16 78 Z" fill="#D4922A" />

      {/* Eye */}
      <circle cx="26" cy="68" r="5" fill="white" />
      <circle cx="25" cy="68" r="3" fill="#2D2D2D" />
      <circle cx="24" cy="66.5" r="1.2" fill="white" />

      {/* Legs */}
      <rect x="72" y="136" width="8" height="12" rx="4" fill="#D4922A" />
      <rect x="90" y="136" width="8" height="12" rx="4" fill="#D4922A" />

      {/* Feet */}
      <path d="M66 148 L74 148 M60 145 L74 148" stroke="#D4922A" strokeWidth="3" strokeLinecap="round" />
      <path d="M84 148 L92 148 M78 145 L92 148" stroke="#D4922A" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
};

export default HenGraphic;
