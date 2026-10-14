import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause } from 'lucide-react';

interface VideoHeroBackgroundProps {
  posterImage?: string;
}

export const VideoHeroBackground: React.FC<VideoHeroBackgroundProps> = ({
  posterImage = '/images/hero_sacred_banyan_canopy_1791992156867.jpg',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 650);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particles representing floating leaves and golden sunbeam motes
    interface LeafMote {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      angle: number;
      angularSpeed: number;
      opacity: number;
      color: string;
    }

    const leavesCount = 28;
    const leaves: LeafMote[] = [];
    const colors = ['#C6A96B', '#A8B89A', '#689F38', '#DFC488', '#E8F5E9'];

    for (let i = 0; i < leavesCount; i++) {
      leaves.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 4 + Math.random() * 8,
        speedY: 0.3 + Math.random() * 0.6,
        speedX: -0.4 + Math.random() * 0.8,
        angle: Math.random() * Math.PI * 2,
        angularSpeed: (Math.random() - 0.5) * 0.02,
        opacity: 0.2 + Math.random() * 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    // Light ray pulse variable
    let rayOffset = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle dynamic sunbeam rays sweeping softly from top-right
      rayOffset += 0.005;
      const rayAlpha = 0.08 + Math.sin(rayOffset) * 0.03;
      const rayGrad = ctx.createLinearGradient(width * 0.8, 0, width * 0.3, height);
      rayGrad.addColorStop(0, `rgba(255, 236, 179, ${rayAlpha * 1.5})`);
      rayGrad.addColorStop(0.5, `rgba(198, 169, 107, ${rayAlpha})`);
      rayGrad.addColorStop(1, 'rgba(24, 61, 43, 0)');

      ctx.fillStyle = rayGrad;
      ctx.beginPath();
      ctx.moveTo(width * 0.6, 0);
      ctx.lineTo(width, 0);
      ctx.lineTo(width * 0.8, height);
      ctx.lineTo(width * 0.2, height);
      ctx.closePath();
      ctx.fill();

      // Render floating translucent leaves
      for (const leaf of leaves) {
        ctx.save();
        ctx.translate(leaf.x, leaf.y);
        ctx.rotate(leaf.angle);
        ctx.fillStyle = leaf.color;
        ctx.globalAlpha = leaf.opacity;

        // Draw leaf shape
        ctx.beginPath();
        ctx.moveTo(0, -leaf.size);
        ctx.bezierCurveTo(leaf.size * 0.8, -leaf.size * 0.5, leaf.size * 0.8, leaf.size * 0.5, 0, leaf.size);
        ctx.bezierCurveTo(-leaf.size * 0.8, leaf.size * 0.5, -leaf.size * 0.8, -leaf.size * 0.5, 0, -leaf.size);
        ctx.fill();
        ctx.restore();

        if (isPlaying) {
          leaf.y += leaf.speedY;
          leaf.x += leaf.speedX + Math.sin(leaf.angle) * 0.3;
          leaf.angle += leaf.angularSpeed;

          // Wrap around edges
          if (leaf.y > height + 20) {
            leaf.y = -20;
            leaf.x = Math.random() * width;
          }
          if (leaf.x < -20) leaf.x = width + 20;
          if (leaf.x > width + 20) leaf.x = -20;
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isPlaying]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {/* Background Hero Image with slow subtle zoom breathe */}
      <div
        className={`absolute inset-0 bg-cover bg-center transition-transform duration-1000 ${
          isPlaying ? 'scale-105' : 'scale-100'
        }`}
        style={{
          backgroundImage: `url(${posterImage})`,
          transition: 'transform 12s cubic-bezier(0.25, 1, 0.5, 1)',
        }}
      />

      {/* Elegant Atmospheric Gradient Scrim (Deep Forest & Charcoal overlay for WCAG AA readability) */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#183D2B] via-[#0F271B]/80 to-[#183D2B]/60" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0F271B]/90 via-[#183D2B]/50 to-transparent" />

      {/* Animated Botanical Leaf & Sunbeam Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-80"
      />

      {/* Motion Play/Pause Control Button */}
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className="pointer-events-auto absolute bottom-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 hover:bg-black/60 text-[#FAF7F0] text-xs font-medium border border-white/20 backdrop-blur-sm transition-colors"
        title={isPlaying ? 'หยุดภาพเคลื่อนไหวพื้นหลังชั่วคราว' : 'เล่นภาพเคลื่อนไหวพื้นหลัง'}
      >
        {isPlaying ? (
          <>
            <Pause className="w-3.5 h-3.5 text-[#C6A96B]" />
            <span>ภาพเคลื่อนไหว</span>
          </>
        ) : (
          <>
            <Play className="w-3.5 h-3.5 text-[#C6A96B]" />
            <span>เล่นภาพ</span>
          </>
        )}
      </button>
    </div>
  );
};
