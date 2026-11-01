import { Build } from '../sections/Build';
import { BuiltToday } from '../sections/BuiltToday';
import { Determinism } from '../sections/Determinism';
import { Faq } from '../sections/Faq';
import { Footer } from '../sections/Footer';
import { Goldens } from '../sections/Goldens';
import { Hero } from '../sections/Hero';
import { Oracles } from '../sections/Oracles';
import { Problem } from '../sections/Problem';
import { Roadmap } from '../sections/Roadmap';
import { Signup } from '../sections/Signup';
import { What } from '../sections/What';
import styles from './Page.module.css';

// Act 1 on paper (inset from the viewport edge on the dark body), a hard cut at "How an agent builds
// a game" into act 2, the booth. The paper lifts away as it scrolls out (a scroll-driven CSS animation).
export function Home() {
  return (
    <div className={styles.stage}>
      <div id="act-paper" data-act="paper" className={styles.paper}>
        <Hero />
        <Problem />
        <What />
      </div>
      <div data-act="booth" className={styles.booth}>
        <Build />
        <Determinism />
        <Oracles />
        <Goldens />
        <BuiltToday />
        <Roadmap />
        <Signup />
        <Faq />
        <Footer />
      </div>
    </div>
  );
}
