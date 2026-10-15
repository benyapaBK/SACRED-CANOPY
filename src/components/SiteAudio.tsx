import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Pause, Play } from 'lucide-react';

export const SiteAudio: React.FC<{ page: string }> = ({ page }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [enabled, setEnabled] = useState(() => { try { return localStorage.getItem('sc-audio-enabled') === 'true'; } catch { return false; } });
  const [volume, setVolume] = useState(() => { try { return Number(localStorage.getItem('sc-audio-volume') || '0.06'); } catch { return 0.06; } });
  const excluded = ['contact', 'help', 'admin'].includes(page);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = Math.min(0.15, Math.max(0, volume));
    audio.loop = true;
    if (excluded || !enabled) { audio.pause(); return; }
    const start = () => { void audio.play().catch(() => {}); };
    start();
    window.addEventListener('pointerdown', start, { once: true });
    window.addEventListener('keydown', start, { once: true });
    return () => { window.removeEventListener('pointerdown', start); window.removeEventListener('keydown', start); };
  }, [enabled, excluded, volume]);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    try { localStorage.setItem('sc-audio-enabled', String(next)); } catch { /* storage unavailable */ }
  };
  const changeVolume = (value: number) => {
    setVolume(value);
    try { localStorage.setItem('sc-audio-volume', String(value)); } catch { /* storage unavailable */ }
  };

  if (excluded) return <audio ref={audioRef} src="/audio/SousdBG-greenweb.mp3" preload="none" loop />;
  return <>
    <audio ref={audioRef} src="/audio/SousdBG-greenweb.mp3" preload="none" loop />
    <div aria-label="ควบคุมเสียงพื้นหลัง" className="fixed z-40 flex items-center gap-2 rounded-full border border-[#C6A96B]/25 bg-[#183D2B]/55 px-2.5 py-1.5 text-[#FAF7F0]/85 shadow-sm backdrop-blur-md opacity-65 transition-opacity hover:opacity-100 focus-within:opacity-100" style={{ right: 'clamp(18px, 3vw, 34px)', bottom: '8px' }}>
      <button type="button" onClick={toggle} aria-label={enabled ? 'หยุดเสียงเพลง' : 'เล่นเสียงเพลงต่อ'} title={enabled ? 'หยุดเสียงเพลง' : 'เล่นเสียงเพลงต่อ'} className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-white/10">
        {enabled ? <Pause className="h-3.5 w-3.5 text-[#DFC488]" /> : <Play className="h-3.5 w-3.5 text-[#DFC488]" />}
      </button>
      {enabled ? <Volume2 className="h-3 w-3 text-[#DFC488]" /> : <VolumeX className="h-3 w-3 text-[#DFC488]" />}
      <input aria-label="ระดับเสียงพื้นหลัง" title="ปรับระดับเสียง" type="range" min="0" max="0.15" step="0.005" value={volume} onChange={e => changeVolume(Number(e.target.value))} className="w-16 accent-[#C6A96B]" />
    </div>
  </>;
};
