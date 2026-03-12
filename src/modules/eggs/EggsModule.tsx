import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Info } from 'lucide-react';
import { EggsView, Hen, EggLog, Expense } from '@/types/eggs';
import { getHens, getEggLogs, getExpenses } from '@/services/eggs.firebase';
import HomeView       from './views/HomeView';
import StatisticsView from './views/StatisticsView';
import FinanceView    from './views/FinanceView';
import HensView       from './views/HensView';
import GuideView      from './views/GuideView';
import Navigation     from './components/Navigation';

interface Props { isActive: boolean; }

const EggsModule: React.FC<Props> = ({ isActive }) => {
  const [currentView, setCurrentView] = useState<EggsView>(EggsView.HOME);
  const [hens,     setHens]     = useState<Hen[]>([]);
  const [logs,     setLogs]     = useState<EggLog[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showNotification = useCallback((message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const refreshData = useCallback(async () => {
    try {
      const [h, l, e] = await Promise.all([getHens(), getEggLogs(), getExpenses()]);
      setHens(h); setLogs(l); setExpenses(e);
    } catch (err) {
      console.error('[EggsModule] refreshData error', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refreshData(); }, [refreshData]);

  if (loading) {
    return (
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg)',
      }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🥚</div>
        <p style={{ color: 'var(--t3)', fontWeight: 600, fontSize: 14 }}>加载中…</p>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case EggsView.HOME:
        return <HomeView hens={hens} logs={logs} onRefresh={refreshData} onNotify={showNotification} onNavigate={setCurrentView} />;
      case EggsView.STATISTICS:
        return <StatisticsView hens={hens} logs={logs} expenses={expenses} onRefresh={refreshData} />;
      case EggsView.FINANCE:
        return <FinanceView expenses={expenses} onRefresh={refreshData} onNotify={showNotification} />;
      case EggsView.HENS:
        return <HensView hens={hens} onRefresh={refreshData} onNotify={showNotification} />;
      case EggsView.GUIDE:
        return <GuideView onNotify={showNotification} />;
      default:
        return <HomeView hens={hens} logs={logs} onRefresh={refreshData} onNotify={showNotification} onNavigate={setCurrentView} />;
    }
  };

  return (
    /* Fill the pane completely — no background here so nav bottom gap is transparent */
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Scrollable view content */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative', background: 'var(--bg)' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            style={{ position: 'absolute', inset: 0, overflowY: 'auto' }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom tab nav — pinned to bottom of THIS pane only */}
      <div style={{ flexShrink: 0, zIndex: 10, position: 'relative', background: 'linear-gradient(to bottom, transparent 0%, var(--bg) 35%)' }}>
        <Navigation
          currentView={currentView}
          onViewChange={v => { setCurrentView(v); refreshData(); }}
        />
      </div>

      {/* Toast notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
              position: 'absolute',
              bottom: 'calc(var(--tab-h) + var(--safe-b) + 12px)',
              left: '50%', transform: 'translateX(-50%)',
              zIndex: 200, width: '85%', maxWidth: 300,
            }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '14px 18px', borderRadius: 'var(--r-xl)',
              boxShadow: 'var(--sh3)',
              background: notification.type === 'success' ? 'var(--acc)' : 'var(--t1)',
              color: '#fff', fontSize: 13, fontWeight: 700,
            }}>
              {notification.type === 'success' ? <CheckCircle size={16} /> : <Info size={16} />}
              {notification.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EggsModule;
