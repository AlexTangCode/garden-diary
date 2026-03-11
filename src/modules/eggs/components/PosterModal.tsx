import React, { useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download } from 'lucide-react';
import { Hen, EggLog } from '../../../types/eggs';

interface PosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  hens: Hen[];
  logs: EggLog[];
  onNotify: (message: string, type?: 'success' | 'info') => void;
}

const PosterModal: React.FC<PosterModalProps> = ({ isOpen, onClose, hens, logs, onNotify }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const weeklyStats = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - (day === 0 ? 6 : day - 1));
    startOfWeek.setHours(0, 0, 0, 0);

    const weekLogs = logs.filter(l => l.timestamp >= startOfWeek.getTime());
    const total = weekLogs.reduce((sum, l) => sum + (l.quantity || 1), 0);

    const henCounts: Record<string, number> = {};
    weekLogs.forEach(l => {
      henCounts[l.henId] = (henCounts[l.henId] || 0) + (l.quantity || 1);
    });

    const dailyCounts: Record<string, number> = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      dailyCounts[key] = 0;
    }
    weekLogs.forEach(l => {
      const d = new Date(l.timestamp);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      if (key in dailyCounts) dailyCounts[key] += (l.quantity || 1);
    });

    const weekLabel = `${startOfWeek.getMonth()+1}/${startOfWeek.getDate()} — ${now.getMonth()+1}/${now.getDate()}`;

    return { total, henCounts, dailyCounts, weekLabel, startOfWeek };
  }, [logs]);

  const handleDownload = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 800, H = 1000;
    canvas.width = W;
    canvas.height = H;

    // Background
    ctx.fillStyle = '#F9F5F0';
    ctx.fillRect(0, 0, W, H);

    // Header band
    const grad = ctx.createLinearGradient(0, 0, W, 200);
    grad.addColorStop(0, '#D48C45');
    grad.addColorStop(1, '#C2974D');
    ctx.fillStyle = grad;
    ctx.beginPath();
    (ctx as any).roundRect?.(40, 40, W-80, 180, 32) ?? ctx.rect(40, 40, W-80, 180);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath(); ctx.arc(W-80, 80, 90, 0, Math.PI*2); ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 48px -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('🥚 本周战报', 80, 120);
    ctx.font = '500 22px -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillText(weeklyStats.weekLabel, 80, 162);

    // Total eggs
    ctx.fillStyle = '#2D2D2D';
    ctx.font = 'bold 28px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('本周总产蛋', W/2, 290);
    ctx.font = 'bold 120px -apple-system, sans-serif';
    ctx.fillStyle = '#D48C45';
    ctx.fillText(String(weeklyStats.total), W/2, 420);
    ctx.font = '500 24px -apple-system, sans-serif';
    ctx.fillStyle = '#A0A0A0';
    ctx.fillText('枚', W/2 + 30 + (weeklyStats.total >= 100 ? 60 : weeklyStats.total >= 10 ? 30 : 10), 395);

    // Daily bar chart
    const days = ['一','二','三','四','五','六','日'];
    const dailyValues = Object.values(weeklyStats.dailyCounts);
    const maxVal = Math.max(...dailyValues, 1);
    const barW = 60, barMaxH = 140, barY = 620;
    const barStartX = (W - days.length * (barW + 20)) / 2 + 10;

    ctx.fillStyle = '#2D2D2D';
    ctx.font = 'bold 22px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('每日产量', W/2, 500);

    days.forEach((day, i) => {
      const val = dailyValues[i] || 0;
      const barH = Math.max(8, (val / maxVal) * barMaxH);
      const x = barStartX + i * (barW + 20);

      // Bar bg
      ctx.fillStyle = '#F0EAE2';
      (ctx as any).roundRect?.(x, barY - barMaxH, barW, barMaxH, 12) ?? ctx.rect(x, barY - barMaxH, barW, barMaxH);
      ctx.fill();

      // Bar fill
      ctx.fillStyle = val > 0 ? '#D48C45' : '#E5D3C5';
      (ctx as any).roundRect?.(x, barY - barH, barW, barH, 12) ?? ctx.rect(x, barY - barH, barW, barH);
      ctx.fill();

      // Value
      if (val > 0) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(String(val), x + barW/2, barY - barH + 22);
      }

      // Day label
      ctx.fillStyle = '#A0A0A0';
      ctx.font = '500 18px -apple-system, sans-serif';
      ctx.fillText(`周${day}`, x + barW/2, barY + 28);
    });

    // Hen rankings
    if (hens.length > 0) {
      ctx.fillStyle = '#2D2D2D';
      ctx.font = 'bold 22px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🏆 本周产蛋榜', W/2, 720);

      const rankings = Object.entries(weeklyStats.henCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([id, count]) => ({ name: hens.find(h => h.id === id)?.name || '未知', count }));

      rankings.forEach((r, i) => {
        const y = 770 + i * 56;
        const medal = ['🥇','🥈','🥉'][i];
        ctx.fillStyle = i === 0 ? '#D48C45' : '#A0A0A0';
        ctx.font = `${i === 0 ? 'bold' : '500'} 22px -apple-system, sans-serif`;
        ctx.textAlign = 'left';
        ctx.fillText(`${medal} ${r.name}`, 80, y);
        ctx.textAlign = 'right';
        ctx.fillText(`${r.count} 枚`, W-80, y);
      });
    }

    // Footer
    ctx.fillStyle = '#C8B89A';
    ctx.font = '500 18px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("Chloe's Backyard · 产蛋日记", W/2, H - 50);

    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `weekly-report-${weeklyStats.weekLabel.replace(/\//g,'-').replace(' — ','-to-')}.png`;
    a.click();
    onNotify('战报已下载！', 'success');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[400] bg-[#2D2D2D]/30 backdrop-blur-2xl flex items-center justify-center p-8"
        >
          <motion.div
            initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
            className="bg-white rounded-[44px] w-full max-w-sm p-10 shadow-2xl border border-[#E5D3C5]/20 relative"
          >
            <button onClick={onClose} className="absolute top-8 right-8 text-gray-300 hover:text-[#2D2D2D]">
              <X size={24} />
            </button>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#D48C45]/10 rounded-[28px] flex items-center justify-center text-[#D48C45] mx-auto mb-6 text-3xl">🥚</div>
              <h2 className="font-serif text-2xl font-extrabold text-[#2D2D2D] mb-3 tracking-tighter">本周战报</h2>
              <p className="text-[#A0A0A0] text-sm font-medium mb-2 cn-relaxed">{weeklyStats.weekLabel}</p>
              <div className="text-6xl font-bold text-[#D48C45] tabular-nums my-6">{weeklyStats.total}</div>
              <p className="text-[#A0A0A0] text-[11px] font-bold uppercase tracking-widest mb-8 cn-relaxed">枚鸡蛋</p>

              <div className="flex gap-3 justify-center mb-8">
                {Object.values(weeklyStats.dailyCounts).map((v, i) => {
                  const max = Math.max(...Object.values(weeklyStats.dailyCounts), 1);
                  return (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div className="w-8 bg-[#F0EAE2] rounded-xl overflow-hidden" style={{ height: 48 }}>
                        <div className="w-full bg-[#D48C45] rounded-xl transition-all"
                          style={{ height: `${(v / max) * 100}%`, marginTop: `${100 - (v / max) * 100}%` }} />
                      </div>
                      <span className="text-[9px] text-[#A0A0A0] font-bold">{v}</span>
                    </div>
                  );
                })}
              </div>

              <button onClick={handleDownload}
                className="w-full py-5 bg-[#D48C45] text-white rounded-[28px] font-bold text-lg shadow-xl shadow-[#D48C45]/20 flex items-center justify-center gap-3 cn-relaxed">
                <Download size={22} /> 下载战报
              </button>
            </div>
          </motion.div>
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PosterModal;
