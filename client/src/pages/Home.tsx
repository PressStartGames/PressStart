import { Boot } from '../components/Boot';
import { field, splitList } from '../content';
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

// One machine, one grey chassis, screens set into it. The spine index (00 BOOT, 01 BUILD …)
// comes from CONTENT.md's header.index, one entry per section in page order.
export function Home() {
  const idx = splitList(field('header', 'index'), '|').map((entry) => {
    const [n = '', ...rest] = entry.trim().split(' ');
    return { n, label: rest.join(' ') };
  });
  const at = (i: number) => ({
    index: idx[i]?.n ?? String(i).padStart(2, '0'),
    label: idx[i]?.label ?? '',
  });
  return (
    <>
      <Boot />
      <Hero {...at(0)} />
      <Problem {...at(1)} />
      <What {...at(2)} />
      <Build {...at(3)} />
      <Determinism {...at(4)} />
      <Oracles {...at(5)} />
      <Goldens {...at(6)} />
      <BuiltToday {...at(7)} />
      <Roadmap {...at(8)} />
      <Signup {...at(9)} />
      <Faq {...at(10)} />
      <Footer />
    </>
  );
}
