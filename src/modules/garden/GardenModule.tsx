import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Info } from 'lucide-react';
import type { Plot, Marker, HarvestLog, SpendLog, GardenPageId } from '../../types/garden';
import {
  subscribePlots, subscribeMarkers,
  subscribeHarvests, subscribeSpends,
} from '../../services/garden.firebase';

// ── Views (copy your existing garden-diary views into modules/garden/views/) ──
// Imports will resolve once you migrate files in Phase 2.
import MapView     from './views/MapView';
import HarvestView from './views/HarvestView';
import SpendView   from './views/SpendView';
import StatsView   from './views/StatsView';
import MarkersListView from './views/MarkersListView';
import BottomNav   from './components/BottomNav';
import Header      from './components/Header';

interface Props {
  /** True when this module pane is the visible one */
  isActive: boolean;
}

const GardenModule: React.FC<Props> = ({ isActive }) => {
  const [page,     setPage]     = useState<GardenPageId>('map');
  const [plots,    setPlots]    = useState<Plot[]>([]);
  const [markers,  setMarkers]  = useState<Marker[]>([]);
  const [harvests, setHarvests] = useState<HarvestLog[]>([]);
  const [spends,   setSpends]   = useState<SpendLog[]>([]);
  const [curPlot,  setCurPlot]  = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // ── Real-time Firestore subscriptions ───────────────────
  useEffect(() => {
    const unsubs = [
      subscribePlots(data => {
        setPlots(data);
        setCurPlot(prev => {
          if (prev && data.find(p => p.id === prev)) return prev;
          return data.length ? data[0].id : null;
        });
      }),
      subscribeMarkers(setMarkers),
      subscribeHarvests(setHarvests),
      subscribeSpends(setSpends),
    ];
    return () => unsubs.forEach(fn => fn());
  }, []);

  const sharedProps = { plots, markers, harvests, spends, curPlot, setCurPlot };

  const renderPage = () => {
    switch (page) {
      case 'map':     return <MapView     {...sharedProps} />;
      case 'harvest': return <HarvestView {...sharedProps} />;
      case 'spend':   return <SpendView   {...sharedProps} />;
      case 'stats':   return <StatsView   {...sharedProps} />;
      case 'markers': return <MarkersListView markers={markers} plots={plots} />;
      default:        return <MapView {...sharedProps} />;
    }
  };

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg)',
      overflow: 'hidden',
    }}>
      <Header page={page} onAction={() => {
        document.dispatchEvent(new CustomEvent('hdr-action'));
      }} />

      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {renderPage()}
      </div>

      <BottomNav page={page} onNav={setPage} />

      {/* Notification toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
              position: 'absolute',
              bottom: 'calc(var(--tab-h) + var(--safe-b) + 12px)',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 200,
              width: '85%',
              maxWidth: 300,
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '14px 18px',
              borderRadius: 'var(--r-xl)',
              boxShadow: 'var(--sh3)',
              background: notification.type === 'success' ? 'var(--acc)' : 'var(--t1)',
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
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

export default GardenModule;
