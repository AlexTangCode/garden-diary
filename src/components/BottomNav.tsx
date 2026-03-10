import type { PageId } from '../types';

const ITEMS: { id: PageId; icon: string; label: string }[] = [
  { id: 'map',     icon: '🏡', label: '地图'  },
  { id: 'harvest', icon: '🧺', label: '采摘'  },
  { id: 'spend',   icon: '📒', label: '支出'  },
  { id: 'stats',   icon: '📊', label: '统计'  },
];

interface Props {
  page: PageId;
  onNav: (p: PageId) => void;
}

export default function BottomNav({ page, onNav }: Props) {
  return (
    <div style={{
      flexShrink: 0,
      height: 'calc(88px + var(--safe-b))',
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
        padding: '10px 8px',
        width: 'calc(100% - 32px)',
        maxWidth: 400,
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
                gap: 4,
                padding: '4px 14px',
                position: 'relative',
                transition: 'opacity .15s',
              }}
            >
              <span style={{
                fontSize: 22,
                lineHeight: 1,
                display: 'block',
                transform: active ? 'scale(1.1)' : 'scale(1)',
                transition: 'transform .18s',
              }}>
                {item.icon}
              </span>
              <span style={{
                fontSize: 11,
                fontWeight: active ? 700 : 500,
                color: active ? 'var(--acc)' : 'var(--t3)',
                letterSpacing: '0.02em',
                transition: 'color .18s',
              }}>
                {item.label}
              </span>
              {active && (
                <span style={{
                  position: 'absolute',
                  bottom: -2,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: 'var(--acc)',
                }} />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
