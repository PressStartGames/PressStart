import { Numbers } from '../components/Numbers';
import { Audiences } from '../home/Audiences';
import { Hero } from '../home/Hero';
import { Licence } from '../home/Licence';
import { Road } from '../home/Road';
import { Showcase } from '../home/Showcase';
import { Strengths } from '../home/Strengths';
import { Verbs } from '../home/Verbs';
import styles from './Pages.module.css';

// The home page in acts (DESIGN.md): the opening shot, four ways in, the dark theatre of the four
// strengths, the verbs, the film strip, the numbers and the road, the licence end card.
export function Home() {
  return (
    <>
      <Hero />
      <Audiences />
      <Strengths />
      <Verbs />
      <Showcase />
      <section className={`act-light ${styles.act}`} aria-labelledby="numbers-title">
        <div className="frame">
          <Numbers />
          <Road />
        </div>
      </section>
      <Licence />
    </>
  );
}
