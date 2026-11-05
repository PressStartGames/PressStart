// The Press Start mark (the favicon, public/favicon.svg): a dark rounded square with the red play triangle.
// It sits before the wordmark in the beta's and the main site's headers and footers. Decorative: the wordmark
// text beside it is the accessible name. The width/height attributes reserve its box before any CSS loads (no
// CLS); a className may resize it per breakpoint.
export function Logo({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
      style={{ flex: 'none', display: 'block' }}
    >
      <rect width="64" height="64" rx="14" fill="#0E1014" />
      <path d="M24 17v30l24-15z" fill="#E8543A" />
    </svg>
  );
}
