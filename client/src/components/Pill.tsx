import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { Link } from 'react-router';
import styles from './Pill.module.css';

type Variant = 'primary' | 'ghost' | 'orbit';

interface Base {
  variant?: Variant;
  children: ReactNode;
  className?: string;
}

type AnchorProps = Base & { href: string } & Omit<ComponentPropsWithoutRef<'a'>, 'href'>;
type LinkProps = Base & { to: string };
type ButtonProps = Base & ComponentPropsWithoutRef<'button'>;

export function Pill(props: AnchorProps | LinkProps | ButtonProps) {
  const { variant = 'primary', className, children } = props;
  const cls = [styles.pill, styles[variant], className].filter(Boolean).join(' ');
  if ('href' in props) {
    const { variant: _v, className: _c, children: _k, ...rest } = props;
    return (
      <a className={cls} {...rest}>
        <span className={styles.label}>{children}</span>
      </a>
    );
  }
  if ('to' in props) {
    return (
      <Link className={cls} to={props.to}>
        <span className={styles.label}>{children}</span>
      </Link>
    );
  }
  const { variant: _v, className: _c, children: _k, ...rest } = props;
  return (
    <button className={cls} {...rest}>
      <span className={styles.label}>{children}</span>
    </button>
  );
}
