'use client';
import { useEffect, useState } from 'react';

export default function Confetti() {
  const [pieces, setPieces] = useState<any[]>([]);
  useEffect(() => {
    setPieces(Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      dur: 2 + Math.random() * 2,
      color: ['#ff4d9d', '#ff7a45', '#54f0b8', '#ffc857', '#c084fc'][i % 5],
      size: 6 + Math.random() * 6,
    })));
  }, []);
  const [show, setShow] = useState(true);
  useEffect(() => { const t = setTimeout(() => setShow(false), 4000); return () => clearTimeout(t); }, []);
  if (!show) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {pieces.map(p => (
        <span
          key={p.id}
          className="absolute top-0"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.4,
            background: p.color,
            animation: `confettiFall ${p.dur}s ease-in ${p.delay}s forwards`,
          }}
        />
      ))}
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
