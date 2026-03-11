import React from 'react';
import type { GardenPageId } from '../../../types/garden';
import { Plus } from 'lucide-react';

const PAGE_META: Record<GardenPageId, { title: string; emoji: string; actionLabel?: string }> = {
  map:     { title: '菜地地图', emoji: '🗺️', actionLabel: '新菜地' },
  harvest: { title: '采摘记录', emoji: '🧺', actionLabel: '记录采摘' },
  spend:   { title: '支出账本', emoji: '📒', actionLabel: '记录支出' },
  stats:   { title: '数据统计', emoji: '📊' },
  markers: { title: '蔬菜标注', emoji: '📍', actionLabel: '添加标注' },
};

interface Props {
  page: GardenPageId;
  onAction: () => void;
}

export default function Header({ page, onAction }: Props) {
  const meta = PAGE_META[page];

  return (
    <div style={{
      flexShrink: 0,
      padding: '14px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'var(--bg)',
      borderBottom: '1px solid var(--bg2)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 20 }}>{meta.emoji}</span>
        <span style={{
          fontSize: 17,
          fontWeight: 700,
          color: 'var(--t1)',
          letterSpacing: '-0.2px',
        }}>
          {meta.title}
        </span>
      </div>

      {meta.actionLabel && (
        <button
          onClick={onAction}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '8px 14px',
            background: 'var(--acc)',
            color: '#fff',
            borderRadius: 'var(--r-xl)',
            fontSize: 13,
            fontWeight: 700,
            boxShadow: '0 3px 10px rgba(200,132,90,0.3)',
          }}
        >
          <Plus size={14} strokeWidth={2.5} />
          {meta.actionLabel}
        </button>
      )}
    </div>
  );
}
