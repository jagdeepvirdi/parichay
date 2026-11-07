import { useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'
import { useNavigate } from 'react-router-dom'
import { parseVCard, type ParsedVCard } from '../../lib/vcard'
import { saveContact } from '../../hooks/useContacts'
import { useGroups } from '../../hooks/useGroups'
import { Avatar } from '../../components/Avatar'
import { FIELD_LABELS, type FieldKey } from '../../lib/profileFields'

type ScanState = 'scanning' | 'received' | 'denied' | 'unsupported'

const DISPLAY_FIELDS: FieldKey[] = ['company', 'title', 'workEmail', 'workPhone', 'linkedin', 'personalEmail', 'personalPhone', 'instagram', 'twitter']

export function ScanScreen() {
  const [state, setState] = useState<ScanState>(() =>
    typeof navigator.mediaDevices?.getUserMedia === 'function' ? 'scanning' : 'unsupported',
  )
  const [scanned, setScanned] = useState<ParsedVCard | null>(null)
  const [note, setNote] = useState('')
  const [groupInput, setGroupInput] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)
  const { groups, addGroup } = useGroups()
  const navigate = useNavigate()

  useEffect(() => {
    if (state !== 'scanning') return

    let active = true

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then((stream) => {
        if (!active) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(() => {})
        }
        const tick = () => {
          const video = videoRef.current
          const canvas = canvasRef.current
          if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            const ctx = canvas.getContext('2d')
            if (ctx) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
              const code = jsQR(imageData.data, imageData.width, imageData.height)
              if (code) {
                const parsed = parseVCard(code.data)
                if (parsed) {
                  setScanned(parsed)
                  setState('received')
                  return
                }
              }
            }
          }
          rafRef.current = requestAnimationFrame(tick)
        }
        rafRef.current = requestAnimationFrame(tick)
      })
      .catch(() => setState('denied'))

    return () => {
      active = false
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [state])

  const reset = () => {
    setScanned(null)
    setNote('')
    setGroupInput('')
    setState('scanning')
  }

  const confirmAdd = async () => {
    if (!scanned) return
    const groupId = (await addGroup(groupInput)) ?? null
    await saveContact({
      ...scanned,
      groupId,
      note: note.trim() || undefined,
      metAt: Date.now(),
    })
    navigate('/network')
    reset()
  }

  if (state === 'received' && scanned) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex shrink-0 items-center gap-2.5 px-6 pt-4 pb-2.5">
          <button type="button" onClick={reset} aria-label="Back to scanning" className="text-ink">
            ←
          </button>
          <div className="font-mono text-[10.5px] font-medium uppercase tracking-wider text-accent">Card received</div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-5">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3.5">
              <Avatar name={scanned.name} tone="warm" />
              <div>
                <div className="text-[17px] font-semibold">{scanned.name}</div>
                <div className="text-[13px] text-ink-dim">
                  {[scanned.title, scanned.company].filter(Boolean).join(' · ')}
                </div>
              </div>
            </div>

            <div className="shadow-card flex flex-col gap-3 rounded-2xl bg-surface p-4">
              {DISPLAY_FIELDS.filter((f) => scanned[f]).map((f) => (
                <div key={f} className="flex flex-col gap-0.5 border-b border-line pb-2.5 last:border-none last:pb-0">
                  <span className="font-mono text-[10.5px] uppercase tracking-wider text-ink-dim">{FIELD_LABELS[f]}</span>
                  <span className="text-[14px] font-medium">{scanned[f]}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <div className="font-mono text-[10.5px] uppercase tracking-wider text-ink-dim">Add to group</div>
              <div className="flex flex-wrap gap-2">
                {groups.map((g) => {
                  const active = g.name === groupInput
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGroupInput(g.name)}
                      className={`rounded-full border px-3 py-2 font-mono text-[11.5px] ${active ? 'shadow-btn' : ''}`}
                      style={{
                        background: active ? 'var(--color-accent)' : 'transparent',
                        color: active ? '#fff' : 'var(--color-ink-dim)',
                        borderColor: active ? 'var(--color-accent)' : 'var(--color-line)',
                      }}
                    >
                      {g.name}
                    </button>
                  )
                })}
              </div>
              <input
                className="shadow-card rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[13.5px] outline-none"
                placeholder="Or type a new group, e.g. AI CEO Course"
                value={groupInput}
                onChange={(e) => setGroupInput(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="font-mono text-[10.5px] uppercase tracking-wider text-ink-dim">Note</div>
              <textarea
                className="shadow-card min-h-20 rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[13.5px] outline-none"
                placeholder="Where you met, what you talked about…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="shrink-0 px-6 pt-2 pb-5">
          <button
            type="button"
            onClick={confirmAdd}
            className="shadow-btn block w-full rounded-xl py-3.25 text-center text-[15px] font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-deep))' }}
          >
            Add to Parichay{groupInput ? ` — ${groupInput}` : ''}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="relative flex-1 overflow-hidden bg-[#1b2420]">
        <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
        <canvas ref={canvasRef} className="hidden" />

        <div className="absolute inset-x-6 top-6.5 z-10 flex items-center justify-between">
          <span className="font-mono text-[10.5px] font-medium uppercase tracking-wider text-white">Scan a card</span>
        </div>

        <div className="absolute top-1/2 left-1/2 h-57.5 w-57.5 -translate-x-1/2 -translate-y-1/2">
          {(['top-0 left-0 rounded-tl-lg border-t-3 border-l-3', 'top-0 right-0 rounded-tr-lg border-t-3 border-r-3', 'bottom-0 left-0 rounded-bl-lg border-b-3 border-l-3', 'bottom-0 right-0 rounded-br-lg border-b-3 border-r-3'] as const).map(
            (cls) => (
              <div key={cls} className={`absolute h-8.5 w-8.5 border-white ${cls}`} />
            ),
          )}
        </div>

        <div className="absolute inset-x-6 bottom-30 z-10 text-center">
          {state === 'denied' && (
            <div className="text-[14px] font-medium text-white">
              Camera access was denied. Allow it in your browser's settings and reopen Scan.
            </div>
          )}
          {state === 'unsupported' && (
            <div className="text-[14px] font-medium text-white">This browser can't access the camera here.</div>
          )}
          {state === 'scanning' && (
            <>
              <div className="text-[14px] font-medium text-white">Point your camera at their card</div>
              <div className="mt-1 text-[12px] text-white/65">No signal needed — this works offline.</div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
