import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Pencil, Trash2, Check, X } from 'lucide-react';
import type { Marker, Plot, MarkerStatus } from '../../../types/garden';
import { saveMarker, deleteMarker } from '../../../services/garden.firebase';

interface Props {
  markers: Marker[];
  plots: Plot[];
}

const STATUS_STYLE: Record<MarkerStatus, { color: string; bg: string }> = {
  '🌱 播种': { color: 'var(--green)', bg: 'var(--green-l)' },
  '🌿 生长': { color: 'var(--teal)',  bg: 'var(--teal-l)'  },
  '🌼 收获': { color: 'var(--acc)',   bg: 'var(--acc-bg)'  },
  '✅ 完成': { color: 'var(--blue)',  bg: 'var(--blue-l)'  },
};

const STATUS_EMOJI: Record<MarkerStatus, string> = {
  '🌱 播种': '🌱',
  '🌿 生长': '🌿',
  '🌼 收获': '🌼',
  '✅ 完成': '✅',
};

const STATUSES: MarkerStatus[] = ['🌱 播种', '🌿 生长', '🌼 收获', '✅ 完成'];

const selStyle: React.CSSProperties = {
  padding: '8px 14px',
  background: 'var(--card)', border: 'none', borderRadius: 20,
  fontFamily: 'var(--ff)', fontSize: 13, fontWeight: 600,
  color: 'var(--t1)', boxShadow: 'var(--sh)',
  cursor: 'pointer', outline: 'none', WebkitAppearance: 'none',
};

export default function MarkersListView({ markers, plots }: Props) {
  const [filterPlot,   setFilterPlot]   = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [editingId,    setEditingId]    = useState<string | null>(null);
  const [editStatus,   setEditStatus]   = useState<MarkerStatus>('🌱 播种');

  const pn = (id: string) => plots.find(p => p.id === id)?.name ?? '未知菜地';

  const filtered = markers.filter(m =>
    (!filterPlot   || m.plotId === filterPlot) &&
    (!filterStatus || m.status === filterStatus)
  );

  const openEdit = (m: Marker) => { setEditingId(m.id); setEditStatus(m.status); };

  const handleUpdateStatus = async (m: Marker) => {
    await saveMarker({ ...m, status: editStatus });
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('删除此标注？')) return;
    await deleteMarker(id);
  };

  return (
    <div style={{
      position: 'absolute', inset: 0,
      overflowY: 'auto', WebkitOverflowScrolling: 'touch' as never,
      paddingBottom: 16, animation: 'pgIn .25s ease',
    }}>
      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, padding: '12px 16px', flexWrap: 'wrap' }}>
        <select value={filterPlot} onChange={e => setFilterPlot(e.target.value)} style={selStyle}>
          <option value="">所有菜地</option>
          {plots.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={selStyle}>
          <option value="">所有状态</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {(filterPlot || filterStatus) && (
          <button onClick={() => { setFilterPlot(''); setFilterStatus(''); }} style={{ ...selStyle, color: 'var(--acc)' }}>
            重置
          </button>
        )}
      </div>

      {/* Summary */}
      <div style={{ padding: '0 16px 12px' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '5px 14px', background: 'var(--acc-bg)',
          color: 'var(--acc)', borderRadius: 999, fontSize: 12, fontWeight: 700,
        }}>
          <MapPin size={12} strokeWidth={2.5} />
          共 {filtered.length} 个标注
        </span>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <MapPin size={40} strokeWidth={1.5} color="var(--t4)" />
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--t1)' }}>暂无标注</div>
          <div style={{ fontSize: 14, color: 'var(--t2)', marginTop: 6 }}>在地图页添加标注后显示在这里</div>
        </div>
      ) : (
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <AnimatePresence initial={false}>
            {filtered.map(m => {
              const st = STATUS_STYLE[m.status];
              const isEditing = editingId === m.id;
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  style={{
                    background: 'var(--card)', borderRadius: 'var(--r-lg)',
                    boxShadow: 'var(--sh)', overflow: 'hidden',
                    display: 'flex', alignItems: 'stretch',
                  }}
                >
                  {/* Status stripe */}
                  <div style={{ width: 4, background: st.color, flexShrink: 0 }} />

                  {/* Status emoji badge */}
                  <div style={{ width: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 12, background: st.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                      {STATUS_EMOJI[m.status]}
                    </div>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, padding: '14px 0', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)' }}>{m.name}</span>
                      {m.variety && <span style={{ fontSize: 11, color: 'var(--t2)', fontWeight: 500 }}>({m.variety})</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: st.bg, color: st.color, fontWeight: 700 }}>
                        {m.status}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--t3)', fontWeight: 600 }}>
                        <MapPin size={10} /> {pn(m.plotId)}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--t3)', fontWeight: 600 }}>
                        <Calendar size={10} /> {m.date}
                      </span>
                    </div>
                    {m.note && <p style={{ fontSize: 12, color: 'var(--t2)', marginTop: 6, lineHeight: 1.5 }}>{m.note}</p>}

                    {/* Inline status editor */}
                    {isEditing && (
                      <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {STATUSES.map(s => (
                          <button key={s} onClick={() => setEditStatus(s)} style={{
                            padding: '5px 10px', fontSize: 11, fontWeight: 600,
                            borderRadius: 999,
                            background: editStatus === s ? 'var(--acc)' : 'var(--bg)',
                            color: editStatus === s ? '#fff' : 'var(--t2)',
                            transition: 'all .15s',
                          }}>{s}</button>
                        ))}
                        <button onClick={() => handleUpdateStatus(m)} style={{
                          display: 'flex', alignItems: 'center', gap: 4,
                          padding: '5px 12px', fontSize: 11, fontWeight: 700,
                          borderRadius: 999, background: 'var(--green)', color: '#fff',
                        }}><Check size={12} /> 保存</button>
                        <button onClick={() => setEditingId(null)} style={{
                          display: 'flex', alignItems: 'center', gap: 4,
                          padding: '5px 10px', fontSize: 11, fontWeight: 600,
                          borderRadius: 999, color: 'var(--t3)', background: 'var(--bg)',
                        }}><X size={12} /> 取消</button>
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  {!isEditing && (
                    <div style={{ padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center', justifyContent: 'center' }}>
                      <button onClick={() => openEdit(m)} style={{
                        width: 32, height: 32, borderRadius: 10,
                        background: 'var(--bg)', color: 'var(--t2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Pencil size={14} strokeWidth={2} />
                      </button>
                      <button onClick={() => handleDelete(m.id)} style={{
                        width: 32, height: 32, borderRadius: 10,
                        background: 'var(--red-l)', color: 'var(--red)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Trash2 size={14} strokeWidth={2} />
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
      <div style={{ height: 16 }} />
    </div>
  );
}
