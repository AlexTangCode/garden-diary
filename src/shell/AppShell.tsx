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

  // ── Swipe only registers on the ModuleNav bar itself ──
  // We expose a ref to the nav bar and only start tracking if touch
  // begins inside it.
  const navRef        = useRef<HTMLDivElement>(null);
  const touchStartX   = useRef<number | null>(null);
  const touchOriginEl = useRef<EventTarget | null>(null);

  const handleNavTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current   = e.touches[0].clientX;
    touchOriginEl.current = e.target;
  }, []);

  const handleNavTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current   = null;
    touchOriginEl.current = null;
    if (Math.abs(dx) < 50) return;
    if (dx < 0 && activeModule === 'eggs')   setActiveModule('garden');
    if (dx > 0 && activeModule === 'garden') setActiveModule('eggs');
  }, [activeModule]);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      display: 'flex', flexDirection: 'column',
      background: 'var(--bg)', overflow: 'hidden',
    }}>
      {/* ── Top nav: swipe HERE to switch modules ── */}
      <div
        ref={navRef}
        onTouchStart={handleNavTouchStart}
        onTouchEnd={handleNavTouchEnd}
      >
        <ModuleNav
          modules={MODULES}
          active={activeModule}
          onSwitch={setActiveModule}
          onLogout={logout}
        />
      </div>

      {/* ── Content: NO swipe listener here — preserves inner scrolls & gestures ── */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative', minHeight: 0 }}>
        {activeModule === 'eggs' ? (
          <motion.div
            key="eggs"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.22 }}
            style={{ position: 'absolute', inset: 0 }}
          >
            <EggsModule isActive={true} />
          </motion.div>
        ) : (
          <motion.div
            key="garden"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.22 }}
            style={{ position: 'absolute', inset: 0 }}
          >
            <GardenModule isActive={true} />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AppShell;
