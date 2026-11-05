import { AnalyticsEvents } from './AnalyticsEvents';
import ConsentBanner from './ConsentBanner';

// Everything analytics adds to the page beyond the entry bundle: the banner and the page-view events.
export default function ConsentLayer() {
  return (
    <>
      <AnalyticsEvents />
      <ConsentBanner />
    </>
  );
}
