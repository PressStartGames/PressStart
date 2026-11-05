import { field, splitLead, splitList } from '../../content';
import { Inline } from '../../content/inline';
import { items, paragraphs } from '../lib/copy';
import { useInView } from '../lib/useInView';
import { vars } from '../lib/vars';
import { SectionHead } from '../ui/SectionHead';
import ui from '../ui/ui.module.css';
import { FeatureArt, type ArtName } from './FeatureArt';
import styles from './Features.module.css';

const ART: readonly ArtName[] = ['verbs', 'docs', 'ticks', 'pixels', 'modes', 'offline'];

function Card({ index, text, road }: { index: number; text: string; road: boolean }) {
  const [ref, seen] = useInView<HTMLLIElement>();
  const { lead, rest } = splitLead(text);
  const tag = field('site-features', road ? 'road' : 'today');
  return (
    <li
      ref={ref}
      className={`${styles.card} ${road ? styles.road : ''} reveal`}
      data-visible={seen || undefined}
      data-seen={seen || undefined}
      style={vars({ '--reveal-delay': `${(index % 2) * 90}ms` })}
    >
      <FeatureArt name={ART[index] ?? 'verbs'} />
      <div className={styles.body}>
        <span className={`${ui.tag} ${road ? ui.tagRoad : ''}`}>{tag}</span>
        <h3 className={styles.cardTitle}>{lead}</h3>
        <p className={styles.cardText}>
          <Inline text={rest} />
        </p>
      </div>
    </li>
  );
}

// "Made for building games with an AI": six cards, four true today and two on the road, each with
// its own small illustration.
export function Features() {
  const id = 'site-features';
  const states = splitList(field(id, 'states'), '|');
  return (
    <section className={`${ui.section} ${ui.wrap}`} aria-labelledby="features-title">
      <SectionHead
        id="features-title"
        kicker={field(id, 'kicker')}
        title={field(id, 'headline')}
        lede={paragraphs(id)[0]}
        tone="blue"
      />
      <ul className={styles.grid}>
        {items(id).map((text, i) => (
          <Card key={i} index={i} text={text} road={states[i] === 'road'} />
        ))}
      </ul>
    </section>
  );
}
