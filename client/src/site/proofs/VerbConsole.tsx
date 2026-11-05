import { useEffect, useRef, useState } from 'react';
import { field } from '../../content';
import { fill, pairs } from '../tour/stages';
import { Screen } from '../ui/Screen';
import { Arena } from './Arena';
import { centreBall, checksum, stateAt, step, tween, type State } from './play';
import styles from './VerbConsole.module.css';

const S = 'site-stage-ai';
const START = 132;
const STEP = 12;
type Verb = 'query' | 'command' | 'capture' | 'control';

interface Line {
  id: number;
  verb: Verb;
  text: string;
}

function say(verb: Verb, s: State, journal: number): string {
  switch (verb) {
    case 'query':
      return fill(field(S, 'query-out'), {
        bodies: s.bodies.length,
        x: Math.round(s.ball.x),
        y: Math.round(s.ball.y),
        a: s.score[0],
        b: s.score[1],
      });
    case 'command':
      return fill(field(S, 'command-out'), { journal: field(S, 'journal-word'), n: journal });
    case 'capture':
      return fill(field(S, 'capture-out'), {
        captured: field(S, 'captured'),
        id: checksum(s).slice(0, 8),
      });
    case 'control':
      return fill(field(S, 'control-out'), {
        tick: field(S, 'tick-word'),
        t: s.tick,
        sum: checksum(s).slice(0, 8),
      });
  }
}

const VERBS: Verb[] = ['query', 'command', 'capture', 'control'];

// The four verbs, played on the browser simulation: query prints the state, command places the ball
// through the journal, capture freezes a framed picture with its id, control steps the clock. The
// prerendered console already shows one line per verb, so the no-JS page reads the same story.
export function VerbConsole({ detailed = false }: { detailed?: boolean }) {
  const [state, setState] = useState<State>(() => stateAt(START));
  const [journal, setJournal] = useState(1);
  const [shots, setShots] = useState(0);
  const [log, setLog] = useState<Line[]>(() =>
    VERBS.map((verb, id) => ({ id, verb, text: say(verb, stateAt(START), 1) })),
  );
  const cancel = useRef<() => void>(() => {});
  useEffect(() => () => cancel.current(), []);
  const help = new Map(pairs(field(S, 'verbs')));

  const push = (verb: Verb, s: State, j: number) =>
    setLog((prev) => [
      ...prev.slice(-3),
      { id: (prev[prev.length - 1]?.id ?? 0) + 1, verb, text: say(verb, s, j) },
    ]);

  const run = (verb: Verb) => {
    cancel.current();
    if (verb === 'query') push(verb, state, journal);
    if (verb === 'command') {
      const next = centreBall(state);
      setState(next);
      setJournal(journal + 1);
      push(verb, next, journal + 1);
    }
    if (verb === 'capture') {
      setShots((n) => n + 1);
      push(verb, state, journal);
    }
    if (verb === 'control') {
      const from = state;
      const frames: State[] = [];
      let s = from;
      for (let i = 0; i < STEP; i++) frames.push((s = step(s)));
      push(verb, s, journal);
      cancel.current = tween(STEP * 40, (t) => {
        setState(frames[Math.max(0, Math.ceil(t * STEP) - 1)] ?? from);
      });
    }
  };

  return (
    <div className={styles.proof} data-detailed={detailed ? '' : undefined}>
      <Screen label={field(S, 'screen-label')} readout={`${field(S, 'tick-word')} ${state.tick}`}>
        <div className={styles.console}>
          <div className={styles.view}>
            <Arena state={state} label={field(S, 'tick-word')} />
            {shots > 0 && (
              <span key={shots} className={styles.shot} aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
              </span>
            )}
          </div>
          <div className={styles.keys} role="group" aria-label={field(S, 'screen-label')}>
            {VERBS.map((verb) => (
              <button
                key={verb}
                type="button"
                className={styles.verb}
                data-verb={verb}
                onClick={() => run(verb)}
              >
                <span className={styles.verbName}>{verb}</span>
                <span className={styles.verbHelp}>{help.get(verb)}</span>
              </button>
            ))}
          </div>
          <ol className={styles.log} aria-live="polite">
            {log.map((l) => (
              <li key={l.id} data-verb={l.verb}>
                <span className={styles.logVerb}>{l.verb}</span>
                <span>{l.text}</span>
              </li>
            ))}
          </ol>
        </div>
      </Screen>
      <p className={styles.caption}>
        <span className="provenance">{field('site-tour', 'illustration')}</span>
        {field(S, 'caption')}
      </p>
    </div>
  );
}
