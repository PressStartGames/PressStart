import type { RefObject } from 'react';
import { finePointer, motionOk, useGsap } from './gsap';

// A magnetic key: within `reach` px of the cursor it pulls toward it, strongly near the centre and
// fading smoothly to nothing at the edge of the field (so the pull is felt as soon as the cursor
// approaches, with no hard boundary), and springs back once the cursor is clear. Pointer events
// only; off under reduced motion and on touch.
export function useMagnet(ref: RefObject<HTMLElement | null>, reach = 260, strength = 0.6) {
  useGsap(
    ({ gsap }) => {
      const el = ref.current;
      if (!el) return;
      const toX = gsap.quickTo(el, 'x', { duration: 0.35, ease: 'power3.out' });
      const toY = gsap.quickTo(el, 'y', { duration: 0.35, ease: 'power3.out' });
      let near = false;
      // The spring-back tween is kept so re-entering the field can cancel it; it must never
      // overwrite the quickTo tweens, or the key stops following after its first release.
      let back: ReturnType<typeof gsap.to> | null = null;
      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const d = Math.hypot(dx, dy);
        const field = reach + Math.max(r.width, r.height) / 2;
        if (d < field) {
          if (back) {
            back.kill();
            back = null;
          }
          near = true;
          // Smooth falloff: full strength at the key, zero at the field's edge.
          const k = 1 - d / field;
          const pull = strength * k * k * (3 - 2 * k);
          toX(dx * pull);
          toY(dy * pull);
        } else if (near) {
          near = false;
          back = gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.45)' });
        }
      };
      window.addEventListener('pointermove', onMove, { passive: true });
      return () => {
        window.removeEventListener('pointermove', onMove);
        back?.kill();
      };
    },
    [],
    () => motionOk() && finePointer(),
  );
}
