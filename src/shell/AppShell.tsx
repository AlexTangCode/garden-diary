import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import ModuleNav from './ModuleNav';
import { useAuth } from '../auth/AuthContext';
import EggsModule   from '../modules/eggs/EggsModule';
import GardenModule from '../modules/garden/GardenModule';

export type ModuleId = 'eggs' | 'garden';

const MODULES: { id: ModuleId; label: string; icon: string }[] = [
  { id: 'eggs',   label: '蛋蛋日记', icon: '🥚' },
  { id: 'garden', label: '菜园日记', icon: '🌿' },
];

const AppShell: React.FC = () => {
  const { logout } = useAuth();
  const [activeModule, setActiveModule] = useState<ModuleId>('eggs');

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;
    if (Math.abs(dx) < 60 || Math.abs(dy) > Math.abs(dx) * 0.8) return;
    if (dx < 0 && activeModule === 'eggs')   setActiveModule('garden');
    if (dx > 0 && activeModule === 'garden') setActiveModule('eggs');
  }, [activeModule]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg)',
      overflow: 'hidden',
    }}>
      {/* ── ONE global top nav ── */}
      <ModuleNav
        modules={MODULES}
        active={activeModule}
        onSwitch={setActiveModule}
        onLogout={logout}
      />

      {/* ── Content area ── */}
      <div
        style={{ flex: 1, overflow: 'hidden', position: 'relative' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Conditionally render — inactive module is fully unmounted */}
        {activeModule === 'eggs' ? (
          <motion.div
            key="eggs"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            style={{ position: 'absolute', inset: 0 }}
          >
            <EggsModule isActive={true} />
          </motion.div>
        ) : (
          <motion.div
            key="garden"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.25 }}
            style={{ position: 'absolute', inset: 0 }}
          >
            <GardenModule isActive={true} />
          </motion.div>
        )}
      </div>

      {/* ── Swipe indicator dots ── */}
      <div style={{
        position: 'absolute',
        bottom: 'calc(var(--tab-h) + 8px)',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 5,
        zIndex: 200,
        pointerEvents: 'none',
      }}>
        {MODULES.map((m) => (
          <div key={m.id} style={{
            width:  m.id === activeModule ? 16 : 5,
            height: 5,
            borderRadius: 3,
            background: m.id === activeModule ? 'var(--acc)' : 'var(--t4)',
            transition: 'all 0.3s ease',
          }} />
        ))}
      </div>
    </div>
  );
};

export default AppShell;
