import React from 'react';
import { motion } from 'framer-motion';
import type { ModuleId } from './AppShell';
import { Egg, Leaf, LogOut, Download } from 'lucide-react';

interface Module { id: ModuleId; label: string; icon: string }
interface Props {
  modules: Module[];
  active: ModuleId;
  onSwitch: (id: ModuleId) => void;
  onLogout: () => void;
  onDownload?: () => void;
}

const BTN_STYLE: React.CSSProperties = {
  width: 36, height: 36,
  borderRadius: '50%',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: 'var(--t3)',
  background: 'rgba(255,255,255,0.82)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  boxShadow: '0 4px 20px rgba(44,32,24,.12)',
  border: '1px solid rgba(255,255,255,0.5)',
  pointerEvents: 'auto',
};

const ModuleNav: React.FC<Props> = ({ modules, active, onSwitch, onLogout, onDownload }) => {
  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, right: 0,
      zIndex: 200,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'calc(var(--safe-t) + 12px) 16px 0',
      pointerEvents: 'none',
    }}>

      {/* 左上角：下载按钮（仅 eggs 模块显示） */}
      {active === 'eggs' && onDownload && (
        <button
          onClick={onDownload}
          title="下载本周战报"
          style={{ ...BTN_STYLE, position: 'absolute', left: 16, top: 'calc(var(--safe-t) + 12px)' }}
        >
          <Download size={15} strokeWidth={2} />
        </button>
      )}

      {/* 中间模块切换胶囊 */}
      <div style={{
        display: 'flex',
        background: 'rgba(255,255,255,0.82)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: 999,
        padding: 3,
        gap: 4,
        boxShadow: '0 4px 20px rgba(44,32,24,.12)',
        border: '1px solid rgba(255,255,255,0.5)',
        pointerEvents: 'auto',
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

      {/* 右上角：退出按钮 */}
      <button
        onClick={onLogout}
        title="退出登录"
        style={{ ...BTN_STYLE, position: 'absolute', right: 16, top: 'calc(var(--safe-t) + 12px)' }}
      >
        <LogOut size={15} strokeWidth={2} />
      </button>
    </div>
  );
};

export default ModuleNav;
