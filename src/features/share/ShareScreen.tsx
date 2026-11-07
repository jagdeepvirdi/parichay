import { useEffect, useMemo, useState } from 'react'
import QRCode from 'qrcode'
import { useProfile } from '../../hooks/useProfile'
import { Wordmark } from '../../components/Logo'
import { SHARE_PRESETS, type PresetKey } from '../../lib/presets'
import { buildVCard } from '../../lib/vcard'
import { FIELD_LABELS, PHONE_FIELDS, type FieldKey } from '../../lib/profileFields'

export function ShareScreen() {
  const { profile } = useProfile()
  const [presetKey, setPresetKey] = useState<PresetKey>('professional')
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

  const preset = SHARE_PRESETS.find((p) => p.key === presetKey)!

  const effectiveFields: FieldKey[] = useMemo(
    () => preset.fields.filter((f) => profile.includePhones || !PHONE_FIELDS.includes(f)),
    [preset, profile.includePhones],
  )

  const presentFields = effectiveFields.filter((f) => !!profile[f])

  useEffect(() => {
    if (!profile.name) return
    const vcard = buildVCard(profile, effectiveFields)
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
  }, [profile, effectiveFields])

  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 flex-col gap-1.5 px-6 pt-4 pb-3.5">
        <Wordmark />
        <h1 className="text-[22px] font-bold">Share your card</h1>
      </header>

      <div className="flex flex-1 flex-col items-center gap-4.5 overflow-y-auto px-6 pb-4">
        <div className="flex flex-wrap justify-center gap-2">
          {SHARE_PRESETS.map((p) => {
            const active = p.key === presetKey
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => setPresetKey(p.key)}
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
            {preset.label} card · {presentFields.length} field{presentFields.length === 1 ? '' : 's'}
          </div>
          <div className="mt-0.5 text-[12px] text-ink-dim">No signal needed — this works offline.</div>
        </div>

        <div className="flex max-w-70 flex-wrap justify-center gap-1.5">
          {presentFields.map((f) => (
            <span
              key={f}
              className="rounded-full bg-accent/[0.08] px-2.5 py-1 font-mono text-[10.5px] text-accent"
            >
              {FIELD_LABELS[f]}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
