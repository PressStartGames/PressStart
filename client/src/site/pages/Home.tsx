import { Audience } from '../home/Audience';
import { Build } from '../home/Build';
import { Facts } from '../home/Facts';
import { Hero } from '../home/Hero';
import { Moves } from '../home/Moves';
import { Next } from '../home/Next';
import { Own } from '../home/Own';
import { Prove } from '../home/Prove';
import { Status } from '../home/Status';
import { JoinBand } from '../JoinBand';

// The home page (./DESIGN.md): hero + suite console, the synced facts, the three moves overview and
// one deep section per move, the honest status board, who it is for, the teasers, the closing band.
export function Home() {
  return (
    <>
      <Hero />
      <Facts />
      <Moves />
      <Build />
      <Prove />
      <Own />
      <Status />
      <Audience />
      <Next />
      <JoinBand />
    </>
  );
}
