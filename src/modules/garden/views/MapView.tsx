import { useState, useRef, useEffect, useCallback } from 'react';
import type { Plot, Marker, MarkerStatus } from '@/types/garden';
import { savePlot, deletePlot, saveMarker, deleteMarker, newId } from '@/services/garden.firebase';
import Sheet from '../components/Sheet';
import { FormField, BtnRow, Btn, inputStyle } from '../components/FormField';

interface Props {
  plots: Plot[];
  markers: Marker[];
  curPlot: string | null;
  setCurPlot: (id: string | null) => void;
}

const COLORS = ['#C8845A','#6BA368','#5A82A8','#A87CA0','#5A9E8C','#C05858','#8A9E5A','#9E7A5A'];
const STATUSES: MarkerStatus[] = ['🌱 播种','🌿 生长','🌼 收获','✅ 完成'];
type Mode = 'view' | 'add' | 'move';

export default function MapView({ plots, markers, curPlot, setCurPlot }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef    = useRef<HTMLImageElement | null>(null);
  const fileRef   = useRef<HTMLInputElement>(null);
  const dragRef   = useRef<{ idx: number; offX: number; offY: number } | null>(null);

  // Default mode is 'view' — no accidental taps
  const [mode, setMode]               = useState<Mode>('view');
  const [showAddPlot, setShowAddPlot] = useState(false);
  const [showMarker,  setShowMarker]  = useState(false);
  const [editMkId,    setEditMkId]    = useState<string | null>(null);
  const [pendingXY,   setPendingXY]   = useState({ x: 0.5, y: 0.5 });

  const [plotName,  setPlotName]  = useState('');
  const [plotNote,  setPlotNote]  = useState('');
  const [plotColor, setPlotColor] = useState(COLORS[0]);

  const [mkVeg,    setMkVeg]    = useState('');
  const [mkVar,    setMkVar]    = useState('');
  const [mkStatus, setMkStatus] = useState<MarkerStatus>('🌱 播种');
  const [mkDate,   setMkDate]   = useState('');
  const [mkNote,   setMkNote]   = useState('');

  const pl     = plots.find(p => p.id === curPlot);
  const plotMk = markers.filter(m => m.plotId === curPlot);

  // Listen for header "+ 新菜地" button
  useEffect(() => {
    const handler = () => openAddPlot();
    document.addEventListener('hdr-action', handler);
    return () => document.removeEventListener('hdr-action', handler);
  }, [plots]);

  const redraw = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv || !imgRef.current) return;
    const ctx = cv.getContext('2d')!;
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.drawImage(imgRef.current, 0, 0, cv.width, cv.height);
    plotMk.forEach((m, i) => {
      const x = m.x * cv.width, y = m.y * cv.height;
      const col = pl?.color ?? '#C8845A';
      ctx.save();
      ctx.shadowColor = 'rgba(44,32,24,.3)';
      ctx.shadowBlur  = 10;
      ctx.shadowOffsetY = 3;
      ctx.beginPath(); ctx.arc(x, y, 15, 0, Math.PI * 2);
      ctx.fillStyle = col; ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 2.5; ctx.stroke();
      ctx.restore();
      ctx.font = '700 11px -apple-system,sans-serif';
      ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String(i + 1), x, y);
      const lb = m.name + (m.variety ? '·' + m.variety : '');
      ctx.save();
      ctx.font = '600 11px -apple-system,sans-serif';
      const tw = ctx.measureText(lb).width;
      const lx = x - tw / 2 - 8, ly = y - 30;
      ctx.fillStyle = 'rgba(44,32,24,.8)';
      (ctx as any).roundRect?.(lx, ly, tw + 16, 20, 6) ?? ctx.rect(lx, ly, tw + 16, 20);
      ctx.fill();
      ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(lb, x, ly + 10); ctx.restore();
    });

    // Show edit-mode overlay hint on canvas
    if (mode === 'add') {
      ctx.save();
      ctx.fillStyle = 'rgba(200,132,90,0.08)';
      ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.strokeStyle = 'rgba(200,132,90,0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(1, 1, cv.width - 2, cv.height - 2);
      ctx.restore();
    }
  }, [plotMk, pl, mode]);

  useEffect(() => { redraw(); }, [redraw]);

  const loadImage = (src: string) => {
    const img = new Image();
    img.onload = () => {
      const cv = canvasRef.current!;
      const W = cv.parentElement!.offsetWidth;
      const sc = W / img.naturalWidth;
      cv.width  = img.naturalWidth  * sc;
      cv.height = img.naturalHeight * sc;
      imgRef.current = img;
      redraw();
    };
    img.src = src;
  };

  useEffect(() => {
    if (pl?.image) loadImage(pl.image);
    else imgRef.current = null;
  }, [pl?.id, pl?.image]);

  const getPos = (clientX: number, clientY: number) => {
    const cv = canvasRef.current!;
    const r  = cv.getBoundingClientRect();
    const sx = cv.width / r.width, sy = cv.height / r.height;
    return { x: (clientX - r.left) * sx, y: (clientY - r.top) * sy };
  };

  const hitTest = (px: number, py: number) => {
    for (let i = plotMk.length - 1; i >= 0; i--) {
      const mx = plotMk[i].x * canvasRef.current!.width;
      const my = plotMk[i].y * canvasRef.current!.height;
      if (Math.hypot(px - mx, py - my) < 20) return i;
    }
    return -1;
  };

  const onDown = (px: number, py: number) => {
    if (mode === 'view') return;          // ← no-op in browse mode
    const cv = canvasRef.current!;
    if (mode === 'add') {
      const hit = hitTest(px, py);
      if (hit !== -1) {
        // Tap existing marker → edit it
        openMarker(plotMk[hit].id);
      } else {
        setPendingXY({ x: px / cv.width, y: py / cv.height });
        openMarker(null);
      }
    } else {
      const i = hitTest(px, py);
      if (i !== -1) {
        dragRef.current = { idx: i, offX: px - plotMk[i].x * cv.width, offY: py - plotMk[i].y * cv.height };
      }
    }
  };
  const onMove = (px: number, py: number) => {
    if (mode !== 'move' || !dragRef.current) return;
    const cv = canvasRef.current!;
    const mk = plotMk[dragRef.current.idx];
    const nx = Math.max(0.01, Math.min(0.99, (px - dragRef.current.offX) / cv.width));
    const ny = Math.max(0.01, Math.min(0.99, (py - dragRef.current.offY) / cv.height));
    saveMarker({ ...mk, x: nx, y: ny });
  };
  const onUp = () => { dragRef.current = null; };

  const openAddPlot = () => {
    setPlotName(''); setPlotNote('');
    setPlotColor(COLORS[plots.length % COLORS.length]);
    setShowAddPlot(true);
  };
  const handleSavePlot = async () => {
    if (!plotName.trim()) return;
    const p: Plot = {
      id: newId(), name: plotName.trim(), note: plotNote.trim(),
      color: plotColor, image: null, createdAt: Date.now(),
    };
    await savePlot(p);
    setCurPlot(p.id);
    setShowAddPlot(false);
  };

  const openMarker = (id: string | null) => {
    if (id) {
      const m = markers.find(x => x.id === id)!;
      setMkVeg(m.name); setMkVar(m.variety ?? '');
      setMkStatus(m.status); setMkDate(m.date); setMkNote(m.note ?? '');
    } else {
      setMkVeg(''); setMkVar('');
      setMkStatus('🌱 播种'); setMkDate(today()); setMkNote('');
    }
    setEditMkId(id);
    setShowMarker(true);
  };
  const handleSaveMarker = async () => {
    if (!mkVeg.trim() || !curPlot) return;
    const base = {
      plotId: curPlot, name: mkVeg.trim(), variety: mkVar.trim(),
      status: mkStatus, date: mkDate, note: mkNote.trim(),
    };
    if (editMkId) {
      const existing = markers.find(m => m.id === editMkId)!;
      await saveMarker({ ...existing, ...base });
    } else {
      await saveMarker({ id: newId(), createdAt: Date.now(), x: pendingXY.x, y: pendingXY.y, ...base });
    }
    setShowMarker(false);
  };
  const handleDelMarker = async () => {
    if (!editMkId || !window.confirm('删除此标注？')) return;
    await deleteMarker(editMkId);
    setShowMarker(false);
  };

  const handleImg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f || !pl) return;
    const r = new FileReader();
    r.onload = async ev => {
      const data = ev.target!.result as string;
      await savePlot({ ...pl, image: data });
    };
    r.readAsDataURL(f);
    e.target.value = '';
  };

  const today = () => new Date().toISOString().slice(0, 10);

  const getCursor = () => {
    if (mode === 'view') return 'default';
    if (mode === 'add')  return 'crosshair';
    return 'grab';
  };

  return (
    <>
      <div style={{
        position: 'absolute', inset: 0,
        overflowY: 'auto', WebkitOverflowScrolling: 'touch' as never,
        paddingBottom: 16,
      }}>
        {/* Stats row */}
        <div style={{
          background: 'var(--card)', borderRadius: 'var(--r-lg)',
          margin: '14px 16px', display: 'flex', boxShadow: 'var(--sh)', overflow: 'hidden',
        }}>
          {[
            { label: '📍 菜地数', val: plots.length },
            { label: '🌿 标注数', val: plotMk.length },
          ].map((s, i) => (
            <div key={i} style={{
              flex: 1, padding: '16px', textAlign: 'center',
              ...(i > 0 ? { borderLeft: '1px solid rgba(44,32,24,.08)' } : {}),
            }}>
              <div style={{ fontSize: 12, color: 'var(--acc)', fontWeight: 700, marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: -2, lineHeight: 1, color: 'var(--t1)' }}>{s.val}</div>
            </div>
          ))}
        </div>

        {plots.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 24px' }}>
            <div style={{ fontSize: 54 }}>🌱</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginTop: 14 }}>还没有菜地</div>
            <div style={{ fontSize: 14, color: 'var(--t2)', marginTop: 6 }}>点击右上角 ＋ 创建第一块菜地</div>
          </div>
        ) : (
          <>
            {/* Plot selector chips */}
            <div style={{ display: 'flex', gap: 8, padding: '4px 16px 8px', overflowX: 'auto' }}>
              {plots.map(p => (
                <button key={p.id} onClick={() => setCurPlot(p.id)} style={{
                  flexShrink: 0, padding: '7px 14px', borderRadius: 20,
                  background: p.id === curPlot ? 'var(--acc)' : 'var(--card)',
                  color: p.id === curPlot ? '#fff' : 'var(--t2)',
                  fontSize: 13, fontWeight: 600,
                  boxShadow: p.id === curPlot ? '0 4px 16px rgba(200,132,90,.35)' : 'var(--sh)',
                  display: 'flex', alignItems: 'center', gap: 6, transition: 'all .18s',
                }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.id === curPlot ? 'rgba(255,255,255,.8)' : p.color, flexShrink: 0 }} />
                  {p.name}
                </button>
              ))}
              <button onClick={openAddPlot} style={{
                flexShrink: 0, padding: '7px 14px', borderRadius: 20,
                background: 'transparent', color: 'var(--acc)', fontSize: 13, fontWeight: 700,
                border: '1.5px dashed var(--acc2)',
              }}>
                ＋ 添加菜地
              </button>
            </div>

            {/* Edit mode toolbar — only show when not in view mode */}
            <div style={{ display: 'flex', gap: 8, padding: '4px 16px 8px', alignItems: 'center' }}>
              {mode === 'view' ? (
                // Browse mode: show an "Edit" button to enter edit mode
                <button onClick={() => setMode('add')} style={{
                  flex: 1, padding: '9px 0', borderRadius: 'var(--r-sm)',
                  fontSize: 13, fontWeight: 700,
                  background: 'var(--card)', color: 'var(--acc)',
                  boxShadow: 'var(--sh)',
                  border: '1.5px solid var(--acc2)',
                }}>
                  ✏️ 进入编辑模式
                </button>
              ) : (
                // Edit mode: show mode selector + utilities
                <>
                  {(['add','move'] as ('add'|'move')[]).map(m => (
                    <button key={m} onClick={() => setMode(m)} style={{
                      flex: 1, padding: '9px 0', borderRadius: 'var(--r-sm)',
                      fontSize: 13, fontWeight: 700,
                      background: mode === m ? 'var(--acc)' : 'var(--card)',
                      color: mode === m ? '#fff' : 'var(--t2)',
                      boxShadow: mode === m ? '0 4px 14px rgba(200,132,90,.3)' : 'var(--sh)',
                      transition: 'all .18s',
                    }}>
                      {m === 'add' ? '✚ 标注' : '⤢ 移动'}
                    </button>
                  ))}
                  <button onClick={() => fileRef.current?.click()} style={{ width: 40, borderRadius: 'var(--r-sm)', background: 'var(--card)', boxShadow: 'var(--sh)', fontSize: 17 }}>🖼</button>
                  <button onClick={async () => {
                    if (!plotMk.length || !window.confirm('清空所有标注？')) return;
                    for (const m of plotMk) await deleteMarker(m.id);
                  }} style={{ width: 40, borderRadius: 'var(--r-sm)', background: 'var(--card)', boxShadow: 'var(--sh)', fontSize: 17, color: 'var(--red)' }}>🗑</button>
                  <button onClick={() => setMode('view')} style={{
                    width: 40, borderRadius: 'var(--r-sm)',
                    background: 'var(--red-l)', color: 'var(--red)',
                    fontSize: 12, fontWeight: 700, boxShadow: 'var(--sh)',
                  }}>退出</button>
                </>
              )}
            </div>

            {/* Canvas / upload zone */}
            {!pl?.image ? (
              <div onClick={() => fileRef.current?.click()} style={{
                margin: '0 16px', padding: '48px 24px', textAlign: 'center', cursor: 'pointer',
                background: 'var(--card)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--sh)',
                border: '2px dashed var(--bg2)',
              }}>
                <div style={{ fontSize: 42 }}>📸</div>
                <div style={{ fontSize: 16, fontWeight: 700, marginTop: 10 }}>点击上传菜地平面图</div>
                <div style={{ fontSize: 13, color: 'var(--t2)', marginTop: 4 }}>支持 JPG / PNG</div>
              </div>
            ) : (
              <div style={{ margin: '0 16px', borderRadius: 'var(--r-lg)', overflow: 'hidden', boxShadow: 'var(--sh2)', background: 'var(--card)' }}>
                <canvas
                  ref={canvasRef}
                  style={{ display: 'block', width: '100%', cursor: getCursor() }}
                  onMouseDown={e => { const p = getPos(e.clientX, e.clientY); onDown(p.x, p.y); }}
                  onMouseMove={e => { const p = getPos(e.clientX, e.clientY); onMove(p.x, p.y); }}
                  onMouseUp={onUp}
                  onTouchStart={e => { e.preventDefault(); const t = e.touches[0]; const p = getPos(t.clientX, t.clientY); onDown(p.x, p.y); }}
                  onTouchMove={e  => { e.preventDefault(); const t = e.touches[0]; const p = getPos(t.clientX, t.clientY); onMove(p.x, p.y); }}
                  onTouchEnd={onUp}
                />
              </div>
            )}
            {/* ↑ Removed: "已标注 X 个位置" hint text  */}
            {/* ↑ Removed: "删除菜地" dangerous link      */}
          </>
        )}
        <div style={{ height: 20 }} />
      </div>

      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImg} />

      {/* Sheet: Add Plot */}
      <Sheet open={showAddPlot} onClose={() => setShowAddPlot(false)} title="添加菜地"
        footer={<BtnRow><Btn variant="secondary" onClick={() => setShowAddPlot(false)}>取消</Btn><Btn onClick={handleSavePlot}>创建菜地</Btn></BtnRow>}
      >
        <FormField label="菜地名称">
          <input style={inputStyle} value={plotName} onChange={e => setPlotName(e.target.value)} placeholder="东院菜地、阳台菜园…" autoFocus />
        </FormField>
        <FormField label="颜色标记">
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {COLORS.map(c => (
              <button key={c} onClick={() => setPlotColor(c)} style={{
                width: 34, height: 34, borderRadius: '50%', background: c,
                boxShadow: c === plotColor ? `0 0 0 3px #fff, 0 0 0 5.5px ${c}` : 'none',
                transition: 'transform .15s',
              }} />
            ))}
          </div>
        </FormField>
        <FormField label="备注（可选）">
          <input style={inputStyle} value={plotNote} onChange={e => setPlotNote(e.target.value)} placeholder="" />
        </FormField>
      </Sheet>

      {/* Sheet: Marker */}
      <Sheet open={showMarker} onClose={() => setShowMarker(false)} title={editMkId ? '编辑标注' : '添加标注'}
        footer={
          <BtnRow>
            {editMkId
              ? <Btn variant="danger" onClick={handleDelMarker}>删除标注</Btn>
              : <Btn variant="secondary" onClick={() => setShowMarker(false)}>取消</Btn>
            }
            <Btn onClick={handleSaveMarker}>保存</Btn>
          </BtnRow>
        }
      >
        <FormField label="蔬菜名称">
          <input style={inputStyle} value={mkVeg} onChange={e => setMkVeg(e.target.value)}
            placeholder="番茄、黄瓜、辣椒…" list="vdl-map" autoFocus />
          <datalist id="vdl-map">
            {['番茄','黄瓜','辣椒','茄子','南瓜','豆角','白菜','生菜','菠菜','韭菜','大葱','胡萝卜','土豆','香菜','玉米','西兰花','丝瓜','苦瓜','冬瓜','芹菜'].map(v => <option key={v} value={v} />)}
          </datalist>
        </FormField>
        <FormField label="品种（可选）">
          <input style={inputStyle} value={mkVar} onChange={e => setMkVar(e.target.value)} placeholder="樱桃番茄、紫皮茄子…" />
        </FormField>
        <FormField label="生长状态">
          <div style={{ display: 'flex', background: 'var(--bg)', borderRadius: 'var(--r-sm)', padding: 3, gap: 3 }}>
            {STATUSES.map(s => (
              <button key={s} onClick={() => setMkStatus(s)} style={{
                flex: 1, padding: '8px 4px', borderRadius: 8, fontSize: 11, fontWeight: 700, textAlign: 'center',
                background: mkStatus === s ? 'var(--card)' : 'none',
                color: mkStatus === s ? 'var(--t1)' : 'var(--t2)',
                boxShadow: mkStatus === s ? 'var(--sh)' : 'none', transition: 'all .18s',
              }}>{s}</button>
            ))}
          </div>
        </FormField>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <FormField label="种植日期">
            <input style={inputStyle} type="date" value={mkDate} onChange={e => setMkDate(e.target.value)} />
          </FormField>
          <div />
        </div>
        <FormField label="备注">
          <textarea style={{ ...inputStyle, resize: 'none', minHeight: 72, lineHeight: 1.55 } as React.CSSProperties}
            value={mkNote} onChange={e => setMkNote(e.target.value)} placeholder="施肥、浇水、病虫害…" />
        </FormField>
      </Sheet>
    </>
  );
}
