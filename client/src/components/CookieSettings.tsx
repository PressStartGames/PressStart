import { field } from '../content';
import { ANALYTICS_ENABLED } from '../lib/config';
import { openConsentBanner, useHydrated } from '../lib/consent';
import styles from './CookieSettings.module.css';

// The footer control that reopens the consent banner. `item` wraps it in an <li> for link lists:
//   <CookieSettings item className={styles.link} />
// It renders nothing without JavaScript (it would do nothing) and nothing when analytics is not configured.
export function CookieSettings({ className, item }: { className?: string; item?: boolean }) {
  const hydrated = useHydrated();
  if (!ANALYTICS_ENABLED || !hydrated) return null;
  const button = (
    <button type="button" className={className ?? styles.link} onClick={openConsentBanner}>
      {field('consent-banner', 'settings')}
    </button>
  );
  return item ? <li>{button}</li> : button;
}
