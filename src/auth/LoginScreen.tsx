import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './AuthContext';

const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError]       = useState(false);
  const [shaking, setShaking]   = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus after mount animation
    const t = setTimeout(() => inputRef.current?.focus(), 600);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = () => {
    const ok = login(password);
    if (!ok) {
      setError(true);
      setShaking(true);
      setPassword('');
      setTimeout(() => setShaking(false), 500);
      setTimeout(() => setError(false), 2500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div style={{
      height: '100%',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 32px',
    }}>
      {/* ── Brand mark ── */}
      <motion.div
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        style={{ textAlign: 'center', marginBottom: 48 }}
      >
        <div style={{ fontSize: 56, marginBottom: 16, lineHeight: 1 }}>🏡</div>
        <h1 style={{
          fontSize: 28,
          fontWeight: 800,
          color: 'var(--t1)',
          letterSpacing: '-0.5px',
          marginBottom: 6,
        }}>
          Chloe's Backyard
        </h1>
        <p style={{ fontSize: 14, color: 'var(--t3)', fontWeight: 500 }}>
          家庭后院管理系统
        </p>
      </motion.div>

      {/* ── Login card ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
        style={{
          background: 'var(--card)',
          borderRadius: 'var(--r-xl)',
          padding: '36px 28px',
          width: '100%',
          maxWidth: 360,
          boxShadow: 'var(--sh2)',
        }}
      >
        <p style={{
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--t2)',
          marginBottom: 16,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}>
          访问密码
        </p>

        {/* Input */}
        <motion.div
          animate={shaking ? {
            x: [0, -10, 10, -8, 8, -4, 4, 0],
            transition: { duration: 0.45 }
          } : { x: 0 }}
        >
          <input
            ref={inputRef}
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入密码…"
            style={{
              width: '100%',
              padding: '16px 20px',
              fontSize: 16,
              fontFamily: 'var(--ff)',
              fontWeight: 600,
              color: 'var(--t1)',
              background: 'var(--bg)',
              border: `2px solid ${error ? 'var(--red)' : 'transparent'}`,
              borderRadius: 'var(--r-md)',
              outline: 'none',
              transition: 'border-color 0.2s',
              marginBottom: 12,
            }}
          />
        </motion.div>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                fontSize: 13,
                color: 'var(--red)',
                fontWeight: 600,
                marginBottom: 12,
                paddingLeft: 4,
              }}
            >
              密码错误，请重试
            </motion.p>
          )}
        </AnimatePresence>

        {/* Submit button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          style={{
            width: '100%',
            padding: '16px',
            fontSize: 15,
            fontWeight: 700,
            color: '#fff',
            background: 'var(--acc)',
            borderRadius: 'var(--r-md)',
            boxShadow: '0 6px 20px rgba(200,132,90,0.35)',
            transition: 'opacity 0.15s',
          }}
        >
          进入 →
        </motion.button>
      </motion.div>

      {/* ── Footer ── */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{
          marginTop: 40,
          fontSize: 12,
          color: 'var(--t4)',
          fontWeight: 500,
        }}
      >
        🥚 鸡蛋 · 🌿 菜园 · ❤️ 家
      </motion.p>
    </div>
  );
};

export default LoginScreen;
