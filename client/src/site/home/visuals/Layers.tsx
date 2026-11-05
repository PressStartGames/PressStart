import type { CSSProperties } from 'react';
import { field } from '../../../content';
import { pairs } from '../../text';
import styles from './Visuals.module.css';

const ID = 'site-strength-ownership';
const TONES = [styles.plateGame, styles.plateEngine];

// What a game is made of, as an exploded stack: your game on top, the engine's crates beneath.
// The final state is exploded; the scrub starts it collapsed (data-layer = how far each plate travels).
export function Layers() {
  const layers = pairs(ID, 'layers');
  return (
    <figure className={styles.screen}>
      <figcaption className={styles.plate}>
        <span>{field(ID, 'screen')}</span>
      </figcaption>
      <ol className={styles.stack}>
        {layers.map((l, i) => (
          <li
            key={l.key}
            className={styles.layer}
            data-layer={((layers.length - 1) / 2 - i) * 74}
            style={{ '--i': i } as CSSProperties}
          >
            <span className={`${styles.slab} ${TONES[i] ?? ''}`} aria-hidden="true" />
            <span className={styles.layerText}>
              <b>{l.key}</b>
              <span>{l.value}</span>
            </span>
          </li>
        ))}
      </ol>
    </figure>
  );
}
