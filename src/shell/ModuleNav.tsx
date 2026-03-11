import React from 'react';
import { motion } from 'framer-motion';
import type { ModuleId } from './AppShell';
import { LogOut } from 'lucide-react';

interface Module { id: ModuleId; label: string; icon: string }
interface Props {
  modules: Module[];
  active: ModuleId;
  onSwitch: (id: ModuleId) => void;
  onLogout: () => void;
}

const ModuleNav: React.FC<Props> = ({ modules, active, onSwitch, onLogout }) => {
  return (
    <div style={{
      flexShrink: 0,
      paddingTop: 'var(--safe-t)',
      background: 'var(--card)',
      boxShadow: 'var(--sh)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 'calc(var(--safe-t) + 10px) 16px 10px',
      zIndex: 100,
    }}>
      {/* App title */}
      <span style={{
        fontSize: 13,
        fontWeight: 800,
        color: 'var(--t1)',
        letterSpacing: '-0.2px',
        whiteSpace: 'nowrap',
      }}>
        🏡 Chloe's Backyard
      </span>

      {/* Module pill switcher — slimmer */}
      <div style={{
        display: 'flex',
        background: 'var(--bg)',
        borderRadius: 999,
        padding: 3,
        gap: 2,
        position: 'relative',
        boxShadow: 'inset 0 1px 3px rgba(44,32,24,.08)',
      }}>
        {modules.map(m => {
          const isActive = m.id === active;
          return (
            <button
              key={m.id}
              onClick={() => onSwitch(m.id)}
              style={{
                position: 'relative',
                padding: '5px 12px',        /* ← slimmer padding */
                borderRadius: 999,
                fontSize: 12,               /* ← smaller font */
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#fff' : 'var(--t2)',
                transition: 'color 0.2s',
                zIndex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                whiteSpace: 'nowrap',
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="module-pill"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'var(--acc)',
                    borderRadius: 999,
                    boxShadow: '0 2px 8px rgba(200,132,90,0.35)',
                    zIndex: -1,
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                />
              )}
              <span style={{ fontSize: 13 }}>{m.icon}</span>
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Logout */}
      <button
        onClick={onLogout}
        title="退出登录"
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--t3)',
          transition: 'color 0.15s, background 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg2)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        <LogOut size={15} strokeWidth={2} />
      </button>
    </div>
  );
};

export default ModuleNav;
