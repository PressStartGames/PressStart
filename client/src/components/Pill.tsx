import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { Link } from 'react-router';
import styles from './Pill.module.css';

// A physical key on the chassis: flat face, hard shadow, presses down on click. "primary" is the
// ink key, "ghost" the chassis key, "start" the START key in the header (ink with a phosphor LED).
type Variant = 'primary' | 'ghost' | 'start';

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
  const cls = [styles.key, styles[variant], className].filter(Boolean).join(' ');
  const inner = (
    <>
      {variant === 'start' && <span className={`led ${styles.led}`} aria-hidden="true" />}
      <span className={styles.label}>{children}</span>
    </>
  );
  if ('href' in props) {
    const { variant: _v, className: _c, children: _k, ...rest } = props;
    return (
      <a className={cls} {...rest}>
        {inner}
      </a>
    );
  }
  if ('to' in props) {
    return (
      <Link className={cls} to={props.to}>
        {inner}
      </Link>
    );
  }
  const { variant: _v, className: _c, children: _k, ...rest } = props;
  return (
    <button className={cls} {...rest}>
      {inner}
    </button>
  );
}
