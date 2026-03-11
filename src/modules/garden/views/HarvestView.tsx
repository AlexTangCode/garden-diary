import { useState, useEffect } from 'react';
import type { Plot, Marker, HarvestLog } from '../../../types/garden';
import { saveHarvest, deleteHarvest, newId } from '../../../services/garden.firebase';
import Sheet from '../components/Sheet';
import { FormField, BtnRow, Btn, inputStyle } from '../components/FormField';

interface Props {
  plots: Plot[];
  markers: Marker[];
  harvests: HarvestLog[];
  curPlot: string | null;
}

const today = () => new Date().toISOString().slice(0, 10);
const selStyle: React.CSSProperties = {
  flexShrink: 0, padding: '8px 14px',
  background: 'var(--card)', border: 'none', borderRadius: 20,
  fontFamily: 'var(--ff)', fontSize: 13, fontWeight: 600,
  color: 'var(--t1)', WebkitAppearance: 'none', outline: 'none',
  cursor: 'pointer', boxShadow: 'var(--sh)',
};
const lcStyle: React.CSSProperties = {
  background: 'var(--card)', borderRadius: 'var(--r-md)',
  margin: '0 16px 10px', display: 'flex', alignItems: 'stretch',
  boxShadow: 'var(--sh)', overflow: 'hidden',
};

