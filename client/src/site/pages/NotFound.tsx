import { Link } from 'react-router';
import { field } from '../../content';
import { TitleBand } from '../components/TitleBand';
import { paragraphs } from '../text';
import ui from '../ui.module.css';
import styles from './Pages.module.css';

export function NotFound() {
  return (
    <>
      <TitleBand id="site-not-found" lede={paragraphs('site-not-found')[0]} />
      <div className={`act-light ${styles.way}`}>
        <div className="frame">
          <Link className={`${ui.btn} ${ui.btnInk}`} to="/">
            {field('site-not-found', 'cta')}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </>
  );
}
