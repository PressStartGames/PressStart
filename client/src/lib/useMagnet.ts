import type { RefObject } from 'react';
import { finePointer, motionOk, useGsap } from './gsap';

// A magnetic key: within `reach` px of the cursor it pulls toward it (a third of the way) and
// springs back when the cursor leaves. Pointer events only; off under reduced motion and on touch.
export function useMagnet(ref: RefObject<HTMLElement | null>, reach = 80) {
  useGsap(
    ({ gsap }) => {
      const el = ref.current;
      if (!el) return;
      const toX = gsap.quickTo(el, 'x', { duration: 0.35, ease: 'power3.out' });
      const toY = gsap.quickTo(el, 'y', { duration: 0.35, ease: 'power3.out' });
      let near = false;
      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const d = Math.hypot(dx, dy);
        const inside = d < reach + Math.max(r.width, r.height) / 2;
        if (inside) {
          near = true;
          toX(dx * 0.35);
          toY(dy * 0.35);
        } else if (near) {
          near = false;
          gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.45)', overwrite: true });
        }
      };
      window.addEventListener('pointermove', onMove, { passive: true });
      return () => window.removeEventListener('pointermove', onMove);
    },
    [],
    () => motionOk() && finePointer(),
  );
}
