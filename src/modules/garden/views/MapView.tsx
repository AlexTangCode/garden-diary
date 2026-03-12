import { useState, useRef, useEffect, useCallback } from 'react';
import type { Plot, Marker, MarkerStatus } from '@/types/garden';
import { savePlot, saveMarker, deleteMarker, newId } from '@/services/garden.firebase';
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
type EditMode = null | 'add' | 'move';

export default function MapView({ plots, markers, curPlot, setCurPlot }: Props) {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const imgRef      = useRef<HTMLImageElement | null>(null);
  const fileRef     = useRef<HTMLInputElement>(null);
  const dragRef     = useRef<{ idx: number; offX: number; offY: number } | null>(null);

  // swipe-to-change-plot on canvas
  const swipeStartX = useRef<number | null>(null);
  const swipeStartY = useRef<number | null>(null);

  const [editMode,    setEditMode]    = useState<EditMode>(null);
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
  const today  = () => new Date().toISOString().slice(0, 10);

  // ── switch plot by index offset ──
  const switchPlot = useCallback((dir: 1 | -1) => {
    if (!plots.length) return;
    const idx = plots.findIndex(p => p.id === curPlot);
    const next = (idx + dir + plots.length) % plots.length;
    setCurPlot(plots[next].id);
  }, [plots, curPlot, setCurPlot]);

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
      ctx.shadowColor = 'rgba(44,32,24,.3)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 3;
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
    if (editMode) {
      ctx.save();
      ctx.strokeStyle = 'rgba(200,132,90,0.5)';
      ctx.lineWidth = 3; ctx.setLineDash([8, 5]);
      ctx.strokeRect(2, 2, cv.width - 4, cv.height - 4);
      ctx.restore();
    }
  }, [plotMk, pl, editMode]);

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
    else { imgRef.current = null; }
  }, [pl?.id, pl?.image]);

  const getPos = (clientX: number, clientY: number) => {
    const cv = canvasRef.current!;
    const r  = cv.getBoundingClientRect();
    return { x: (clientX - r.left) * (cv.width / r.width), y: (clientY - r.top) * (cv.height / r.height) };
  };

  const hitTest = (px: number, py: number) => {
    for (let i = plotMk.length - 1; i >= 0; i--) {
      const mx = plotMk[i].x * canvasRef.current!.width;
      const my = plotMk[i].y * canvasRef.current!.height;
      if (Math.hypot(px - mx, py - my) < 20) return i;
    }
    return -1;
  };

  // ── canvas touch handlers — swipe when not in edit mode ──
  const handleCanvasTouchStart = (e: React.TouchEvent) => {
    swipeStartX.current = e.touches[0].clientX;
    swipeStartY.current = e.touches[0].clientY;
    if (editMode) {
      // in edit mode also track drag
      const t = e.touches[0];
      const p = getPos(t.clientX, t.clientY);
      if (editMode === 'move') {
        const i = hitTest(p.x, p.y);
        if (i !== -1) {
          dragRef.current = { idx: i, offX: p.x - plotMk[i].x * canvasRef.current!.width, offY: p.y - plotMk[i].y * canvasRef.current!.height };
        }
      }
    }
    e.preventDefault();
  };

  const handleCanvasTouchEnd = (e: React.TouchEvent) => {
    if (swipeStartX.current === null || swipeStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - swipeStartX.current;
    const dy = e.changedTouches[0].clientY - swipeStartY.current;
    swipeStartX.current = null;
    swipeStartY.current = null;
    dragRef.current = null;

    if (!editMode) {
      // Swipe left/right to change plot (ignore vertical swipes)
      if (Math.abs(dx) > 50 && Math.abs(dy) < Math.abs(dx) * 0.6) {
        if (plots.length > 1) switchPlot(dx < 0 ? 1 : -1);
        return;
      }
      // Short tap → no-op in browse mode
      return;
    }

    // In edit mode: tap (short movement) triggers add/edit
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
      const t = e.changedTouches[0];
      const p = getPos(t.clientX, t.clientY);
      if (editMode === 'add') {
        const hit = hitTest(p.x, p.y);
        if (hit !== -1) { openMarker(plotMk[hit].id); }
        else { setPendingXY({ x: p.x / canvasRef.current!.width, y: p.y / canvasRef.current!.height }); openMarker(null); }
      }
    }
  };

  const handleCanvasTouchMove = (e: React.TouchEvent) => {
    if (editMode !== 'move' || !dragRef.current) return;
    e.preventDefault();
    const t = e.touches[0];
    const p = getPos(t.clientX, t.clientY);
    const cv = canvasRef.current!;
    const mk = plotMk[dragRef.current.idx];
    const nx = Math.max(0.01, Math.min(0.99, (p.x - dragRef.current.offX) / cv.width));
    const ny = Math.max(0.01, Math.min(0.99, (p.y - dragRef.current.offY) / cv.height));
    saveMarker({ ...mk, x: nx, y: ny });
  };

  // mouse handlers (desktop)
  const onMouseDown = (e: React.MouseEvent) => {
    if (!editMode) return;
    const p = getPos(e.clientX, e.clientY);
    if (editMode === 'add') {
      const hit = hitTest(p.x, p.y);
      if (hit !== -1) { openMarker(plotMk[hit].id); }
      else { setPendingXY({ x: p.x / canvasRef.current!.width, y: p.y / canvasRef.current!.height }); openMarker(null); }
    } else {
      const i = hitTest(p.x, p.y);
      if (i !== -1) dragRef.current = { idx: i, offX: p.x - plotMk[i].x * canvasRef.current!.width, offY: p.y - plotMk[i].y * canvasRef.current!.height };
    }
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (editMode !== 'move' || !dragRef.current) return;
    const cv = canvasRef.current!; const p = getPos(e.clientX, e.clientY);
    const mk = plotMk[dragRef.current.idx];
    saveMarker({ ...mk, x: Math.max(0.01, Math.min(0.99, (p.x - dragRef.current.offX) / cv.width)), y: Math.max(0.01, Math.min(0.99, (p.y - dragRef.current.offY) / cv.height)) });
  };
  const onMouseUp = () => { dragRef.current = null; };

  const openAddPlot = () => {
    setPlotName(''); setPlotNote('');
    setPlotColor(COLORS[plots.length % COLORS.length]);
    setShowAddPlot(true);
  };

  const handleSavePlot = async () => {
    if (!plotName.trim()) return;
    const p: Plot = { id: newId(), name: plotName.trim(), note: plotNote.trim(), color: plotColor, image: null, createdAt: Date.now() };
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
      setMkVeg(''); setMkVar(''); setMkStatus('🌱 播种'); setMkDate(today()); setMkNote('');
    }
    setEditMkId(id); setShowMarker(true);
  };

  const handleSaveMarker = async () => {
    if (!mkVeg.trim() || !curPlot) return;
    const base = { plotId: curPlot, name: mkVeg.trim(), variety: mkVar.trim(), status: mkStatus, date: mkDate, note: mkNote.trim() };
    if (editMkId) {
      await saveMarker({ ...markers.find(m => m.id === editMkId)!, ...base });
    } else {
      await saveMarker({ id: newId(), createdAt: Date.now(), x: pendingXY.x, y: pendingXY.y, ...base });
    }
    setShowMarker(false);
  };

  const handleDelMarker = async () => {
    if (!editMkId || !window.confirm('删除此标注？')) return;
    await deleteMarker(editMkId); setShowMarker(false);
  };

  const handleImg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f || !pl) return;
    const r = new FileReader();
    r.onload = async ev => { await savePlot({ ...pl, image: ev.target!.result as string }); };
    r.readAsDataURL(f); e.target.value = '';
  };

  const btnStyle = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: '9px 0', borderRadius: 'var(--r-sm)',
    fontSize: 13, fontWeight: 700, transition: 'all .18s',
    background: active ? 'var(--acc)' : 'var(--card)',
    color: active ? '#fff' : 'var(--t3)',
    boxShadow: active ? '0 4px 14px rgba(200,132,90,.3)' : 'var(--sh)',
    border: active ? 'none' : '1.5px solid var(--bg2)',
  });

  return (
    <>
      <div style={{
        position: 'absolute', inset: 0,
        overflowY: 'auto', WebkitOverflowScrolling: 'touch' as never,
        paddingBottom: 16,
      }}>
        {/* ── Page header — pixel-identical to Chloe's Chicken ── */}
        <header style={{
          paddingTop: 40, paddingBottom: 16,        /* pt-10 pb-4 */
          paddingLeft: 40, paddingRight: 40,         /* px-10 */
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', zIndex: 20,
        }}>
          <h2 style={{
            fontFamily: 'Georgia, "Times New Roman", serif', /* font-serif */
            fontSize: 20,                                     /* text-xl */
            fontWeight: 800,                                  /* font-extrabold */
            letterSpacing: '0.15em',                         /* tracking-[0.15em] */
            color: '#D48C45',                                 /* text-[#D48C45] */
            opacity: 0.6,                                     /* opacity-60 */
            margin: 0,
          }}>
            Yi's Garden
          </h2>
        </header>

        {/* Stats */}
        <div style={{
          background: 'var(--card)', borderRadius: 'var(--r-lg)',
          margin: '0 16px 12px', display: 'flex', boxShadow: 'var(--sh)', overflow: 'hidden',
        }}>
          {[{ label: '📍 菜地数', val: plots.length }, { label: '🌿 标注数', val: plotMk.length }].map((s, i) => (
            <div key={i} style={{
              flex: 1, padding: '14px', textAlign: 'center',
              ...(i > 0 ? { borderLeft: '1px solid rgba(44,32,24,.08)' } : {}),
            }}>
              <div style={{ fontSize: 12, color: 'var(--acc)', fontWeight: 700, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: -2, lineHeight: 1, color: 'var(--t1)' }}>{s.val}</div>
            </div>
          ))}
        </div>

        {plots.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 24px' }}>
            <div style={{ fontSize: 54 }}>🌱</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginTop: 14 }}>还没有菜地</div>
            <div style={{ fontSize: 14, color: 'var(--t2)', marginTop: 6 }}>点击下方「＋ 添加菜地」开始</div>
            <button onClick={openAddPlot} style={{
              marginTop: 20, padding: '11px 28px', borderRadius: 'var(--r-xl)',
              background: 'var(--acc)', color: '#fff', fontSize: 14, fontWeight: 700,
              boxShadow: '0 4px 14px rgba(200,132,90,.35)',
            }}>＋ 添加菜地</button>
          </div>
        ) : (
          <>
            {/* Plot chips + swipe hint */}
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
              }}>＋ 添加菜地</button>
            </div>

            {/* Toolbar */}
            <div style={{ display: 'flex', gap: 8, padding: '4px 16px 8px', alignItems: 'center' }}>
              <button onClick={() => setEditMode(m => m === 'add' ? null : 'add')} style={btnStyle(editMode === 'add')}>
                ✚ 添加标注
              </button>
              <button onClick={() => setEditMode(m => m === 'move' ? null : 'move')} style={btnStyle(editMode === 'move')}>
                ⤢ 移动
              </button>
              <button onClick={() => fileRef.current?.click()} style={{
                width: 40, height: 40, borderRadius: 'var(--r-sm)',
                background: 'var(--card)', boxShadow: 'var(--sh)', fontSize: 17,
                border: '1.5px solid var(--bg2)',
              }}>🖼</button>
              <button onClick={async () => {
                if (!plotMk.length || !window.confirm('清空所有标注？')) return;
                for (const m of plotMk) await deleteMarker(m.id);
              }} style={{
                width: 40, height: 40, borderRadius: 'var(--r-sm)',
                background: 'var(--card)', boxShadow: 'var(--sh)', fontSize: 17,
                color: 'var(--red)', border: '1.5px solid var(--bg2)',
              }}>🗑</button>
            </div>

            {/* Canvas — swipe left/right to switch plot when not editing */}
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
              <div style={{ margin: '0 16px', borderRadius: 'var(--r-lg)', overflow: 'hidden', boxShadow: 'var(--sh2)', background: 'var(--card)', position: 'relative' }}>
                <canvas
                  ref={canvasRef}
                  style={{
                    display: 'block', width: '100%',
                    cursor: editMode === null ? 'default' : editMode === 'move' ? 'grab' : 'crosshair',
                  }}
                  onMouseDown={onMouseDown}
                  onMouseMove={onMouseMove}
                  onMouseUp={onMouseUp}
                  onTouchStart={handleCanvasTouchStart}
                  onTouchMove={handleCanvasTouchMove}
                  onTouchEnd={handleCanvasTouchEnd}
                />
                {/* Plot swipe hint dots */}
                {plots.length > 1 && (
                  <div style={{
                    position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
                    display: 'flex', gap: 5, pointerEvents: 'none',
                  }}>
                    {plots.map(p => (
                      <div key={p.id} style={{
                        width: p.id === curPlot ? 14 : 5, height: 5, borderRadius: 3,
                        background: p.id === curPlot ? '#fff' : 'rgba(255,255,255,0.5)',
                        transition: 'all .25s',
                      }} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
        <div style={{ height: 16 }} />
      </div>

      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImg} />

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
              }} />
            ))}
          </div>
        </FormField>
        <FormField label="备注（可选）">
          <input style={inputStyle} value={plotNote} onChange={e => setPlotNote(e.target.value)} />
        </FormField>
      </Sheet>

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
          <input style={inputStyle} value={mkVeg} onChange={e => setMkVeg(e.target.value)} placeholder="番茄、黄瓜、辣椒…" list="vdl-map" autoFocus />
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
