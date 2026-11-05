import { useRef, type CSSProperties } from 'react';
import { field } from '../../content';
import { FLAGS, BASE } from '../../lib/config';
import { ROW_TICKS, SIM, checksum, stateAt } from '../../lib/sim';
import { Stage } from '../components/Stage';
import { list, paragraphs, pad } from '../text';
import { useReplay } from '../useReplay';
import ui from '../ui.module.css';
import styles from './Hero.module.css';

const ID = 'site-home';
const delay = (ms: number) => ({ '--enter-delay': `${ms}ms` }) as CSSProperties;

// The opening shot: a full-viewport screen playing the replay simulation, run A solid and run B traced
// over it from the same seed, the checksum timecode running along the bottom. The headline rises in on
// load (transform only, so it paints at once); scrolling sinks the screen into the chassis (Motion.tsx).
export function Hero() {
  const stageRef = useRef<HTMLDivElement>(null);
  const tick = useReplay(stageRef);
  const state = stateAt(tick);
  const trail = [6, 4, 2].filter((d) => tick >= d).map((d) => stateAt(tick - d));
  const sum = checksum(state);
  const matched = ROW_TICKS.filter((t) => t <= tick).length;

  const headline = field(ID, 'headline');
  const cut = headline.lastIndexOf(', ');
  const words = headline.split(' ');
  const accentFrom = cut < 0 ? words.length : headline.slice(0, cut + 1).split(' ').length;
  const [join = '', how = ''] = list(ID, 'cta');
  const [runA = '', runB = ''] = list(ID, 'legend');
  const [hTick = '', hA = '', hB = '', hMatch = ''] = list(ID, 'hud');

  return (
    <section className={styles.hero} data-m="hero" aria-labelledby="home-title">
      <div className={`act-dark ${styles.screen}`} data-hero-screen>
        <div className={styles.stageWrap} ref={stageRef}>
          <Stage
            state={state}
            traced={state}
            trail={trail}
            scores={false}
            label={`${field(ID, 'screen-label')}: tick ${tick} of ${SIM.ticks}, score ${state.score[0]} to ${state.score[1]}`}
          />
        </div>
        <span className={styles.vignette} aria-hidden="true" />
        <span className={styles.scan} aria-hidden="true" />
      </div>

      <div className={`frame ${styles.copy}`} data-hero-copy>
        <p className={`${ui.plate} ${ui.onDark} enter`} style={delay(0)}>
          <span className="led" aria-hidden="true" />
          {field(ID, 'kicker')}
        </p>
        <h1 id="home-title" className={styles.headline}>
          {words.map((w, i) => (
            <span key={i}>
              <span
                className={`${styles.w} ${i >= accentFrom ? styles.accent : ''}`}
                style={{ '--i': i } as CSSProperties}
              >
                {w}
              </span>
              {i < words.length - 1 ? ' ' : ''}
            </span>
          ))}
        </h1>
        <p className={`enter ${styles.lede}`} style={delay(520)}>
          {paragraphs(ID)[0]}
        </p>
        <div className={`enter ${styles.keys}`} style={delay(640)}>
          {FLAGS.joinBeta ? (
            <a className={ui.btn} href={`${BASE}beta/`}>
              {join}
              <span aria-hidden="true">→</span>
            </a>
          ) : null}
          <a className={`${ui.btn} ${ui.btnGhostDark}`} href="#strengths">
            {how}
            <span aria-hidden="true">↓</span>
          </a>
        </div>
        <p className={`enter ${styles.small}`} style={delay(720)}>
          {field(ID, 'small')}
        </p>
      </div>

      <div className={`frame ${styles.hud} enter`} style={delay(820)}>
        <dl className={styles.readouts}>
          <div>
            <dt>{hTick}</dt>
            <dd className={styles.tick}>
              {pad(tick, 3)}
              <span> / {SIM.ticks}</span>
            </dd>
          </div>
          <div>
            <dt>{hA}</dt>
            <dd>{sum}</dd>
          </div>
          <div>
            <dt>{hB}</dt>
            <dd>{sum}</dd>
          </div>
          <div className={styles.match}>
            <dt>{hMatch}</dt>
            <dd>
              <span className={styles.pass} aria-hidden="true" />
              {matched}/{ROW_TICKS.length}
            </dd>
          </div>
        </dl>
        <div className={styles.legend}>
          <span className={styles.keyA}>{runA}</span>
          <span className={styles.keyB}>{runB}</span>
        </div>
        <p className={styles.caption}>{field(ID, 'caption')}</p>
      </div>
    </section>
  );
}
