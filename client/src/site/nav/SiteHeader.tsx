import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { flushSync } from 'react-dom';
import { Link } from 'react-router';
import { field } from '../../content';
import { BASE, FLAGS } from '../../lib/config';
import { list, navModel } from '../data';
import ui from '../ui.module.css';
import { Drawer } from './Drawer';
import styles from './Header.module.css';
import { MegaPanel } from './MegaPanel';

export type Group = 'engine' | 'resources' | 'company';
const GROUPS: readonly Group[] = ['engine', 'resources', 'company'];

const model = navModel();

// The site header: wordmark, three menu groups (a disclosure-navigation mega-menu), "Join the beta", and
// on a phone a "Menu" button opening a drawer. Without JavaScript the panels open on hover/focus (CSS)
// and the phone's "Menu" is a link to the footer's site map.
export function SiteHeader() {
  const [open, setOpen] = useState<Group | null>(null);
  const [drawer, setDrawer] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const hoverTimer = useRef(0);
  const labels = list('site-header', 'nav');

  // While a panel is open: a click outside closes it.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: globalThis.PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  // The bar firms up once the page scrolls (an attribute, not state: no re-render per scroll).
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const onScroll = () => header.toggleAttribute('data-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => () => window.clearTimeout(hoverTimer.current), []);

  const trigger = (g: Group) =>
    navRef.current?.querySelector<HTMLButtonElement>(`[data-mega-trigger="${g}"]`);
  const panelLinks = (g: Group) =>
    Array.from(navRef.current?.querySelectorAll<HTMLAnchorElement>(`#mega-${g} a`) ?? []);

  function onTriggerKey(e: KeyboardEvent<HTMLButtonElement>, g: Group) {
    const i = GROUPS.indexOf(g);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      // Show the panel now (it is in the DOM, hidden by CSS), then move focus to its first link.
      flushSync(() => setOpen(g));
      panelLinks(g)[0]?.focus();
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const next = GROUPS[(i + (e.key === 'ArrowRight' ? 1 : GROUPS.length - 1)) % GROUPS.length];
      if (next) {
        trigger(next)?.focus();
        if (open) setOpen(next);
      }
    } else if (e.key === 'Escape') {
      setOpen(null);
    }
  }

  function onPanelKey(e: KeyboardEvent<HTMLDivElement>, g: Group) {
    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(null);
      trigger(g)?.focus();
      return;
    }
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const links = panelLinks(g);
    const at = links.indexOf(document.activeElement as HTMLAnchorElement);
    const next = links[(at + (e.key === 'ArrowDown' ? 1 : links.length - 1)) % links.length];
    if (next) {
      e.preventDefault();
      next.focus();
    }
  }

  // Hover intent on a fine pointer: open after a beat, switch at once, close after a grace period.
  function onEnter(e: PointerEvent, g: Group) {
    if (e.pointerType !== 'mouse') return;
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setOpen(g), open ? 0 : 90);
  }
  function onLeave(e: PointerEvent) {
    if (e.pointerType !== 'mouse') return;
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setOpen(null), 220);
  }

  const close = () => setOpen(null);
  const join = FLAGS.joinBeta ? (
    <a className={`${ui.btn} ${ui.primary} ${styles.cta}`} href={`${BASE}beta/`}>
      <span className={ui.led} aria-hidden="true" />
      {field('site-header', 'cta')}
    </a>
  ) : null;

  return (
    <header ref={headerRef} className={styles.header} data-open={open ? '' : undefined}>
      <div className={`frame ${styles.bar}`}>
        <Link to="/" className={styles.wordmark} aria-label={field('site-header', 'home')}>
          <span className={styles.mark} aria-hidden="true">
            <span />
          </span>
          {field('site-header', 'wordmark')}
        </Link>
        <nav
          ref={navRef}
          className={styles.nav}
          aria-label={field('site-header', 'nav-label')}
          onBlur={(e) => {
            if (!navRef.current?.contains(e.relatedTarget as Node | null)) setOpen(null);
          }}
        >
          <ul className={styles.groups}>
            {GROUPS.map((g, i) => (
              <li
                key={g}
                className={styles.group}
                data-open={open === g ? '' : undefined}
                onPointerEnter={(e) => onEnter(e, g)}
                onPointerLeave={onLeave}
              >
                <button
                  type="button"
                  className={styles.trigger}
                  data-mega-trigger={g}
                  aria-expanded={open === g}
                  aria-controls={`mega-${g}`}
                  onClick={() => setOpen(open === g ? null : g)}
                  onKeyDown={(e) => onTriggerKey(e, g)}
                >
                  {labels[i] ?? g}
                  <svg
                    className={styles.chev}
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    aria-hidden="true"
                  >
                    <path
                      d="M1 3.5 5 7l4-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                  </svg>
                </button>
                {/* Keyboard handling for the links inside (Escape, arrows); the links are the controls. */}
                {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
                <div
                  id={`mega-${g}`}
                  className={styles.panel}
                  data-group={g}
                  onKeyDown={(e) => onPanelKey(e, g)}
                >
                  <MegaPanel group={g} model={model} onNavigate={close} />
                </div>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.end}>
          {join}
          <a className={`${styles.menuButton} ${styles.noJs}`} href="#site-map">
            {field('site-header', 'menu')}
          </a>
          <button
            type="button"
            className={`${styles.menuButton} ${styles.jsOnly}`}
            data-drawer-trigger=""
            aria-expanded={drawer}
            aria-controls="site-drawer"
            onClick={() => setDrawer(true)}
          >
            <span className={styles.burger} aria-hidden="true">
              <span />
              <span />
            </span>
            {field('site-header', 'menu')}
          </button>
        </div>
      </div>
      <div className={styles.scrim} aria-hidden="true" />
      <Drawer open={drawer} onClose={() => setDrawer(false)} model={model} join={join} />
    </header>
  );
}
