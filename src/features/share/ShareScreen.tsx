import { useEffect, useMemo, useState } from 'react'
import QRCode from 'qrcode'
import { useProfile } from '../../hooks/useProfile'
import { Wordmark } from '../../components/Logo'
import { SHARE_PRESETS, type PresetKey } from '../../lib/presets'
import { buildVCard } from '../../lib/vcard'
import { FIELD_KEYS, FIELD_LABELS, PHONE_FIELDS, type FieldKey } from '../../lib/profileFields'

export function ShareScreen() {
  const { profile } = useProfile()
  const [presetKey, setPresetKey] = useState<PresetKey>('professional')
  // null = follow the preset. Once the user taps a field this holds their own
  // pick (ids: a FieldKey, or an extra's id) and the preset is no longer applied.
  const [custom, setCustom] = useState<Set<string> | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

  const preset = SHARE_PRESETS.find((p) => p.key === presetKey)!

  // Everything that *could* be shared. The "include phone numbers" toggle is a
  // blanket override applied here, so it beats presets and custom picks alike.
  const effectiveFields = useMemo(() => {
    const keys = FIELD_KEYS.filter((f) => !!profile[f] && (profile.includePhones || !PHONE_FIELDS.includes(f)))
    const extras = (profile.extras ?? []).filter(
      (x) => x.value.trim() && (profile.includePhones || x.kind !== 'phone'),
    )
    return { keys, extras }
  }, [profile])

  const selected = useMemo(() => {
    if (custom) return custom
    return new Set<string>([
      ...effectiveFields.keys.filter((k) => preset.fields.includes(k)),
      ...effectiveFields.extras.filter((x) => preset.includesExtra(x)).map((x) => x.id),
    ])
  }, [custom, preset, effectiveFields])

  const chips = [
    ...effectiveFields.keys.map((k) => ({ id: k as string, label: FIELD_LABELS[k as FieldKey] })),
    ...effectiveFields.extras.map((x) => ({ id: x.id, label: x.label || 'Field' })),
  ]
  const selectedCount = chips.filter((c) => selected.has(c.id)).length

  const toggle = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setCustom(next)
  }

  useEffect(() => {
    if (!profile.name) return
    const shared = {
      ...profile,
      extras: effectiveFields.extras.filter((x) => selected.has(x.id)),
    }
    const vcard = buildVCard(
      shared,
      effectiveFields.keys.filter((k) => selected.has(k)),
    )
    let cancelled = false
    QRCode.toDataURL(vcard, {
      margin: 1,
      width: 480,
      color: { dark: '#16231f', light: '#ffffff' },
    }).then((url) => {
      if (!cancelled) setQrDataUrl(url)
    })
    return () => {
      cancelled = true
    }
  }, [profile, effectiveFields, selected])

  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 flex-col gap-1.5 px-6 pt-4 pb-3.5">
        <Wordmark />
        <h1 className="text-[22px] font-bold">Share your card</h1>
      </header>

      <div className="flex flex-1 flex-col items-center gap-4.5 overflow-y-auto px-6 pb-4">
        <div className="flex flex-wrap justify-center gap-2">
          {SHARE_PRESETS.map((p) => {
            const active = !custom && p.key === presetKey
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => {
                  setPresetKey(p.key)
                  setCustom(null)
                }}
                className={`rounded-full border px-3 py-1.75 font-mono text-[11px] whitespace-nowrap transition-shadow ${active ? 'shadow-btn' : ''}`}
                style={{
                  background: active ? 'var(--color-accent)' : 'transparent',
                  color: active ? '#fff' : 'var(--color-ink-dim)',
                  borderColor: active ? 'var(--color-accent)' : 'var(--color-line)',
                }}
              >
                {p.label}
              </button>
            )
          })}
          {custom && (
            <span
              className="shadow-btn rounded-full border px-3 py-1.75 font-mono text-[11px] whitespace-nowrap"
              style={{ background: 'var(--color-accent-warm)', color: '#fff', borderColor: 'var(--color-accent-warm)' }}
            >
              Custom
            </span>
          )}
        </div>

        <div className="shadow-card flex items-center justify-center rounded-3xl border border-line bg-white p-4.5">
          {profile.name && qrDataUrl ? (
            <img src={qrDataUrl} alt="Scannable QR code of your shared card" className="h-55 w-55" />
          ) : (
            <div className="flex h-55 w-55 flex-col items-center justify-center gap-2 text-center text-[13px] text-ink-dim">
              Add your name on the Profile tab to generate a card.
            </div>
          )}
        </div>

        <div className="text-center">
          <div className="text-[14px] font-semibold">
            {custom ? 'Custom' : preset.label} card · {selectedCount} field{selectedCount === 1 ? '' : 's'}
          </div>
          <div className="mt-0.5 text-[12px] text-ink-dim">No signal needed — this works offline.</div>
        </div>

        {chips.length > 0 && (
          <div className="flex w-full flex-col items-center gap-2">
            <div className="text-[12px] text-ink-dim">Tap a field to include it or leave it out.</div>
            <div className="flex max-w-80 flex-wrap justify-center gap-1.5">
              {chips.map((c) => {
                const on = selected.has(c.id)
                return (
                  <button
                    key={c.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(c.id)}
                    className="rounded-full border px-2.5 py-1.5 font-mono text-[10.5px]"
                    style={{
                      background: on ? 'rgba(46,111,100,0.1)' : 'transparent',
                      color: on ? 'var(--color-accent)' : 'var(--color-ink-dim)',
                      borderColor: on ? 'var(--color-accent)' : 'var(--color-line)',
                      textDecoration: on ? 'none' : 'line-through',
                    }}
                  >
                    {on ? '✓ ' : ''}
                    {c.label}
                  </button>
                )
              })}
            </div>
            {!profile.includePhones && (
              <div className="text-[11.5px] text-ink-dim">Phone numbers are hidden — turned off on Your card.</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
