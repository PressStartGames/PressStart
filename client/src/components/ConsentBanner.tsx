import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { field } from '../content';
import { ANALYTICS_ENABLED } from '../lib/config';
import {
  closeConsentBanner,
  setConsent,
  useBannerOpen,
  useConsent,
  type Consent,
} from '../lib/consent';

import styles from './ConsentBanner.module.css';

// Asks once whether Google Analytics may load. It is a region, not a dialog: it does not trap focus, does not
// block the page, and sits last in the DOM so the tab order reaches it after the page. After a choice it is gone
// until "Cookie settings" (CookieSettings.tsx) opens it again. Loaded lazily after hydration (App.tsx), so the
// server HTML and the no-JS page never contain it.
export default function ConsentBanner() {
  const consent = useConsent();
  const open = useBannerOpen();
  const [saved, setSaved] = useState<Consent | null>(null);
  const returnTo = useRef<Element | null>(null);
  const visible = ANALYTICS_ENABLED && (open || consent === 'unset');

  useEffect(() => {
    if (visible) returnTo.current = document.activeElement;
  }, [visible]);

  function choose(choice: 'granted' | 'denied') {
    setConsent(choice);
    setSaved(choice);
    const back = returnTo.current;
    if (back instanceof HTMLElement && back !== document.body) back.focus();
    window.setTimeout(() => setSaved(null), 4000);
  }

  return (
    <>
      <div role="status" className="visually-hidden">
        {saved
          ? field('consent-banner', saved === 'granted' ? 'saved-granted' : 'saved-denied')
          : ''}
      </div>
      {visible && (
        <section className={styles.banner} aria-label={field('consent-banner', 'label')}>
          <p className={styles.label}>
            <span className={styles.led} aria-hidden="true" />
            {field('consent-banner', 'label')}
          </p>
          <p className={styles.text}>
            {field('consent-banner', 'text')}{' '}
            <Link to="/beta/privacy" onClick={closeConsentBanner}>
              {field('consent-banner', 'privacy')}
            </Link>
          </p>
          <div className={styles.keys}>
            <button type="button" className={styles.key} onClick={() => choose('granted')}>
              {field('consent-banner', 'accept')}
            </button>
            <button type="button" className={styles.key} onClick={() => choose('denied')}>
              {field('consent-banner', 'decline')}
            </button>
          </div>
        </section>
      )}
    </>
  );
}
