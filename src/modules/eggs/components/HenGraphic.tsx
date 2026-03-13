import React from 'react';

interface HenGraphicProps {
  color?: string;
  size?: number;
}

// 原版造型：尾巴在左，头在右，身体宽扁横卧
const HenGraphic: React.FC<HenGraphicProps> = ({ color = '#E5D3C5', size = 160 }) => {
  const w = size;
  const h = size * 0.72;
  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 200 144"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* ---- 尾巴（左侧，扇形羽毛向左上翘） ---- */}
      <ellipse cx="36" cy="72" rx="28" ry="14" fill={color}
        transform="rotate(-40 36 72)" />
      <ellipse cx="28" cy="82" rx="28" ry="13" fill={color}
        transform="rotate(-15 28 82)" />
      <ellipse cx="26" cy="95" rx="26" ry="11" fill={color}
        transform="rotate(10 26 95)" />

      {/* ---- 身体（宽扁大椭圆） ---- */}
      <ellipse cx="110" cy="98" rx="72" ry="38" fill={color} />

      {/* ---- 翅膀（大圆弧覆盖在身体上，白色半透明） ---- */}
      <ellipse cx="95" cy="88" rx="48" ry="28"
        fill="white" opacity="0.30"
        transform="rotate(-8 95 88)" />

      {/* ---- 颈部 ---- */}
      <ellipse cx="168" cy="82" rx="14" ry="22" fill={color}
        transform="rotate(10 168 82)" />

      {/* ---- 头 ---- */}
      <circle cx="176" cy="60" r="22" fill={color} />

      {/* ---- 鸡冠（棕红色圆润团状） ---- */}
      <ellipse cx="171" cy="42" rx="10" ry="7" fill="#B05A2A" />
      <ellipse cx="181" cy="40" rx="9" ry="7" fill="#B05A2A" />
      <ellipse cx="189" cy="43" rx="7" ry="6" fill="#B05A2A" />

      {/* ---- 肉垂 ---- */}
      <ellipse cx="185" cy="74" rx="6" ry="8" fill="#B05A2A" opacity="0.9" />

      {/* ---- 喙 ---- */}
      <path d="M196 60 L207 63 L196 66 Z" fill="#D4922A" />

      {/* ---- 眼睛 ---- */}
      <circle cx="186" cy="56" r="5.5" fill="white" />
      <circle cx="187" cy="56" r="3.2" fill="#2D2D2D" />
      <circle cx="186" cy="54.5" r="1.2" fill="white" />

      {/* ---- 腿 ---- */}
      <rect x="108" y="130" width="9" height="13" rx="4.5" fill="#D4922A" />
      <rect x="128" y="130" width="9" height="13" rx="4.5" fill="#D4922A" />

      {/* ---- 爪子 ---- */}
      <path d="M100 143 L110 143 M104 140 L110 143" stroke="#D4922A" strokeWidth="3" strokeLinecap="round" />
      <path d="M120 143 L130 143 M124 140 L130 143" stroke="#D4922A" strokeWidth="3" strokeLinecap="round" />

      {/* ---- 身体高光 ---- */}
      <ellipse cx="110" cy="88" rx="45" ry="20" fill="rgba(255,255,255,0.10)" />
    </svg>
  );
};

export default HenGraphic;
