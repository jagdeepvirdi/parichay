function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const SIZE_CLASSES = {
  sm: 'h-10 w-10 text-[13px]',
  md: 'h-14 w-14 text-[17px]',
  lg: 'h-15 w-15 text-[19px]',
} as const

export function Avatar({
  name,
  tone = 'accent',
  size = 'md',
}: {
  name: string
  tone?: 'accent' | 'warm' | 'dim'
  size?: keyof typeof SIZE_CLASSES
}) {
  const gradient =
    tone === 'warm'
      ? 'linear-gradient(135deg, var(--color-accent-warm), var(--color-accent-warm-deep))'
      : tone === 'dim'
        ? 'linear-gradient(135deg, var(--color-ink-dim), #3d4a44)'
        : 'linear-gradient(135deg, var(--color-accent), var(--color-accent-deep))'

  return (
    <div
      className={`shadow-btn flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${SIZE_CLASSES[size]}`}
      style={{ background: gradient }}
    >
      {initials(name)}
    </div>
  )
}
