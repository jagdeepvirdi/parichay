import { useProfile } from '../../hooks/useProfile'
import { Wordmark } from '../../components/Logo'
import { Avatar } from '../../components/Avatar'
import { FieldCard } from '../../components/FieldCard'
import { FieldInput } from './FieldInput'

export function ProfileScreen() {
  const { profile, save } = useProfile()

  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 flex-col gap-1.5 px-6 pt-4 pb-3">
        <Wordmark />
        <h1 className="text-[22px] font-bold">Your card</h1>
        <p className="text-[13px] text-ink-dim">Fill it once. Share only what you choose.</p>
      </header>

      <div className="flex-1 overflow-y-auto px-6 pb-5">
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3.5">
            <Avatar name={profile.name || 'You'} />
            <div className="min-w-0">
              <input
                className="w-full bg-transparent text-[17px] font-semibold text-ink outline-none"
                value={profile.name}
                placeholder="Your name"
                onChange={(e) => save({ name: e.target.value })}
              />
              <input
                className="w-full bg-transparent text-[13px] text-ink-dim outline-none"
                value={profile.title ?? ''}
                placeholder="Your title"
                onChange={(e) => save({ title: e.target.value })}
              />
            </div>
          </div>

          <FieldCard label="Professional">
            <FieldInput field="title" value={profile.title ?? ''} onChange={(v) => save({ title: v })} />
            <FieldInput field="company" value={profile.company ?? ''} onChange={(v) => save({ company: v })} />
            <FieldInput field="workEmail" value={profile.workEmail ?? ''} onChange={(v) => save({ workEmail: v })} />
            <FieldInput field="workPhone" value={profile.workPhone ?? ''} onChange={(v) => save({ workPhone: v })} />
            <FieldInput field="linkedin" value={profile.linkedin ?? ''} onChange={(v) => save({ linkedin: v })} />
          </FieldCard>

          <FieldCard label="Personal" tone="warm">
            <FieldInput
              field="personalPhone"
              value={profile.personalPhone ?? ''}
              onChange={(v) => save({ personalPhone: v })}
            />
            <FieldInput
              field="personalEmail"
              value={profile.personalEmail ?? ''}
              onChange={(v) => save({ personalEmail: v })}
            />
            <FieldInput field="instagram" value={profile.instagram ?? ''} onChange={(v) => save({ instagram: v })} />
            <FieldInput field="twitter" value={profile.twitter ?? ''} onChange={(v) => save({ twitter: v })} />
          </FieldCard>

          <button
            type="button"
            onClick={() => save({ includePhones: !profile.includePhones })}
            className="shadow-card flex items-center justify-between gap-3 rounded-xl border border-line bg-surface px-3.5 py-3"
            aria-pressed={profile.includePhones}
          >
            <span className="max-w-57 text-left text-[13.5px]">Include phone numbers when sharing</span>
            <span
              className="relative h-5.5 w-9.5 shrink-0 rounded-full transition-colors"
              style={{
                background: profile.includePhones
                  ? 'linear-gradient(135deg, var(--color-accent), var(--color-accent-deep))'
                  : 'var(--color-line)',
              }}
            >
              <span
                className="absolute top-0.5 h-4.5 w-4.5 rounded-full bg-white shadow transition-[left]"
                style={{ left: profile.includePhones ? '18px' : '2px' }}
              />
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
