import type { CSSProperties } from 'react';

// CSS custom properties as a style object (`style={vars({ '--enter-delay': '120ms' })}`).
export function vars(v: Record<`--${string}`, string | number>): CSSProperties {
  return v as CSSProperties;
}
