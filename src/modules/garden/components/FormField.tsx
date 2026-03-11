import type { ReactNode } from 'react';

interface Props {
  label: string;
  children: ReactNode;
  row?: boolean;
}

const fieldStyle: React.CSSProperties = {
  width: '100%', padding: '13px 15px',
  background: 'var(--card)', border: 'none',
  borderRadius: 'var(--r-sm)',
  fontFamily: 'var(--ff)', fontSize: 15,
  color: 'var(--t1)', outline: 'none',
  boxShadow: 'var(--sh)',
  WebkitAppearance: 'none' as never,
};

export const inputStyle = fieldStyle;

export function FormField({ label, children, row }: Props) {
  return (
    <div style={{ marginBottom: 14, ...(row ? {} : {}) }}>
      <label style={{
        display: 'block', fontSize: 11, fontWeight: 700,
        letterSpacing: '.09em', textTransform: 'uppercase',
        color: 'var(--t3)', marginBottom: 7,
      }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export function BtnRow({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      {children}
    </div>
  );
}

interface BtnProps {
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  color?: string;
  children: ReactNode;
  type?: 'button' | 'submit';
}

export function Btn({ onClick, variant = 'primary', color, children, type = 'button' }: BtnProps) {
  const base: React.CSSProperties = {
    width: '100%', padding: '15px',
    borderRadius: 'var(--r-md)',
    fontSize: 16, fontWeight: 700,
    border: 'none', cursor: 'pointer',
    letterSpacing: '-.3px',
    transition: 'opacity .15s, transform .12s',
    fontFamily: 'var(--ff)',
  };
  const styles: Record<string, React.CSSProperties> = {
    primary:   { background: color ?? 'var(--acc)', color: '#fff', boxShadow: '0 4px 20px rgba(200,132,90,.35)' },
    secondary: { background: 'var(--card)', color: 'var(--t2)', boxShadow: 'var(--sh)' },
    danger:    { background: 'var(--card)', color: 'var(--red)', boxShadow: 'var(--sh)' },
  };
  return (
    <button type={type} onClick={onClick} style={{ ...base, ...styles[variant] }}
      onTouchStart={e => { e.currentTarget.style.opacity = '.72'; e.currentTarget.style.transform = 'scale(.98)'; }}
      onTouchEnd={e   => { e.currentTarget.style.opacity = '1';   e.currentTarget.style.transform = 'scale(1)'; }}
    >
      {children}
    </button>
  );
}
