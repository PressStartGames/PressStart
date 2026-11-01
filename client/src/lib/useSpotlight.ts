import type { PointerEvent } from 'react';

// Pointer-driven card light and tilt: writes --mx/--my (the spotlight centre) and --rx/--ry (a
// small 3D tilt) on the hovered element; base.css's .card reads them. Pointer events only, nothing
// runs between moves, and reduced motion gets no tilt.
const MAX_TILT = 4;

function reduced(): boolean {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function spotlightHandlers() {
  return {
    onPointerMove(e: PointerEvent<HTMLElement>) {
      const el = e.currentTarget;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      el.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
      el.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
      if (reduced()) return;
      el.style.setProperty('--rx', `${((x - 0.5) * 2 * MAX_TILT).toFixed(2)}deg`);
      el.style.setProperty('--ry', `${((0.5 - y) * 2 * MAX_TILT).toFixed(2)}deg`);
    },
    onPointerLeave(e: PointerEvent<HTMLElement>) {
      const el = e.currentTarget;
      el.style.removeProperty('--rx');
      el.style.removeProperty('--ry');
    },
  };
}
