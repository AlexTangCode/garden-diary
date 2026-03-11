import React from 'react';
import { motion } from 'framer-motion';
import type { GardenPageId } from '../../../types/garden';

const ITEMS: { id: GardenPageId; icon: string; label: string }[] = [
  { id: 'map',     icon: '🏡', label: '地图'  },
  { id: 'harvest', icon: '🧺', label: '采摘'  },
  { id: 'spend',   icon: '📒', label: '支出'  },
  { id: 'stats',   icon: '📊', label: '统计'  },
  { id: 'markers', icon: '📍', label: '标注'  },  // NEW: was embedded in MapView
];

interface Props {
  page: GardenPageId;
  onNav: (p: GardenPageId) => void;
}

export default function BottomNav({ page, onNav }: Props) {
  return (
    <div style={{
      flexShrink: 0,
      height: 'calc(var(--tab-h) + var(--safe-b))',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      paddingTop: 10,
      background: 'var(--bg)',
    }}>
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        background: 'var(--card)',
        borderRadius: 28,
        padding: '10px 4px',
        width: 'calc(100% - 32px)',
        maxWidth: 420,
        boxShadow: 'var(--sh2)',
      }}>
        {ITEMS.map(item => {
          const active = item.id === page;
          return (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                padding: '4px 10px',
                position: 'relative',
                flex: 1,
              }}
            >
              {active && (
                <motion.div
                  layoutId="garden-nav-bg"
                  style={{
                    position: 'absolute',
                    inset: '0 2px',
                    background: 'var(--acc-bg)',
                    borderRadius: 'var(--r-md)',
                    zIndex: 0,
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                />
              )}
              <span style={{
                fontSize: 20,
                lineHeight: 1,
                position: 'relative',
                zIndex: 1,
                transform: active ? 'scale(1.12)' : 'scale(1)',
                transition: 'transform .18s',
              }}>
                {item.icon}
              </span>
              <span style={{
                fontSize: 10,
                fontWeight: active ? 700 : 500,
                color: active ? 'var(--acc)' : 'var(--t3)',
                letterSpacing: '0.02em',
                position: 'relative',
                zIndex: 1,
                transition: 'color .18s',
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
