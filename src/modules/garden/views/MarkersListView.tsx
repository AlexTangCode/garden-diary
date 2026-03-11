import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

const STATUSES: MarkerStatus[] = ['🌱 播种', '🌿 生长', '🌼 收获', '✅ 完成'];

export default function MarkersListView({ markers, plots }: Props) {
  const [filterPlot, setFilterPlot] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<MarkerStatus>('🌱 播种');

  const pn = (id: string) => plots.find(p => p.id === id)?.name ?? '未知菜地';

  const filtered = markers.filter(m =>
    (!filterPlot   || m.plotId === filterPlot) &&
    (!filterStatus || m.status === filterStatus)
  );

  const openEdit = (m: Marker) => {
    setEditingId(m.id);
    setEditStatus(m.status);
  };

  const handleUpdateStatus = async (m: Marker) => {
    await saveMarker({ ...m, status: editStatus });
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('删除此标注？')) return;
    await deleteMarker(id);
  };

  const selStyle: React.CSSProperties = {
    padding: '7px 12px',
    background: 'var(--card)',
    border: 'none',
    borderRadius: 'var(--r-xl)',
    fontFamily: 'var(--ff)',
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--t1)',
    boxShadow: 'var(--sh)',
    cursor: 'pointer',
    outline: 'none',
  };

  return (
    <div style={{
      position: 'absolute', inset: 0,
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch',
      paddingBottom: 'calc(var(--tab-h) + var(--safe-b) + 16px)',
      animation: 'pgIn .25s ease',
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

      {/* Summary badge */}
      <div style={{ padding: '0 16px 12px' }}>
        <span style={{
          display: 'inline-block',
          padding: '4px 12px',
          background: 'var(--acc-bg)',
          color: 'var(--acc)',
          borderRadius: 'var(--r-xl)',
          fontSize: 12,
          fontWeight: 700,
        }}>
          共 {filtered.length} 个标注
        </span>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          color: 'var(--t3)', fontSize: 14,
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📍</div>
          暂无标注
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
                    background: 'var(--card)',
                    borderRadius: 'var(--r-md)',
                    padding: '14px 16px',
                    boxShadow: 'var(--sh)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                  }}
                >
                  {/* Status dot */}
                  <div style={{
                    width: 40, height: 40, borderRadius: 'var(--r-sm)',
                    background: st.bg, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 18, flexShrink: 0,
                  }}>
                    {m.status.split(' ')[0]}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)' }}>{m.name}</span>
                      {m.variety && (
                        <span style={{ fontSize: 11, color: 'var(--t2)', fontWeight: 500 }}>({m.variety})</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: 11, padding: '2px 8px',
                        borderRadius: 'var(--r-xl)',
                        background: st.bg, color: st.color, fontWeight: 600,
                      }}>
                        {m.status}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 500 }}>
                        📍 {pn(m.plotId)}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 500 }}>
                        📅 {m.date}
                      </span>
                    </div>
                    {m.note && (
                      <p style={{ fontSize: 12, color: 'var(--t2)', marginTop: 6 }}>{m.note}</p>
                    )}

                    {/* Inline status editor */}
                    {isEditing && (
                      <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {STATUSES.map(s => (
                          <button key={s} onClick={() => setEditStatus(s)} style={{
                            padding: '5px 10px', fontSize: 11, fontWeight: 600,
                            borderRadius: 'var(--r-xl)',
                            background: editStatus === s ? 'var(--acc)' : 'var(--bg)',
                            color: editStatus === s ? '#fff' : 'var(--t2)',
                            transition: 'all .15s',
                          }}>{s}</button>
                        ))}
                        <button onClick={() => handleUpdateStatus(m)} style={{
                          padding: '5px 12px', fontSize: 11, fontWeight: 700,
                          borderRadius: 'var(--r-xl)',
                          background: 'var(--green)', color: '#fff',
                        }}>保存</button>
                        <button onClick={() => setEditingId(null)} style={{
                          padding: '5px 10px', fontSize: 11, fontWeight: 600,
                          borderRadius: 'var(--r-xl)', color: 'var(--t3)',
                        }}>取消</button>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {!isEditing && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <button onClick={() => openEdit(m)} style={{
                        width: 30, height: 30, borderRadius: 'var(--r-sm)',
                        background: 'var(--bg)', color: 'var(--t2)', fontSize: 14,
                      }}>✏️</button>
                      <button onClick={() => handleDelete(m.id)} style={{
                        width: 30, height: 30, borderRadius: 'var(--r-sm)',
                        background: 'var(--red-l)', color: 'var(--red)', fontSize: 14,
                      }}>🗑</button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
