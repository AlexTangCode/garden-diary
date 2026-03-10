import { useState } from 'react';
import type { Plot, HarvestLog, SpendLog } from '../types';

interface Props {
  plots: Plot[];
  harvests: HarvestLog[];
  spends: SpendLog[];
}

const selStyle: React.CSSProperties = {
  flexShrink: 0, padding: '8px 14px',
  background: 'var(--card)', border: 'none', borderRadius: 20,
  fontFamily: 'var(--ff)', fontSize: 13, fontWeight: 600,
  color: 'var(--t1)', WebkitAppearance: 'none', outline: 'none',
  cursor: 'pointer', boxShadow: 'var(--sh)',
};

export default function StatsView({ plots, harvests, spends }: Props) {
  const [fp, setFp] = useState('');
  const [fm, setFm] = useState('');

  const fH = harvests.filter(h => (!fp || h.plotId === fp) && (!fm || h.date.startsWith(fm)));
  const fS = spends.filter(s   => (!fp || s.plotId === fp) && (!fm || s.date.startsWith(fm)));
  const totS = fS.reduce((a, s) => a + s.amt, 0);

  // veg counts
  const vc: Record<string, number> = {};
  fH.forEach(h => { vc[h.veg] = (vc[h.veg] ?? 0) + 1; });
  const topV = Object.entries(vc).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const mV   = topV[0]?.[1] ?? 1;

  // spend cats
  const sc: Record<string, number> = {};
  fS.forEach(s => { sc[s.cat] = (sc[s.cat] ?? 0) + s.amt; });
  const topC = Object.entries(sc).sort((a, b) => b[1] - a[1]);
  const mC   = topC[0]?.[1] ?? 1;

  // monthly
  const mo: Record<string, { h: number; s: number }> = {};
  fH.forEach(h => { const m = h.date.slice(0,7); mo[m] ??= {h:0,s:0}; mo[m].h++; });
  fS.forEach(s => { const m = s.date.slice(0,7); mo[m] ??= {h:0,s:0}; mo[m].s += s.amt; });
  const months = Object.keys(mo).sort().reverse().slice(0, 12);

  // per plot
  const ps: Record<string, { h: number; s: number }> = {};
  fH.forEach(h => { const k = h.plotId ?? ''; ps[k] ??= {h:0,s:0}; ps[k].h++; });
  fS.forEach(s => { const k = s.plotId ?? ''; ps[k] ??= {h:0,s:0}; ps[k].s += s.amt; });
  const pn = (id: string) => plots.find(p => p.id === id)?.name ?? '未指定';

  const noData = fH.length === 0 && fS.length === 0;

  return (
    <div style={{
      position: 'absolute', inset: 0,
      overflowY: 'auto', WebkitOverflowScrolling: 'touch' as never,
      paddingBottom: 'calc(88px + var(--safe-b) + 16px)',
      animation: 'pgIn .25s ease',
    }}>
      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, padding: '8px 16px 12px', overflowX: 'auto' }}>
        <select value={fp} onChange={e => setFp(e.target.value)} style={selStyle}>
          <option value="">所有菜地</option>
          {plots.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <input type="month" value={fm} onChange={e => setFm(e.target.value)} style={selStyle} />
        <button onClick={() => { setFp(''); setFm(''); }} style={{ ...selStyle, color: 'var(--acc)', fontWeight: 700 }}>重置</button>
      </div>

      {/* Hero card */}
      <div style={{
        background: 'var(--card)', borderRadius: 'var(--r-lg)',
        margin: '0 20px 14px', display: 'flex', boxShadow: 'var(--sh)',
        overflow: 'hidden',
      }}>
        <div style={{ flex: 1, padding: '20px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--acc)', fontWeight: 700, marginBottom: 8 }}>🧺 采摘记录</div>
          <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: -2, lineHeight: 1 }}>{fH.length}</div>
        </div>
        <div style={{ flex: 1, padding: '20px 16px', textAlign: 'center', borderLeft: '1px solid rgba(44,32,24,.08)' }}>
          <div style={{ fontSize: 13, color: 'var(--acc)', fontWeight: 700, marginBottom: 8 }}>💰 总支出</div>
          <div style={{ fontSize: totS >= 1000 ? 32 : 44, fontWeight: 800, letterSpacing: -2, lineHeight: 1 }}>
            ¥{totS.toFixed(0)}
          </div>
        </div>
      </div>

      {noData ? (
        <div style={{ textAlign: 'center', padding: '64px 24px' }}>
          <div style={{ fontSize: 54 }}>🌿</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 14 }}>暂无统计数据</div>
          <div style={{ fontSize: 14, color: 'var(--t2)', marginTop: 6 }}>先记录采摘和支出吧</div>
        </div>
      ) : (
        <>
          {/* Harvest bar chart */}
          {topV.length > 0 && (
            <>
              <SLabel>采摘排行</SLabel>
              <div style={chartCardStyle}>
                {topV.map(([v, c]) => (
                  <BarRow key={v} label={v} val={c} suffix="次" max={mV} color="var(--green)" />
                ))}
              </div>
            </>
          )}

          {/* Spend bar chart */}
          {topC.length > 0 && (
            <>
              <SLabel>支出分类</SLabel>
              <div style={chartCardStyle}>
                {topC.map(([c, a]) => (
                  <BarRow key={c} label={c.split(' ')[1] ?? c} val={a} suffix="¥" max={mC} color="var(--red)" prefix="¥" />
                ))}
              </div>
            </>
          )}

          {/* Monthly table */}
          {months.length > 0 && (
            <>
              <SLabel>月度对照</SLabel>
              <div style={tblCardStyle}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>{['月份','采摘次数','当月支出'].map(h => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {months.map(m => (
                      <tr key={m}>
                        <td style={{ ...tdStyle, fontWeight: 700 }}>{m}</td>
                        <td style={{ ...tdStyle, color: 'var(--green)', fontWeight: 700 }}>+{mo[m].h}次</td>
                        <td style={{ ...tdStyle, color: mo[m].s ? 'var(--red)' : 'var(--t3)', fontWeight: mo[m].s ? 700 : 400 }}>
                          {mo[m].s ? '¥' + mo[m].s.toFixed(2) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Per-plot table */}
          {Object.keys(ps).length > 1 && (
            <>
              <SLabel>各菜地汇总</SLabel>
              <div style={tblCardStyle}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>{['菜地','采摘','支出'].map(h => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {Object.entries(ps).map(([pid, d]) => (
                      <tr key={pid}>
                        <td style={{ ...tdStyle, fontWeight: 700 }}>{pn(pid)}</td>
                        <td style={{ ...tdStyle, color: 'var(--green)', fontWeight: 700 }}>{d.h}次</td>
                        <td style={{ ...tdStyle, color: d.s ? 'var(--red)' : 'var(--t3)', fontWeight: d.s ? 700 : 400 }}>
                          {d.s ? '¥' + d.s.toFixed(2) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
      <div style={{ height: 20 }} />
    </div>
  );
}

function SLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--t3)', padding: '16px 22px 8px' }}>
      {children}
    </div>
  );
}

function BarRow({ label, val, suffix, max, color, prefix }: {
  label: string; val: number; suffix: string; max: number; color: string; prefix?: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 11 }}>
      <div style={{ fontSize: 12, color: 'var(--t1)', fontWeight: 600, width: 68, textAlign: 'right', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</div>
      <div style={{ flex: 1, height: 8, background: 'var(--bg)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 4, background: color, width: `${(val / max * 100).toFixed(1)}%`, transition: 'width .7s cubic-bezier(.4,0,.2,1)', minWidth: 6 }} />
      </div>
      <div style={{ fontSize: 11, color: 'var(--t2)', fontWeight: 700, width: 48, flexShrink: 0 }}>
        {prefix}{typeof val === 'number' && prefix ? val.toFixed(0) : val}{prefix ? '' : suffix}
      </div>
    </div>
  );
}

const chartCardStyle: React.CSSProperties = {
  background: 'var(--card)', borderRadius: 'var(--r-lg)',
  margin: '0 16px 10px', padding: 20, boxShadow: 'var(--sh)',
};
const tblCardStyle: React.CSSProperties = {
  background: 'var(--card)', borderRadius: 'var(--r-lg)',
  margin: '0 16px 10px', overflow: 'hidden', boxShadow: 'var(--sh)',
};
const thStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: 'var(--t3)', letterSpacing: '.08em',
  textTransform: 'uppercase', padding: '12px 16px',
  borderBottom: '1px solid rgba(44,32,24,.06)', textAlign: 'left',
};
const tdStyle: React.CSSProperties = {
  fontSize: 14, color: 'var(--t1)', padding: '12px 16px',
  borderBottom: '1px solid rgba(44,32,24,.05)',
};
