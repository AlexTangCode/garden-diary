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
      flexShrink: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '10px 16px',
      paddingBottom: 'max(12px, var(--safe-b))',
      background: '#F9F5F0',
    }}>
      <div style={{
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
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onViewChange(tab.id)}
              style={{
                flex: 1, height: 56,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 4, position: 'relative', borderRadius: 999,
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="eggs-nav-bg"
                  style={{
                    position: 'absolute', inset: '0 2px',
                    background: 'rgba(200,132,90,0.12)',
                    borderRadius: 999, zIndex: 0,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <div style={{ color: isActive ? 'var(--acc)' : 'var(--t3)', transition: 'color 0.2s', position: 'relative', zIndex: 1 }}>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.04em', color: isActive ? 'var(--acc)' : 'var(--t3)', position: 'relative', zIndex: 1 }}>
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
