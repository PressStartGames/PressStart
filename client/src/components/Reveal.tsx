import { useInView } from 'motion/react';
import { useRef, type CSSProperties, type ElementType, type ReactNode } from 'react';

interface Props {
  as?: ElementType;
  className?: string;
  delay?: number;
  wipe?: boolean;
  children: ReactNode;
  id?: string;
  role?: string;
  style?: CSSProperties;
  tabIndex?: number;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-hidden'?: boolean | 'true' | 'false';
  onPointerMove?: (e: React.PointerEvent<HTMLElement>) => void;
  onPointerLeave?: (e: React.PointerEvent<HTMLElement>) => void;
}

// A scroll reveal. The hidden state lives in base.css under html.js.hydrated only, so the server
// HTML, the no-JS page and reduced-motion users all get the final state.
export function Reveal({
  as: Tag = 'div',
  className,
  delay = 0,
  wipe,
  style: styleProp,
  children,
  ...rest
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -12% 0px' });
  const style = {
    ...(styleProp ?? {}),
    ...(delay ? ({ '--reveal-delay': `${delay}ms` } as CSSProperties) : {}),
  } as CSSProperties;
  return (
    <Tag
      ref={ref}
      className={['reveal', className].filter(Boolean).join(' ')}
      data-visible={inView ? '' : undefined}
      data-reveal={wipe ? 'wipe' : undefined}
      style={style}
      {...rest}
    >
      {children}
    </Tag>
  );
}
