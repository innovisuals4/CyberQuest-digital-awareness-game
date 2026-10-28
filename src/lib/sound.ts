let ctx: AudioContext | null = null;
function getCtx() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    try { ctx = new (window.AudioContext || (window as any).webkitAudioContext)(); } catch { ctx = null; }
  }
  return ctx;
}

export function playTone(freq: number, duration = 0.15, type: OscillatorType = 'sine', gain = 0.12) {
  const c = getCtx();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.value = gain;
  o.connect(g).connect(c.destination);
  o.start();
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);
  o.stop(c.currentTime + duration);
}

export const sfx = {
  click: () => playTone(440, 0.06, 'square', 0.06),
  correct: () => { playTone(660, 0.1, 'sine', 0.12); setTimeout(() => playTone(880, 0.12, 'sine', 0.12), 90); },
  wrong: () => playTone(220, 0.2, 'sawtooth', 0.12),
  levelUp: () => { [523,659,784,1047].forEach((f,i)=>setTimeout(()=>playTone(f,0.15,'sine',0.14), i*120)); },
  gameover: () => { [392,330,262].forEach((f,i)=>setTimeout(()=>playTone(f,0.2,'sawtooth',0.12), i*150)); },
};
