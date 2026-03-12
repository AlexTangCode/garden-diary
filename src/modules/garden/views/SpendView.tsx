import { useState, useEffect } from 'react';
import { BookOpen, X, Calendar, MapPin, DollarSign, Tag } from 'lucide-react';
import type { Plot, SpendLog, SpendCategory } from '../../../types/garden';
import { saveSpend, deleteSpend, newId } from '../../../services/garden.firebase';
import Sheet from '../components/Sheet';
import { FormField, BtnRow, Btn, inputStyle } from '../components/FormField';

interface Props {
  plots: Plot[];
  spends: SpendLog[];
  curPlot: string | null;
}

const CATS: SpendCategory[] = [
  '🌱 种子/种苗', '💊 农药/肥料', '🔧 工具/设备', '💧 水电', '📦 其他',
];
const today = () => new Date().toISOString().slice(0, 10);

const selStyle: React.CSSProperties = {
  flexShrink: 0, padding: '8px 14px',
  background: 'var(--card)', border: 'none', borderRadius: 20,
  fontFamily: 'var(--ff)', fontSize: 13, fontWeight: 600,
  color: 'var(--t1)', WebkitAppearance: 'none', outline: 'none',
  cursor: 'pointer', boxShadow: 'var(--sh)',
};

export default function SpendView({ plots, spends, curPlot }: Props) {
  const [open, setOpen] = useState(false);
  const [fp, setFp] = useState('');
  const [fc, setFc] = useState('');
  const [fm, setFm] = useState('');
  const [sPlot, setSPlot] = useState('');
  const [sCat,  setSCat]  = useState<SpendCategory>('🌱 种子/种苗');
  const [sItem, setSItem] = useState('');
  const [sAmt,  setSAmt]  = useState('');
  const [sDate, setSDate] = useState(today());
  const [sNote, setSNote] = useState('');

  useEffect(() => {
    const handler = () => {
      setSPlot(curPlot ?? ''); setSCat('🌱 种子/种苗');
      setSItem(''); setSAmt(''); setSNote(''); setSDate(today());
      setOpen(true);
    };
    document.addEventListener('hdr-action', handler);
    return () => document.removeEventListener('hdr-action', handler);
  }, [curPlot]);

  const pn = (id: string | null) => plots.find(p => p.id === id)?.name ?? '';
  const filtered = spends.filter(s =>
    (!fp || s.plotId === fp) && (!fc || s.cat === fc) && (!fm || s.date.startsWith(fm))
  );
  const total = filtered.reduce((a, s) => a + s.amt, 0);

  const handleSave = async () => {
    const amt = parseFloat(sAmt);
    if (!sItem.trim() || !sDate || isNaN(amt) || amt <= 0) return;
    await saveSpend({
      id: newId(), plotId: sPlot || null, cat: sCat, item: sItem.trim(),
      amt, date: sDate, note: sNote.trim(), createdAt: Date.now(),
    });
    setOpen(false);
  };

  return (
    <>
      <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch' as never, paddingBottom: 16, animation: 'pgIn .25s ease' }}>
        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, padding: '12px 16px', overflowX: 'auto' }}>
          <select value={fp} onChange={e => setFp(e.target.value)} style={selStyle}>
            <option value="">所有菜地</option>
            {plots.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={fc} onChange={e => setFc(e.target.value)} style={selStyle}>
            <option value="">所有分类</option>
            {CATS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="month" value={fm} onChange={e => setFm(e.target.value)} style={selStyle} />
        </div>

        {/* Total banner */}
        {filtered.length > 0 && (
          <div style={{
            margin: '0 16px 14px', padding: '16px 20px',
            background: 'var(--red-l)', borderRadius: 'var(--r-lg)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(192,88,88,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DollarSign size={18} strokeWidth={2} color="var(--red)" />
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--red)' }}>合计支出</span>
            </div>
            <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--red)', letterSpacing: '-.8px' }}>¥{total.toFixed(2)}</span>
          </div>
        )}

        {/* List */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <BookOpen size={40} strokeWidth={1.5} color="var(--t4)" />
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--t1)' }}>暂无支出记录</div>
            <div style={{ fontSize: 14, color: 'var(--t2)', marginTop: 6 }}>记录每一笔菜园投入</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 16px' }}>
            {filtered.map(s => (
              <div key={s.id} style={{
                background: 'var(--card)', borderRadius: 'var(--r-lg)',
                boxShadow: 'var(--sh)', overflow: 'hidden',
                display: 'flex', alignItems: 'stretch',
              }}>
                <div style={{ width: 4, background: 'var(--red)', flexShrink: 0 }} />
                <div style={{ width: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 12, background: 'var(--red-l)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Tag size={16} strokeWidth={2} color="var(--red)" />
                  </div>
                </div>
                <div style={{ flex: 1, padding: '14px 0', minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.item}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 600 }}>{s.cat}</span>
                    {pn(s.plotId) && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--t3)', fontWeight: 600 }}>
                        <MapPin size={10} /> {pn(s.plotId)}
                      </span>
                    )}
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--t3)', fontWeight: 600 }}>
                      <Calendar size={10} /> {s.date}
                    </span>
                  </div>
                </div>
                <div style={{ padding: '14px 12px', textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--red)' }}>¥{s.amt.toFixed(2)}</div>
                  <button onClick={() => deleteSpend(s.id)} style={{
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

      <Sheet open={open} onClose={() => setOpen(false)} title="记录支出"
        footer={<BtnRow><Btn variant="secondary" onClick={() => setOpen(false)}>取消</Btn><Btn onClick={handleSave}>记录支出</Btn></BtnRow>}
      >
        <FormField label="菜地">
          <select style={inputStyle} value={sPlot} onChange={e => setSPlot(e.target.value)}>
            <option value="">未指定</option>
            {plots.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </FormField>
        <FormField label="分类">
          <select style={inputStyle} value={sCat} onChange={e => setSCat(e.target.value as SpendCategory)}>
            {CATS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </FormField>
        <FormField label="项目名称">
          <input style={inputStyle} value={sItem} onChange={e => setSItem(e.target.value)} placeholder="番茄种苗 × 10株" autoFocus />
        </FormField>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <FormField label="金额（元）">
            <input style={inputStyle} type="number" value={sAmt} onChange={e => setSAmt(e.target.value)} placeholder="0.00" min="0" step="0.01" />
          </FormField>
          <FormField label="日期">
            <input style={inputStyle} type="date" value={sDate} onChange={e => setSDate(e.target.value)} />
          </FormField>
        </div>
        <FormField label="备注">
          <textarea style={{ ...inputStyle, resize: 'none', minHeight: 72, lineHeight: 1.55 } as React.CSSProperties}
            value={sNote} onChange={e => setSNote(e.target.value)} placeholder="购买渠道、规格…" />
        </FormField>
      </Sheet>
    </>
  );
}
