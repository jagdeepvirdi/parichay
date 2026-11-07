/** The small two-circle "meeting of two people" mark used next to the
 * wordmark on the Profile and Share screens. */
export function Logo({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className="shrink-0" aria-hidden="true">
      <circle cx="6" cy="8" r="5" fill="var(--color-accent)" />
      <circle cx="10" cy="8" r="5" fill="var(--color-accent-warm)" opacity="0.82" />
    </svg>
  )
}

export function Wordmark() {
  return (
    <div className="flex items-center gap-1.5">
      <Logo />
      <span className="font-mono text-[10.5px] font-semibold uppercase tracking-wider text-accent">
        Parichay
      </span>
    </div>
  )
}
