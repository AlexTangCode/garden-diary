import React from 'react';
import { Home, BarChart3, Wallet, Users, Utensils } from 'lucide-react';
import { EggsView } from '@/types/eggs';
import { motion } from 'framer-motion';

interface NavigationProps {
  currentView: EggsView;
  onViewChange: (view: EggsView) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange }) => {
  const tabs = [
    { id: EggsView.HOME,       label: '首页', icon: Home },
    { id: EggsView.STATISTICS, label: '统计', icon: BarChart3 },
    { id: EggsView.GUIDE,      label: '吃蛋', icon: Utensils },
    { id: EggsView.FINANCE,    label: '支出', icon: Wallet },
    { id: EggsView.HENS,       label: '鸡群', icon: Users },
  ];

  return (
    <div style={{
      width: '100%',
      background: 'var(--bg)',
      paddingBottom: 'var(--safe-b)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',          /* vertically centre the pill */
      paddingTop: 8,
      paddingLeft: 16,
      paddingRight: 16,
      height: 'var(--tab-h)',
      flexShrink: 0,
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: '100%',
        maxWidth: 420,
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: 40,
        border: '1px solid rgba(255,255,255,0.4)',
        boxShadow: '0 6px 28px rgba(44,32,24,.11)',
        height: 52,
        padding: '0 4px',
      }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onViewChange(tab.id)}
              style={{
                flex: 1, height: 44,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 3, position: 'relative', borderRadius: 32,
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="eggs-nav-bg"
                  style={{
                    position: 'absolute', inset: '0 2px',
                    background: 'rgba(200,132,90,0.1)',
                    borderRadius: 32, zIndex: 0,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <div style={{
                color: isActive ? 'var(--acc)' : 'var(--t3)',
                transition: 'color 0.2s', position: 'relative', zIndex: 1,
              }}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span style={{
                fontSize: 9, fontWeight: 700, letterSpacing: '0.05em',
                color: isActive ? 'var(--acc)' : 'var(--t3)',
                position: 'relative', zIndex: 1,
              }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Navigation;
