import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ModuleNav from './ModuleNav';
import { useAuth } from '../auth/AuthContext';

// Lazy import module roots — keeps each module's chunk separate
import EggsModule  from '../modules/eggs/EggsModule';
import GardenModule from '../modules/garden/GardenModule';

export type ModuleId = 'eggs' | 'garden';

const MODULES: { id: ModuleId; label: string; icon: string }[] = [
  { id: 'eggs',   label: '蛋蛋日记', icon: '🥚' },
  { id: 'garden', label: '菜园日记', icon: '🌿' },
];

const AppShell: React.FC = () => {
  const { logout } = useAuth();
  const [activeModule, setActiveModule] = useState<ModuleId>('eggs');

  // ── Swipe gesture state ─────────────────────────────────
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const SWIPE_THRESHOLD = 60; // px

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;

    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;

    // Only register horizontal swipes (ignore scroll attempts)
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dy) > Math.abs(dx) * 0.8) {
      touchStartX.current = null;
      return;
    }

    if (dx < 0 && activeModule === 'eggs') {
      setActiveModule('garden');
    } else if (dx > 0 && activeModule === 'garden') {
      setActiveModule('eggs');
    }

    touchStartX.current = null;
    touchStartY.current = null;
  }, [activeModule]);

  const moduleIndex = activeModule === 'eggs' ? 0 : 1;

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg)',
      overflow: 'hidden',
    }}>
      {/* ── Module Switcher Header ── */}
      <ModuleNav
        modules={MODULES}
        active={activeModule}
        onSwitch={setActiveModule}
        onLogout={logout}
      />

      {/* ── Swipeable Content Area ── */}
      <div
        style={{ flex: 1, overflow: 'hidden', position: 'relative' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Slide container: both modules live side-by-side */}
        <div style={{
          display: 'flex',
          width: '200%',
          height: '100%',
          transform: `translateX(${moduleIndex === 0 ? '0%' : '-50%'})`,
          transition: 'transform 0.38s cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'transform',
        }}>
          {/* Pane 0: Eggs */}
          <div style={{ width: '50%', flexShrink: 0, height: '100%', overflow: 'hidden' }}>
            <EggsModule isActive={activeModule === 'eggs'} />
          </div>

          {/* Pane 1: Garden */}
          <div style={{ width: '50%', flexShrink: 0, height: '100%', overflow: 'hidden' }}>
            <GardenModule isActive={activeModule === 'garden'} />
          </div>
        </div>

        {/* ── Swipe hint dots ── */}
        <div style={{
          position: 'absolute',
          bottom: 'calc(var(--tab-h) + var(--safe-b) + 10px)',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 6,
          zIndex: 50,
          pointerEvents: 'none',
        }}>
          {MODULES.map((m, i) => (
            <div key={m.id} style={{
              width:  i === moduleIndex ? 18 : 6,
              height: 6,
              borderRadius: 3,
              background: i === moduleIndex ? 'var(--acc)' : 'var(--t4)',
              transition: 'all 0.3s ease',
            }} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AppShell;
