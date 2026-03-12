import React from 'react';
import { motion } from 'framer-motion';
import { Home, Leaf, BookOpen, BarChart3, MapPin } from 'lucide-react';
import type { GardenPageId } from '@/types/garden';

const ITEMS: { id: GardenPageId; icon: React.ElementType; label: string }[] = [
  { id: 'map',     icon: Home,      label: '地图' },
  { id: 'harvest', icon: Leaf,      label: '采摘' },
  { id: 'spend',   icon: BookOpen,  label: '支出' },
  { id: 'stats',   icon: BarChart3, label: '统计' },
  { id: 'markers', icon: MapPin,    label: '标注' },
];

interface Props {
  page: GardenPageId;
  onNav: (p: GardenPageId) => void;
}

export default function BottomNav({ page, onNav }: Props) {
  return (
    /* Outer wrapper: same padding structure as eggs Navigation */
    <div style={{
      width: '100%',
      background: 'var(--bg)',
      flexShrink: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '12px 16px calc(16px + var(--safe-b))',
    }}>
      {/* Pill */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: '100%',
        maxWidth: 440,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: 999,
        border: '1px solid rgba(255,255,255,0.5)',
        boxShadow: '0 8px 32px rgba(44,32,24,.13)',
        height: 64,
        padding: '0 6px',
      }}>
        {ITEMS.map(item => {
          const Icon = item.icon;
          const active = item.id === page;
          return (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              style={{
                flex: 1, height: 56,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 4, position: 'relative', borderRadius: 999,
              }}
            >
              {active && (
                <motion.div
                  layoutId="garden-nav-bg"
                  style={{
                    position: 'absolute', inset: '0 2px',
                    background: 'rgba(200,132,90,0.12)',
                    borderRadius: 999, zIndex: 0,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <div style={{
                color: active ? 'var(--acc)' : 'var(--t3)',
                transition: 'color 0.2s', position: 'relative', zIndex: 1,
              }}>
                <Icon size={22} strokeWidth={active ? 2.5 : 2} />
              </div>
              <span style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '0.04em',
                color: active ? 'var(--acc)' : 'var(--t3)',
                position: 'relative', zIndex: 1,
              }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
