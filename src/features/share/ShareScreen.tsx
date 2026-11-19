import { useEffect, useMemo, useState } from 'react'
import QRCode from 'qrcode'
import { useProfile } from '../../hooks/useProfile'
import { presetsFor, type PresetKey } from '../../lib/presets'
import { buildVCard } from '../../lib/vcard'
import { FIELD_KEYS, FIELD_LABELS, PHONE_FIELDS, type FieldKey } from '../../lib/profileFields'

export function ShareScreen() {
  const { profile } = useProfile()
  const [presetKey, setPresetKey] = useState<PresetKey>('professional')
  const [custom, setCustom] = useState<Set<string> | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [qrFailed, setQrFailed] = useState(false)
  const presets = useMemo(() => presetsFor(profile.sections), [profile.sections])
  // If the chosen section was since removed, fall back to the first preset.
  const preset = presets.find((item) => item.key === presetKey) ?? presets[0]

  const effectiveFields = useMemo(() => {
    const keys = FIELD_KEYS.filter((field) => !!profile[field] && (profile.includePhones || !PHONE_FIELDS.includes(field)))
    const extras = (profile.extras ?? []).filter((item) => item.value.trim() && (profile.includePhones || item.kind !== 'phone'))
    return { keys, extras }
  }, [profile])

  const selected = useMemo(() => custom ?? new Set<string>([
    ...effectiveFields.keys.filter((key) => preset.fields.includes(key)),
    ...effectiveFields.extras.filter(preset.includesExtra).map((item) => item.id),
  ]), [custom, preset, effectiveFields])

  const chips = [
    ...effectiveFields.keys.map((key) => ({ id: key as string, label: FIELD_LABELS[key as FieldKey] })),
    ...effectiveFields.extras.map((item) => ({ id: item.id, label: item.label || 'Field' })),
  ]

  useEffect(() => {
    if (!profile.name) return
    const shared = { ...profile, extras: effectiveFields.extras.filter((item) => selected.has(item.id)) }
    const vcard = buildVCard(shared, effectiveFields.keys.filter((key) => selected.has(key)))
    let cancelled = false
    QRCode.toDataURL(vcard, { margin: 1, width: 480, color: { dark: '#10263A', light: '#FFFFFF' } })
      .then((url) => { if (!cancelled) { setQrDataUrl(url); setQrFailed(false) } })
      .catch(() => { if (!cancelled) { setQrDataUrl(null); setQrFailed(true) } })
    return () => { cancelled = true }
  }, [profile, effectiveFields, selected])

  const toggle = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setCustom(next)
  }

  return (
    <div className="page">
      <div className="preset-bar" role="group" aria-label="Choose a card to share">
        {presets.map((item) => {
          const active = !custom && item.key === presetKey
          return <button key={item.key} type="button" aria-pressed={active} onClick={() => { setPresetKey(item.key); setCustom(null) }} className="choice-chip shrink-0" aria-label={`${item.label} preset`} style={active ? { borderColor: 'var(--color-accent)', background: 'var(--color-accent)', color: '#fff' } : undefined}>{item.label}</button>
        })}
        {custom && <span className="choice-chip shrink-0 border-accent bg-[#E8F2EE] text-accent">Custom</span>}
      </div>
      <div className="share-layout">
        <section className="surface shadow-card qr-panel">
          <div className="flex min-h-[280px] w-full items-center justify-center rounded-xl border border-line bg-white p-3">
            {profile.name && qrDataUrl ? <img src={qrDataUrl} alt="Scannable QR code of your shared card" className="qr-image" /> : <div className="max-w-[220px] px-4 text-sm leading-6 text-ink-dim">{!profile.name ? 'Add your name to My card to create a QR code.' : qrFailed ? 'Could not create a QR code. Try selecting fewer details.' : 'Preparing your QR code…'}</div>}
          </div>
        </section>

        <div className="section-stack">
          <section className="surface surface-pad">
            <div className="flex items-center justify-between gap-3">
              <h2 className="surface-title">Included details</h2><span className="text-xs text-ink-dim">Tap to change</span>
            </div>
            {chips.length ? <div className="mt-4 flex flex-wrap gap-2">
              {chips.map((item) => <button key={item.id} type="button" aria-pressed={selected.has(item.id)} onClick={() => toggle(item.id)} className="choice-chip">{item.label}</button>)}
            </div> : <p className="surface-copy mb-0 mt-3 text-sm">Add details to My card to choose what to include.</p>}
            {!profile.includePhones && <p className="mb-0 mt-4 border-t border-line pt-3 text-sm text-ink-dim">Phone numbers are hidden by your My card privacy setting.</p>}
          </section>
        </div>
      </div>
    </div>
  )
}
