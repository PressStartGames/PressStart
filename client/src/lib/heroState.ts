import { useSyncExternalStore } from 'react';

// Whether the hero's power-on sequence has handed over, so the main screen's attract mode may start.
// True by default (no-JS, reduced motion, other routes); the hero sets it false while its timeline
// runs and true when it ends.
let ready = true;
const listeners = new Set<() => void>();

export function setHeroReady(value: boolean) {
  if (ready === value) return;
  ready = value;
  listeners.forEach((l) => l());
}

export function useHeroReady(): boolean {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => ready,
    () => true,
  );
}

// Boot.tsx dispatches this on the window when the boot screen has lifted.
export const BOOTED_EVENT = 'ps:booted';
