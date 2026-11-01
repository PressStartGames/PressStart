import { Body } from '../components/Body';
import { Reveal } from '../components/Reveal';
import { field, section } from '../content';
import styles from './Problem.module.css';

const STRANDS = ['script', 'play', 'screenshot', 'guess'];

export function Problem() {
  const s = section('problem');
  return (
    <section id="problem" className={`section ${styles.problem}`} aria-labelledby="problem-title">
      <div className="column">
        <Reveal className="section-head" wipe>
          <h2 id="problem-title">{field('problem', 'headline')}</h2>
        </Reveal>
        <Reveal delay={80}>
          <Body blocks={s.blocks} />
        </Reveal>
        <Reveal className={styles.tangleWrap} delay={160} aria-hidden="true">
          <svg className={styles.tangle} viewBox="0 0 760 150" fill="none">
            <path
              className={styles.strand}
              d="M30 75 C 120 10, 160 140, 250 75 S 330 20, 400 95 S 480 150, 540 70 S 640 10, 730 75"
            />
            <path
              className={`${styles.strand} ${styles.strandB}`}
              d="M30 75 C 100 130, 190 30, 250 75 S 360 140, 400 60 S 470 10, 540 90 S 660 130, 730 75"
            />
            <path
              className={`${styles.strand} ${styles.strandC}`}
              d="M30 75 C 130 70, 170 90, 250 75 S 340 70, 400 78 S 460 72, 540 76 S 650 78, 730 75"
            />
            {STRANDS.map((label, i) => (
              <g key={label} transform={`translate(${30 + i * 233} 75)`}>
                <circle r="5" className={styles.node} />
                <text
                  y="34"
                  textAnchor={i === 0 ? 'start' : i === 3 ? 'end' : 'middle'}
                  className={styles.nodeLabel}
                >
                  {label}
                </text>
              </g>
            ))}
          </svg>
        </Reveal>
      </div>
    </section>
  );
}