export default function HarvestView({ plots, markers, harvests, curPlot }: Props) {
  const [open, setOpen] = useState(false);
  const [fp, setFp] = useState('');
  const [fv, setFv] = useState('');
  const [fm, setFm] = useState('');
  const [hPlot, setHPlot] = useState('');
  const [hVeg,  setHVeg]  = useState('');
  const [hAmt,  setHAmt]  = useState('');
  const [hDate, setHDate] = useState(today());
  const [hNote, setHNote] = useState('');

  useEffect(() => {
    const handler = () => {
      setHPlot(curPlot ?? ''); setHVeg(''); setHAmt(''); setHNote(''); setHDate(today());
      setOpen(true);
    };
    document.addEventListener('hdr-action', handler);
    return () => document.removeEventListener('hdr-action', handler);
  }, [curPlot]);

  const vegs = [...new Set([...markers.map(m => m.name), ...harvests.map(h => h.veg)])];
  const pn = (id: string | null) => plots.find(p => p.id === id)?.name ?? '';

  const filtered = harvests.filter(h =>
    (!fp || h.plotId === fp) && (!fv || h.veg === fv) && (!fm || h.date.startsWith(fm))
  );

  const vc: Record<string, number> = {};
  filtered.forEach(h => { vc[h.veg] = (vc[h.veg] ?? 0) + 1; });
  const top3 = Object.entries(vc).sort((a, b) => b[1] - a[1]).slice(0, 3);

  const handleSave = async () => {
    if (!hVeg.trim() || !hDate) return;
    await saveHarvest({
      id: newId(), plotId: hPlot || null,
      veg: hVeg.trim(), amount: hAmt.trim(),
      date: hDate, note: hNote.trim(), createdAt: Date.now(),
    });
    setOpen(false);
  };

  return (
    <>
      <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch' as never, paddingBottom: 'calc(88px + var(--safe-b) + 16px)', animation: 'pgIn .25s ease' }}>
        <div style={{ display: 'flex', gap: 8, padding: '8px 16px 12px', overflowX: 'auto' }}>
          <select value={fp} onChange={e => setFp(e.target.value)} style={selStyle}>
            <option value="">所有菜地</option>
            {plots.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={fv} onChange={e => setFv(e.target.value)} style={selStyle}>
            <option value="">所有蔬菜</option>
            {vegs.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <input type="month" value={fm} onChange={e => setFm(e.target.value)} style={selStyle} />
        </div>

        <div style={{ display: 'flex', gap: 10, padding: '0 16px', overflowX: 'auto', marginBottom: 14 }}>
          <StatTile val={filtered.length}        lbl="采摘记录" color="var(--green)" />
          <StatTile val={Object.keys(vc).length} lbl="蔬菜品种" color="var(--acc)"   />
          {top3.map(([v, c]) => <StatTile key={v} val={c} lbl={v} color="var(--teal)" />)}
        </div>

        {filtered.length === 0 ? (
          <Empty icon="🧺" title="暂无采摘记录" sub="记录每一次丰收时刻" />
        ) : (
          filtered.map(h => (
            <div key={h.id} style={{ ...lcStyle, animation: 'slideUp .22s ease' }}>
              <div style={{ width: 4, background: 'var(--green)', flexShrink: 0 }} />
              <div style={{ flex: 1, padding: '14px', minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>🥬 {h.veg}</div>
                <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 3 }}>
                  {pn(h.plotId)}{pn(h.plotId) && h.note ? ' · ' : ''}{h.note}
                </div>
              </div>
              <div style={{ padding: '14px', textAlign: 'right', flexShrink: 0 }}>
                {h.amount && <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--green)' }}>{h.amount}</div>}
                <div style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 500, marginTop: 2 }}>{h.date}</div>
              </div>
              <button onClick={() => deleteHarvest(h.id)} style={{ padding: '0 14px', color: 'var(--t3)', fontSize: 16, display: 'flex', alignItems: 'center' }}>✕</button>
            </div>
          ))
        )}
        <div style={{ height: 20 }} />
      </div>

      <Sheet open={open} onClose={() => setOpen(false)} title="🧺 记录采摘"
        footer={<BtnRow><Btn variant="secondary" onClick={() => setOpen(false)}>取消</Btn><Btn color="var(--green)" onClick={handleSave}>记录采摘</Btn></BtnRow>}
      >
        <FormField label="菜地">
          <select style={inputStyle} value={hPlot} onChange={e => setHPlot(e.target.value)}>
            <option value="">未指定</option>
            {plots.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </FormField>
        <FormField label="蔬菜">
          <input style={inputStyle} value={hVeg} onChange={e => setHVeg(e.target.value)} placeholder="蔬菜名称" list="vdl-h" autoFocus />
          <datalist id="vdl-h">{vegs.map(v => <option key={v} value={v} />)}</datalist>
        </FormField>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <FormField label="数量/重量">
            <input style={inputStyle} value={hAmt} onChange={e => setHAmt(e.target.value)} placeholder="500g、3根…" />
          </FormField>
          <FormField label="日期">
            <input style={inputStyle} type="date" value={hDate} onChange={e => setHDate(e.target.value)} />
          </FormField>
        </div>
        <FormField label="备注">
          <textarea style={{ ...inputStyle, resize: 'none', minHeight: 72, lineHeight: 1.55 } as React.CSSProperties}
            value={hNote} onChange={e => setHNote(e.target.value)} placeholder="口感、烹饪方式…" />
        </FormField>
      </Sheet>
    </>
  );
}

function StatTile({ val, lbl, color }: { val: number; lbl: string; color: string }) {
  return (
    <div style={{ flexShrink: 0, background: 'var(--card)', borderRadius: 'var(--r-md)', padding: '16px 18px', minWidth: 110, boxShadow: 'var(--sh)' }}>
      <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: -1.2, lineHeight: 1, color }}>{val}</div>
      <div style={{ fontSize: 12, color: 'var(--t2)', fontWeight: 600, marginTop: 5 }}>{lbl}</div>
    </div>
  );
}

function Empty({ icon, title, sub }: { icon: string; title: string; sub: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '64px 24px' }}>
      <div style={{ fontSize: 54 }}>{icon}</div>
      <div style={{ fontSize: 18, fontWeight: 700, marginTop: 14 }}>{title}</div>
      <div style={{ fontSize: 14, color: 'var(--t2)', marginTop: 6, lineHeight: 1.6 }}>{sub}</div>
    </div>
  );
}
