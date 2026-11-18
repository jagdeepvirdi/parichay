function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const SIZES = { sm: 40, md: 52, lg: 64 } as const

export function Avatar({ name, tone = 'accent', size = 'md' }: { name: string; tone?: 'accent' | 'warm' | 'dim'; size?: keyof typeof SIZES }) {
  const color = tone === 'warm' ? '#FAF8F3' : tone === 'dim' ? '#EDF0F2' : '#DCECE7'
  const ink = tone === 'warm' ? '#10263A' : tone === 'dim' ? '#516171' : '#167C70'
  const dimension = SIZES[size]
  return (
    <div role="img" aria-label={`${name || 'Contact'} initials ${initials(name || '?')}`} className="flex shrink-0 items-center justify-center rounded-full font-semibold" style={{ width: dimension, height: dimension, background: color, color: ink, fontSize: dimension * .27 }}>
      {initials(name)}
    </div>
  )
}
