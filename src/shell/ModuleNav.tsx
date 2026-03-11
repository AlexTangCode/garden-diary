import React from 'react';
import { motion } from 'framer-motion';
import type { ModuleId } from './AppShell';
import { Egg, Leaf, LogOut } from 'lucide-react';

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
      background: 'var(--card)',
      boxShadow: 'var(--sh)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 'calc(var(--safe-t) + 8px) 16px 8px',
      zIndex: 100,
    }}>
      {/* App title */}
      <span style={{
        fontSize: 13, fontWeight: 800,
        color: 'var(--t1)', letterSpacing: '-0.2px', whiteSpace: 'nowrap',
      }}>
        🏡 Chloe's Backyard
      </span>

      {/* Icon-only pill switcher */}
      <div style={{
        display: 'flex',
        background: 'var(--bg)',
        borderRadius: 999,
        padding: 3,
        gap: 4,
        boxShadow: 'inset 0 1px 3px rgba(44,32,24,.08)',
      }}>
        {modules.map(m => {
          const isActive = m.id === active;
          const Icon = m.id === 'eggs' ? Egg : Leaf;
          return (
            <button
              key={m.id}
              onClick={() => onSwitch(m.id)}
              title={m.label}
              style={{
                position: 'relative',
                width: 36, height: 36,
                borderRadius: 999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isActive ? '#fff' : 'var(--t3)',
                transition: 'color 0.2s',
                zIndex: 1,
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="module-pill"
                  style={{
                    position: 'absolute', inset: 0,
                    background: 'var(--acc)',
                    borderRadius: 999,
                    boxShadow: '0 2px 8px rgba(200,132,90,0.4)',
                    zIndex: -1,
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                />
              )}
              <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
            </button>
          );
        })}
      </div>

      {/* Logout */}
      <button
        onClick={onLogout}
        title="退出登录"
        style={{
          width: 32, height: 32, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--t3)', transition: 'color 0.15s, background 0.15s',
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
