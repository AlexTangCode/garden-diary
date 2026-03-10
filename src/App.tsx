import { useState, useEffect } from 'react';
import type { Plot, Marker, HarvestLog, SpendLog, PageId } from './types';
import {
  subscribePlots, subscribeMarkers, subscribeHarvests, subscribeSpends,
} from './services/firebase';
import BottomNav   from './components/BottomNav';
import Header      from './components/Header';
import MapView     from './views/MapView';
import HarvestView from './views/HarvestView';
import SpendView   from './views/SpendView';
import StatsView   from './views/StatsView';

export default function App() {
  const [page,     setPage]     = useState<PageId>('map');
  const [plots,    setPlots]    = useState<Plot[]>([]);
  const [markers,  setMarkers]  = useState<Marker[]>([]);
  const [harvests, setHarvests] = useState<HarvestLog[]>([]);
  const [spends,   setSpends]   = useState<SpendLog[]>([]);
  const [curPlot,  setCurPlot]  = useState<string | null>(null);

  // ── Subscribe to Firestore ──────────────────────────────
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

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <Header page={page} onAction={() => {
        // Header action triggers add-modal in each view via ref/event
        document.dispatchEvent(new CustomEvent('hdr-action'));
      }} />

      <div style={{ flex:1, position:'relative', overflow:'hidden' }}>
        {page === 'map'     && <MapView     {...sharedProps} />}
        {page === 'harvest' && <HarvestView {...sharedProps} />}
        {page === 'spend'   && <SpendView   {...sharedProps} />}
        {page === 'stats'   && <StatsView   {...sharedProps} />}
      </div>

      <BottomNav page={page} onNav={setPage} />
    </div>
  );
}
