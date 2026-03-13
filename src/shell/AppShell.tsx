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

  const navRef      = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  const handleNavTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleNavTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 50) return;
    if (dx < 0 && activeModule === 'eggs')   setActiveModule('garden');
    if (dx > 0 && activeModule === 'garden') setActiveModule('eggs');
  }, [activeModule]);

  // 下载按钮通过自定义事件通知 HomeView 打开 PosterModal
  const handleDownload = useCallback(() => {
    document.dispatchEvent(new CustomEvent('eggs-open-poster'));
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0,
      overflow: 'hidden',
    }}>
      {/* 全屏内容区 */}
      <div style={{ position: 'absolute', inset: 0 }}>
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

      {/* 悬浮顶部导航（滑动手势监听区） */}
      <div
        ref={navRef}
        onTouchStart={handleNavTouchStart}
        onTouchEnd={handleNavTouchEnd}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 200 }}
      >
        <ModuleNav
          modules={MODULES}
          active={activeModule}
          onSwitch={setActiveModule}
          onLogout={logout}
          onDownload={handleDownload}
        />
      </div>
    </div>
  );
};

export default AppShell;
