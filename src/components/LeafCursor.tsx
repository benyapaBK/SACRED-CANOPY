import React, { useEffect, useState, useRef } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  opacity: number;
  scale: number;
  rotation: number;
}

let globalParticleCounter = 1;

export const LeafCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const isVisibleRef = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        setIsVisible(true);
      }

      // Spawn a soft drifting leaf sparkle occasionally
      if (Math.random() < 0.12) {
        const newParticle: Particle = {
          id: ++globalParticleCounter,
          x: e.clientX + (Math.random() * 12 - 6),
          y: e.clientY + (Math.random() * 12 - 6),
          opacity: 0.85,
          scale: 0.8 + Math.random() * 0.5,
          rotation: Math.random() * 360,
        };
        setParticles((prev) => [...prev.slice(-12), newParticle]);
      }
    };

    const handleMouseLeave = () => {
      isVisibleRef.current = false;
      setIsVisible(false);
    };
    const handleMouseEnter = () => {
      isVisibleRef.current = true;
      setIsVisible(true);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    const interval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            y: p.y + 1.2,
            opacity: p.opacity - 0.035,
            rotation: p.rotation + 2.5,
          }))
          .filter((p) => p.opacity > 0)
      );
    }, 40);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      clearInterval(interval);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {/* Floating leaf particles */}
      {particles.map((p) => (
        <svg
          key={`leaf-p-${p.id}`}
          className="absolute -translate-x-1/2 -translate-y-1/2 transition-opacity pointer-events-none"
          style={{
            left: `${p.x}px`,
            top: `${p.y}px`,
            opacity: p.opacity,
            transform: `translate(-50%, -50%) rotate(${p.rotation}deg) scale(${p.scale})`,
            width: '22px',
            height: '22px',
          }}
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M12 2C8 2 4 6 4 11c0 5 5 10 8 11 3-1 8-6 8-11 0-5-4-9-8-9z"
            fill="#2E7D32"
            stroke="#DFC488"
            strokeWidth="1.2"
            fillOpacity="0.85"
          />
          <path d="M12 5v13" stroke="#FAF7F0" strokeWidth="1" strokeLinecap="round" />
        </svg>
      ))}

      {/* Gentle leafy follower indicator */}
      <div
        className="absolute w-2.5 h-2.5 rounded-full bg-[#2E7D32]/25 pointer-events-none transition-transform duration-75 ease-out"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translate(-50%, -50%)',
        }}
      />
    </div>
  );
};
