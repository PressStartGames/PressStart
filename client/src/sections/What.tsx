import { Reveal } from '../components/Reveal';
import { field, section, splitLead } from '../content';
import { Inline } from '../content/inline';
import styles from './What.module.css';

const VERBS = ['query', 'command', 'capture', 'control'];

export function What() {
  const s = section('what');
  const cards = s.blocks
    .filter((b) => b.type === 'p')
    .map((b) => splitLead(b.type === 'p' ? b.text : ''));
  return (
    <section id="what" className="section" aria-labelledby="what-title">
      <div className="column">
        <Reveal className="section-head">
          <h2 id="what-title">{field('what', 'headline')}</h2>
        </Reveal>
      </div>
      <div className={`breakout ${styles.grid}`}>
        {cards.map((c, i) => (
          <Reveal key={c.lead} className={styles.card} delay={i * 110}>
            <h3 className={styles.lead}>{c.lead}</h3>
            <p>
              <Inline text={c.rest} />
            </p>
          </Reveal>
        ))}
      </div>
      <Reveal className={`column ${styles.diagramWrap}`} delay={200} aria-hidden="true">
        <svg className={styles.diagram} viewBox="0 0 760 220" fill="none">
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M0 0 L10 5 L0 10 z" className={styles.arrowHead} />
            </marker>
          </defs>
          {['document', 'plugin', 'running world'].map((label, i) => (
            <g key={label} transform={`translate(${80 + i * 300} 70)`}>
              <rect x="-70" y="-30" width="140" height="60" rx="10" className={styles.box} />
              <text textAnchor="middle" dominantBaseline="middle" className={styles.boxLabel}>
                {label}
              </text>
            </g>
          ))}
          <path d="M150 70 H 310" className={styles.wire} markerEnd="url(#arrow)" />
          <path d="M450 70 H 610" className={styles.wire} markerEnd="url(#arrow)" />
          <path
            d="M680 100 C 680 190, 80 190, 80 100"
            className={`${styles.wire} ${styles.loop}`}
            markerEnd="url(#arrow)"
          />
          {VERBS.map((v, i) => (
            <text key={v} x={190 + i * 128} y="172" textAnchor="middle" className={styles.verb}>
              {v}
            </text>
          ))}
          <text x="380" y="205" textAnchor="middle" className={styles.wireLabel}>
            the wire, back to the agent
          </text>
        </svg>
      </Reveal>
    </section>
  );
}
