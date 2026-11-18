import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ScanLine } from 'lucide-react'
import jsQR from 'jsqr'
import { parseVCard, type ParsedVCard } from '../../lib/vcard'
import { saveContact } from '../../hooks/useContacts'
import { useGroups } from '../../hooks/useGroups'
import { Avatar } from '../../components/Avatar'
import { PageHeading } from '../../components/PageHeading'
import { FIELD_LABELS, type FieldKey } from '../../lib/profileFields'

type ScanState = 'scanning' | 'received' | 'denied' | 'unsupported'
const DISPLAY_FIELDS: FieldKey[] = ['company', 'title', 'workEmail', 'workPhone', 'linkedin', 'personalEmail', 'personalPhone', 'instagram', 'twitter']

export function ScanScreen() {
  const [state, setState] = useState<ScanState>(() => typeof navigator.mediaDevices?.getUserMedia === 'function' ? 'scanning' : 'unsupported')
  const [scanned, setScanned] = useState<ParsedVCard | null>(null)
  const [note, setNote] = useState('')
  const [groupInput, setGroupInput] = useState('')
  const [saveError, setSaveError] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)
  const { groups, addGroup } = useGroups()
  const navigate = useNavigate()

  useEffect(() => {
    if (state !== 'scanning') return
    let active = true
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then((stream) => {
      if (!active) { stream.getTracks().forEach((track) => track.stop()); return }
      streamRef.current = stream
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play().catch(() => {}) }
      const tick = () => {
        const video = videoRef.current
        const canvas = canvasRef.current
        if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          const context = canvas.getContext('2d')
          if (context) {
            context.drawImage(video, 0, 0, canvas.width, canvas.height)
            const pixels = context.getImageData(0, 0, canvas.width, canvas.height)
            const code = jsQR(pixels.data, pixels.width, pixels.height)
            if (code) {
              const parsed = parseVCard(code.data)
              if (parsed) { setScanned(parsed); setState('received'); return }
            }
          }
        }
        rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
    }).catch(() => { if (active) setState('denied') })
    return () => {
      active = false
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [state])

  const reset = () => { setScanned(null); setNote(''); setGroupInput(''); setSaveError(''); setState('scanning') }
  const confirmAdd = async () => {
    if (!scanned) return
    setSaveError('')
    try {
      const groupId = (await addGroup(groupInput)) ?? null
      await saveContact({ ...scanned, groupId, note: note.trim() || undefined, metAt: Date.now() })
      navigate('/network')
      reset()
    } catch {
      setSaveError('Could not save this contact on your device. Please try again.')
    }
  }

  if (state === 'received' && scanned) return (
    <div className="page">
      <button type="button" onClick={reset} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-ink-dim"><ArrowLeft size={17} />Scan another card</button>
      <PageHeading title="Card received" description="Review the details, add a group or note, then keep this contact on your device." />
      <div className="mx-auto max-w-3xl section-stack">
        <section className="profile-hero"><Avatar name={scanned.name} tone="warm" size="lg" /><div className="min-w-0"><h2 className="m-0 truncate font-display text-xl font-bold">{scanned.name}</h2><p className="mb-0 mt-1 truncate text-sm text-white/70">{[scanned.title, scanned.company].filter(Boolean).join(' · ') || 'Contact card'}</p></div></section>
        <section className="surface surface-pad"><h2 className="surface-title mb-3">Shared details</h2>
          {DISPLAY_FIELDS.filter((field) => Boolean(scanned[field])).map((field) => <div className="field-row" key={field}><span className="field-label">{FIELD_LABELS[field]}</span><div className="field-value">{scanned[field]}</div></div>)}
          {(scanned.extras ?? []).map((extra) => <div className="field-row" key={extra.id}><span className="field-label">{extra.label}</span><div className="field-value">{extra.value}</div></div>)}
        </section>
        <section className="surface surface-pad">
          <label className="field-label" htmlFor="contact-group">Add to group</label>
          {groups.length > 0 && <div className="mb-3 flex flex-wrap gap-2">{groups.map((group) => <button key={group.id} type="button" aria-pressed={group.name === groupInput} onClick={() => setGroupInput(group.name)} className="choice-chip" style={group.name === groupInput ? { background: 'var(--color-accent)', borderColor: 'var(--color-accent)', color: '#fff' } : undefined}>{group.name}</button>)}</div>}
          <input id="contact-group" className="text-input" placeholder="Or create a group, e.g. Design meetup" value={groupInput} onChange={(event) => setGroupInput(event.target.value)} />
        </section>
        <section className="surface surface-pad"><label className="field-label" htmlFor="contact-note">A note for later</label><textarea id="contact-note" className="text-input min-h-28 resize-y" placeholder="Where you met, what you talked about…" value={note} onChange={(event) => setNote(event.target.value)} /></section>
        {saveError && <p role="alert" className="m-0 text-sm font-medium text-[#8D3C30]">{saveError}</p>}
        <button type="button" onClick={confirmAdd} className="primary-button w-full"><ScanLine size={18} />Add to my network</button>
      </div>
    </div>
  )

  return (
    <div className="camera-surface">
      <video ref={videoRef} aria-label="Camera preview for QR scanning" muted playsInline />
      <canvas ref={canvasRef} className="hidden" />
      <div className="scan-overlay">
        <div className="text-left"><Link to="/" className="inline-flex items-center gap-2 font-semibold text-white no-underline"><ArrowLeft size={17} />Close scanner</Link><h1 className="mb-0 mt-4 font-display text-2xl font-bold">Scan a card</h1></div>
        <div className="scan-frame" aria-hidden="true" />
        <div className="scan-state" role="status" aria-live="polite">
          {state === 'denied' && <><strong>Camera access is off</strong><span className="mt-1 text-sm text-white/80">Allow camera access in your browser settings, then reopen the scanner.</span></>}
          {state === 'unsupported' && <><strong>This browser can’t access a camera</strong><span className="mt-1 text-sm text-white/80">Try opening Parichay in your device’s browser.</span></>}
          {state === 'scanning' && <><strong>Point your camera at their QR code</strong><span className="mt-1 text-sm text-white/80">The scan happens on your device.</span></>}
        </div>
      </div>
    </div>
  )
}
