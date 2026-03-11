import { useEffect } from 'react';
import type { ReactNode } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer: ReactNode;
}

export default function Sheet({ open, onClose, title, children, footer }: Props) {
  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(44,32,24,.4)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
    >
      <div style={{
        background: '#FAF6F2',
        borderRadius: '32px 32px 0 0',
        width: '100%', maxWidth: 540,
        paddingBottom: 'env(safe-area-inset-bottom, 16px)',
        maxHeight: '93vh',
        display: 'flex', flexDirection: 'column',
        animation: 'sheetUp .3s cubic-bezier(.34,1.06,.64,1)',
      }}>
        {/* Grab handle */}
        <div style={{
          width: 40, height: 5, background: 'var(--bg2)',
          borderRadius: 3, margin: '12px auto 0', flexShrink: 0,
        }} />

        {/* Title */}
        <h2 style={{
          fontSize: 18, fontWeight: 800, textAlign: 'center',
          padding: '14px 20px 4px', color: 'var(--t1)',
          letterSpacing: '-.5px', flexShrink: 0,
        }}>
          {title}
        </h2>

        {/* Body */}
        <div style={{
          flex: 1, overflowY: 'auto',
          padding: '16px 20px',
          WebkitOverflowScrolling: 'touch' as never,
        }}>
          {children}
        </div>

        {/* Footer */}
        <div style={{ padding: '8px 20px 14px', flexShrink: 0 }}>
          {footer}
        </div>
      </div>
    </div>
  );
}
