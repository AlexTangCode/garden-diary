import type { PageId } from '../types';

const TITLES: Record<PageId, string> = {
  map:     '菜 园 日 记',
  harvest: '采 摘 记 录',
  spend:   '支 出 账 本',
  stats:   '数 据 统 计',
};

const SHOW_BTN: Record<PageId, boolean> = {
  map: true, harvest: true, spend: true, stats: false,
};

interface Props {
  page: PageId;
  onAction: () => void;
}

export default function Header({ page, onAction }: Props) {
  return (
    <header style={{
      flexShrink: 0,
      padding: '20px 24px 6px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      background: 'var(--bg)',
    }}>
      <h1 style={{
        fontSize: 22,
        fontWeight: 700,
        letterSpacing: '0.08em',
        color: 'var(--acc)',
        fontStyle: 'italic',
        textAlign: 'center',
        flex: 1,
        lineHeight: 1.2,
      }}>
        {TITLES[page]}
      </h1>

      {SHOW_BTN[page] && (
        <button
          onClick={onAction}
          style={{
            position: 'absolute',
            right: 20,
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'var(--card)',
            boxShadow: 'var(--sh)',
            color: 'var(--acc)',
            fontSize: 22,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform .14s, opacity .14s',
          }}
          onTouchStart={e => (e.currentTarget.style.transform = 'scale(.92)')}
          onTouchEnd={e   => (e.currentTarget.style.transform = 'scale(1)')}
        >
          ＋
        </button>
      )}
    </header>
  );
}
