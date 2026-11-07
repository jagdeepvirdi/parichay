import type { ReactNode } from 'react'

/** The tinted, shadowed panel used to group a set of fields (e.g. the
 * Professional / Personal sections on the profile screen). `tone` picks
 * which accent color the left border, dot and label use. */
export function FieldCard({
  label,
  tone = 'accent',
  children,
}: {
  label: string
  tone?: 'accent' | 'warm'
  children: ReactNode
}) {
  const isWarm = tone === 'warm'
  return (
    <div
      className="shadow-card flex flex-col gap-3 rounded-l rounded-r-2xl border p-4"
      style={{
        background: isWarm ? 'rgba(154,106,31,0.07)' : 'rgba(46,111,100,0.07)',
        borderColor: isWarm ? 'rgba(154,106,31,0.2)' : 'rgba(46,111,100,0.2)',
        borderLeft: `3px solid var(${isWarm ? '--color-accent-warm' : '--color-accent'})`,
      }}
    >
      <div className="flex items-center gap-1.5">
        <span
          className="h-1.75 w-1.75 shrink-0 rounded-full"
          style={{ background: `var(${isWarm ? '--color-accent-warm' : '--color-accent'})` }}
        />
        <span className={`font-mono text-[10.5px] font-medium uppercase tracking-wider ${isWarm ? 'text-accent-warm' : 'text-accent'}`}>
          {label}
        </span>
      </div>
      {children}
    </div>
  )
}
