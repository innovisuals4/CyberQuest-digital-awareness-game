'use client';

/**
 * Static, CSS-driven ambient backdrop.
 * No canvas loop, no random values in render — cheap and hydration-safe.
 */
export default function SignalBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 cq-grid opacity-70" />
      <div className="absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,77,157,0.22),transparent_65%)] blur-2xl" />
      <div className="absolute bottom-[-18rem] right-[-8rem] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(255,122,69,0.18),transparent_65%)] blur-2xl" />
      <div className="absolute inset-0 cq-noise" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-400/40 to-transparent" />
    </div>
  );
}
