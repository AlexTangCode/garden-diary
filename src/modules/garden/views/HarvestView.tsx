import { useState, useEffect } from 'react';
import { Leaf, X, Calendar, MapPin, Package } from 'lucide-react';
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

  const openNew = () => { setHPlot(curPlot ?? ''); setHVeg(''); setHAmt(''); setHNote(''); setHDate(today()); setOpen(true); };

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
      <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch' as never, paddingBottom: 16, animation: 'pgIn .25s ease' }}>
        {/* Filters + 新增按钮同一行 */}
        <div style={{ display: 'flex', gap: 8, padding: '12px 16px', overflowX: 'auto', alignItems: 'center' }}>
          <select value={fp} onChange={e => setFp(e.target.value)} style={selStyle}>
            <option value="">所有菜地</option>
            {plots.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={fv} onChange={e => setFv(e.target.value)} style={selStyle}>
            <option value="">所有蔬菜</option>
            {vegs.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <input type="month" value={fm} onChange={e => setFm(e.target.value)} style={selStyle} />
          <button onClick={openNew} style={{
            flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5,
            padding: '8px 16px', borderRadius: 999,
            background: 'var(--acc)', color: '#fff',
            fontSize: 13, fontWeight: 700,
            boxShadow: '0 4px 14px rgba(200,132,90,.3)',
          }}>＋ 记录</button>
        </div>

        {/* Stat tiles */}
        <div style={{ display: 'flex', gap: 10, padding: '0 16px 16px', overflowX: 'auto' }}>
          <StatTile icon={<Leaf size={18} strokeWidth={2} />} val={filtered.length} lbl="采摘记录" color="var(--green)" bg="var(--green-l)" />
          <StatTile icon={<Package size={18} strokeWidth={2} />} val={Object.keys(vc).length} lbl="蔬菜品种" color="var(--acc)" bg="var(--acc-bg)" />
          {top3.map(([v, c]) => <StatTile key={v} icon={<Leaf size={18} strokeWidth={2} />} val={c} lbl={v} color="var(--teal)" bg="var(--teal-l)" />)}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <Empty icon={<Leaf size={40} strokeWidth={1.5} color="var(--t4)" />} title="暂无采摘记录" sub="记录每一次丰收时刻" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 16px' }}>
            {filtered.map(h => (
              <div key={h.id} style={{
                background: 'var(--card)', borderRadius: 'var(--r-lg)',
                boxShadow: 'var(--sh)', overflow: 'hidden',
                display: 'flex', alignItems: 'stretch',
              }}>
                {/* Accent stripe */}
                <div style={{ width: 4, background: 'var(--green)', flexShrink: 0 }} />
                {/* Icon badge */}
                <div style={{ width: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 12, background: 'var(--green-l)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Leaf size={18} strokeWidth={2} color="var(--green)" />
                  </div>
                </div>
                {/* Content */}
                <div style={{ flex: 1, padding: '14px 0', minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)' }}>{h.veg}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                    {pn(h.plotId) && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--t3)', fontWeight: 600 }}>
                        <MapPin size={10} /> {pn(h.plotId)}
                      </span>
                    )}
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--t3)', fontWeight: 600 }}>
                      <Calendar size={10} /> {h.date}
                    </span>
                    {h.note && <span style={{ fontSize: 11, color: 'var(--t2)' }}>{h.note}</span>}
                  </div>
                </div>
                {/* Amount + delete */}
                <div style={{ padding: '14px 12px', textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  {h.amount && <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--green)' }}>{h.amount}</div>}
                  <button onClick={() => deleteHarvest(h.id)} style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--t3)',
                  }}>
                    <X size={14} strokeWidth={2} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div style={{ height: 16 }} />
      </div>

      <Sheet open={open} onClose={() => setOpen(false)} title="记录采摘"
        footer={<BtnRow><Btn variant="secondary" onClick={() => setOpen(false)}>取消</Btn><Btn onClick={handleSave}>记录采摘</Btn></BtnRow>}
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

function StatTile({ icon, val, lbl, color, bg }: { icon: React.ReactNode; val: number; lbl: string; color: string; bg: string }) {
  return (
    <div style={{ flexShrink: 0, background: 'var(--card)', borderRadius: 'var(--r-lg)', padding: '16px 18px', minWidth: 110, boxShadow: 'var(--sh)', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -1, lineHeight: 1, color }}>{val}</div>
      <div style={{ fontSize: 11, color: 'var(--t2)', fontWeight: 600 }}>{lbl}</div>
    </div>
  );
}

function Empty({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '64px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>{icon}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--t1)' }}>{title}</div>
      <div style={{ fontSize: 14, color: 'var(--t2)', marginTop: 6, lineHeight: 1.6 }}>{sub}</div>
    </div>
  );
}
