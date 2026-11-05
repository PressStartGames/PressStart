import { useEffect, useEffectEvent, useRef, type ReactNode } from 'react';
import { Link } from 'react-router';
import { field } from '../../content';
import { sitePagePath } from '../../routes';
import { list, type navModel, type NavEntry } from '../data';
import { PixelIcon } from '../PixelIcon';
import styles from './Header.module.css';

type Model = ReturnType<typeof navModel>;

const FOCUSABLE = 'a[href], button:not([disabled])';

// The phone menu: a modal drawer from the right. Focus moves in on open and is trapped, Escape and the
// close button close it, focus returns to the "Menu" button, the page behind does not scroll.
export function Drawer({
  open,
  onClose,
  model,
  join,
}: {
  open: boolean;
  onClose: () => void;
  model: Model;
  join: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const groups = list('site-header', 'nav');
  const close = useEffectEvent(onClose);

  useEffect(() => {
    if (!open) return;
    const el = ref.current;
    const opener = document.activeElement as HTMLElement | null;
    const root = document.documentElement;
    root.style.overflow = 'hidden';
    el?.querySelector<HTMLElement>('[data-drawer-close]')?.focus();
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== 'Tab' || !el) return;
      const items = Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE));
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      root.style.overflow = '';
      opener?.focus();
    };
  }, [open]);

  const section = (title: string, entries: NavEntry[], move?: string) => (
    <div className={styles.drawerGroup} key={title}>
      <p className={styles.drawerHead} data-move={move}>
        {title}
      </p>
      <ul>
        {entries.map((e) => (
          <li key={e.id + title}>
            <Link to={sitePagePath(e.id)} onClick={onClose}>
              <span>{e.label}</span>
              <span className={styles.drawerNote}>{e.note}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div
      ref={ref}
      id="site-drawer"
      className={styles.drawer}
      role="dialog"
      aria-modal="true"
      aria-label={field('site-header', 'menu')}
      data-open={open ? '' : undefined}
      inert={!open}
    >
      <div className={styles.drawerTop}>
        <span className={styles.drawerTitle}>{field('site-header', 'wordmark')}</span>
        <button type="button" className={styles.drawerClose} data-drawer-close="" onClick={onClose}>
          {field('site-header', 'close')}
          <PixelIcon name="arrow" size={16} />
        </button>
      </div>
      <div className={styles.drawerBody}>
        {section(model.overview.label, [model.overview])}
        {model.columns.map((c) => section(c.label, c.entries, c.move))}
        {section(groups[1] ?? '', model.resources)}
        {section(
          groups[2] ?? '',
          model.company.filter((e) => e.id !== 'licensing'),
        )}
      </div>
      <div className={styles.drawerFoot}>{join}</div>
    </div>
  );
}
