import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, ChevronUp, ChevronDown, Move } from 'lucide-react';

type Position = { x: number; y: number };

export const SiteAudio: React.FC<{ page: string }> = ({ page }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [enabled, setEnabled] = useState(() => localStorage.getItem('sc-audio-enabled') === 'true');
  const [volume, setVolume] = useState(() => Number(localStorage.getItem('sc-audio-volume') || '0.08'));
  const [open, setOpen] = useState(false);
  const excluded = ['contact', 'help', 'admin'].includes(page);
  const [position, setPosition] = useState<Position>(() => {
    try {
      const saved = localStorage.getItem('sc-audio-position');
      if (saved) return JSON.parse(saved) as Position;
    } catch { /* use a subtle default position */ }
    return { x: Math.max(8, window.innerWidth - 300), y: Math.max(8, window.innerHeight - 68) };
  });
  const dragRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);

  const startDrag = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = { startX: e.clientX, startY: e.clientY, originX: position.x, originY: position.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const moveDrag = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragRef.current) return;
    const d = dragRef.current;
    setPosition({
      x: Math.min(Math.max(8, d.originX + e.clientX - d.startX), Math.max(8, window.innerWidth - 100)),
      y: Math.min(Math.max(8, d.originY + e.clientY - d.startY), Math.max(8, window.innerHeight - 44)),
    });
  };
  const endDrag = () => { dragRef.current = null; };

  useEffect(() => {
    try { localStorage.setItem('sc-audio-position', JSON.stringify(position)); } catch { /* storage may be disabled */ }
  }, [position]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = Math.min(0.25, Math.max(0, volume));
    audio.loop = true;
    if (excluded || !enabled) { audio.pause(); return; }
    const start = () => { void audio.play().catch(() => {}); };
    start();
    window.addEventListener('pointerdown', start, { once: true });
    window.addEventListener('keydown', start, { once: true });
    return () => {
      window.removeEventListener('pointerdown', start);
      window.removeEventListener('keydown', start);
    };
  }, [enabled, excluded, volume]);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    localStorage.setItem('sc-audio-enabled', String(next));
  };

  if (excluded) return <audio ref={audioRef} src="/audio/SousdBG-greenweb.mp3" preload="none" loop />;

  return <>
    <audio ref={audioRef} src="/audio/SousdBG-greenweb.mp3" preload="none" loop />
    <div className="fixed z-40 flex items-center gap-1.5" style={{ left: position.x, top: position.y }}>
      <div className={`absolute bottom-full left-0 mb-2 origin-bottom-left transition-all duration-200 ${open ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'}`}>
        <div className="w-56 rounded-2xl border border-[#C6A96B]/35 bg-[#FAF7F0]/95 backdrop-blur-md p-4 shadow-[0_10px_30px_rgba(15,39,27,0.16)]">
          <div className="text-xs font-bold text-[#183D2B]">เสียงบรรยากาศสวน</div>
          <p className="mt-1 text-[10px] text-[#7A746B]">เสียงคลอเบา ๆ ปรับได้ตามต้องการ</p>
          <div className="mt-3 flex items-center gap-2">
            <VolumeX className="h-3.5 w-3.5 text-[#7A746B]" />
            <input aria-label="ระดับเสียง" type="range" min="0" max="0.25" step="0.01" value={volume} onChange={e => { const v = Number(e.target.value); setVolume(v); localStorage.setItem('sc-audio-volume', String(v)); }} className="w-full accent-[#183D2B]" />
            <Volume2 className="h-3.5 w-3.5 text-[#183D2B]" />
          </div>
          <button onClick={toggle} className="mt-3 w-full rounded-lg bg-[#183D2B] px-3 py-2 text-xs font-bold text-white hover:bg-[#25523B]">{enabled ? 'ปิดเสียงเพลง' : 'เปิดเสียงเพลง'}</button>
        </div>
      </div>
      <button onClick={() => setOpen(v => !v)} aria-label="ตั้งค่าเสียงพื้นหลัง" title="เสียงสวน" className="flex h-8 items-center gap-1.5 rounded-full border border-[#C6A96B]/35 bg-[#183D2B]/65 px-2.5 text-[11px] font-medium text-[#FAF7F0]/90 shadow-sm backdrop-blur-md opacity-75 transition hover:opacity-100 hover:bg-[#183D2B]/85">
        {enabled ? <Volume2 className="h-3.5 w-3.5 text-[#C6A96B]" /> : <VolumeX className="h-3.5 w-3.5 text-[#C6A96B]" />}
        <span>เสียงสวน</span>
        {open ? <ChevronDown className="h-3 w-3 opacity-70" /> : <ChevronUp className="h-3 w-3 opacity-70" />}
      </button>
      <button type="button" title="ลากเพื่อย้ายแผงเสียง" aria-label="ลากเพื่อย้ายแผงเสียง" onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag} className="flex h-6 w-6 items-center justify-center rounded-full border border-[#C6A96B]/25 bg-[#FAF7F0]/55 text-[#183D2B]/65 shadow-sm backdrop-blur-sm cursor-move touch-none opacity-35 transition hover:opacity-90">
        <Move className="h-3 w-3" />
      </button>
    </div>
  </>;
};
