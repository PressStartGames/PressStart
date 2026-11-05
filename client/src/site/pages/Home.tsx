import { field } from '../../content';
import { sitePagePath } from '../../routes';
import { Code } from '../ui/Code';
import { CoresProof } from '../proofs/CoresProof';
import { GoldenProof } from '../proofs/GoldenProof';
import { LayersProof } from '../proofs/LayersProof';
import { LedgerProof } from '../proofs/LedgerProof';
import { OracleProof } from '../proofs/OracleProof';
import { VerbConsole } from '../proofs/VerbConsole';
import { Built } from '../tour/Built';
import { Hero } from '../tour/Hero';
import { Rail } from '../tour/Rail';
import { Road } from '../tour/Road';
import { StageFrame } from '../tour/StageFrame';
import styles from './Home.module.css';

// The feature tour (src/site/DESIGN.md): the hero's stage select, then one stage per capability, each a
// claim, a few friendly sentences and a proof to touch, with the map rail alongside.
export function Home() {
  return (
    <>
      <Hero />
      <div id="tour" className={`frame ${styles.tour}`}>
        <Rail />
        <div className={styles.stages}>
          <StageFrame id="documents" more={sitePagePath('engine')}>
            <LayersProof />
          </StageFrame>
          <StageFrame
            id="determinism"
            flip
            aside={field('site-stage-determinism', 'small')}
            more={sitePagePath('engine-determinism')}
          >
            <LedgerProof />
          </StageFrame>
          <StageFrame
            id="parallel"
            aside={field('site-stage-parallel', 'small')}
            more={sitePagePath('engine-parallel')}
          >
            <CoresProof />
          </StageFrame>
          <StageFrame id="goldens" flip>
            <GoldenProof />
          </StageFrame>
          <StageFrame id="oracles" more={sitePagePath('engine-oracles')}>
            <OracleProof />
          </StageFrame>
          <StageFrame id="ai" flip more={sitePagePath('engine-ai')}>
            <VerbConsole />
          </StageFrame>
          <StageFrame
            id="ownership"
            aside={field('site-stage-ownership', 'small')}
            more={sitePagePath('engine-ownership')}
          >
            <Code
              sample="site-sample-test"
              caption={field('site-stage-ownership', 'sample-caption')}
              label={field('site-tour', 'verbatim')}
            />
          </StageFrame>
          <StageFrame id="built" wide>
            <Built />
          </StageFrame>
          <StageFrame id="road" wide more={sitePagePath('roadmap')}>
            <Road />
          </StageFrame>
        </div>
      </div>
    </>
  );
}
