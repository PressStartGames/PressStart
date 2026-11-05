import { useRef } from 'react';
import { counts, field } from '../../content';
import { useGsap } from '../../lib/gsap';
import { paragraphs, rows } from '../lib/copy';
import { SectionHead } from '../ui/SectionHead';
import ui from '../ui/ui.module.css';
import styles from './HiScores.module.css';

const TONES = ['red', 'amber', 'blue', 'green', 'white'] as const;
const PAD = 6;

// The synced counts as an arcade high-score table. Each score is rendered final (no-JS, reduced
// motion); with motion, the digits roll up from zero once when the board scrolls in.
export function HiScores() {
  const id = 'site-scores';
  const board = useRef<HTMLTableSectionElement>(null);
  useGsap(
    ({ gsap }) => {
      const cells = board.current?.querySelectorAll<HTMLElement>('[data-score]');
      if (!cells?.length) return;
      cells.forEach((cell, i) => {
        const value = Number(cell.dataset.score);
        const n = { v: 0 };
        cell.textContent = '0';
        gsap.to(n, {
          v: value,
          duration: 1.6,
          delay: i * 0.12,
          ease: 'power3.out',
          snap: { v: 1 },
          onUpdate: () => {
            cell.textContent = String(n.v);
          },
          scrollTrigger: { trigger: board.current, start: 'top 85%', once: true },
        });
      });
    },
    [],
    undefined,
    true,
  );
  return (
    <section className={`${ui.section} ${ui.wrap} ${styles.section}`} aria-labelledby="scores-title">
      <SectionHead
        id="scores-title"
        kicker={field(id, 'kicker')}
        title={field(id, 'headline')}
        lede={paragraphs(id)[0]}
        tone="green"
      >
        <p className={styles.synced}>
          <span className={styles.syncDot} aria-hidden="true" />
          {counts.syncedAt} · {counts.engineCommit.slice(0, 7)}
        </p>
      </SectionHead>
      <div className={styles.cabinet}>
        <table className={styles.board}>
          <caption className={styles.boardTitle}>{field(id, 'board')}</caption>
          <thead>
            <tr>
              <th scope="col">{field(id, 'score')}</th>
              <th scope="col">{field(id, 'name')}</th>
            </tr>
          </thead>
          <tbody ref={board}>
            {rows(id).map(([value = '', name = '', note = ''], i) => {
              const digits = value.replace(/\D/g, '');
              return (
                <tr key={name} data-tone={TONES[i] ?? 'white'}>
                  <td className={styles.score}>
                    <span className={styles.zeros} aria-hidden="true">
                      {'0'.repeat(Math.max(0, PAD - digits.length))}
                    </span>
                    <span data-score={digits}>{digits}</span>
                  </td>
                  <td>
                    <span className={styles.name}>{name}</span>
                    <span className={styles.note}>{note}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
