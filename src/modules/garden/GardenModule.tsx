import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Info } from 'lucide-react';
import type { Plot, Marker, HarvestLog, SpendLog, GardenPageId } from '@/types/garden';
import { subscribePlots, subscribeMarkers, subscribeHarvests, subscribeSpends } from '@/services/garden.firebase';
import MapView        from './views/MapView';
import HarvestView    from './views/HarvestView';
import SpendView      from './views/SpendView';
import StatsView      from './views/StatsView';
import MarkersListView from './views/MarkersListView';
import BottomNav      from './components/BottomNav';
import Header         from './components/Header';

interface Props { isActive: boolean; }

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
      position: 'absolute', inset: 0,
      overflow: 'hidden',
    }}>
      {/* Header — sits below the floating ModuleNav (60px clearance) */}
      {page !== 'map' && (
        <div style={{ position: 'absolute', top: 60, left: 0, right: 0, zIndex: 10 }}>
          <Header page={page} onAction={() => {
            document.dispatchEvent(new CustomEvent('hdr-action'));
          }} />
        </div>
      )}

      {/* Page content — pushed below ModuleNav + Header (or just ModuleNav for map) */}
      <div style={{
        position: 'absolute',
        top: page === 'map' ? 60 : 116,   /* 60 ModuleNav + 56 Header */
        left: 0, right: 0,
        bottom: 0,
        overflow: 'hidden',
      }}>
        {renderPage()}
      </div>

      {/* Floating nav — no background, hovers over content */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10 }}>
        <BottomNav page={page} onNav={setPage} />
      </div>

      {/* Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
              position: 'absolute',
              bottom: 'calc(var(--tab-h) + 12px)',
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

export default GardenModule;
