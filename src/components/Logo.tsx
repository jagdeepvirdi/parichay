/** The Parichay "P with two contact cards" mark. A transparent PNG kept in
 * public/ and listed in the PWA `includeAssets` so it renders offline. */
export function Logo({ size = 15 }: { size?: number }) {
  return <img src="/logo-mark.png" width={size} height={size} alt="" className="shrink-0" draggable={false} />
}

export function Wordmark() {
  return (
    <div className="flex items-center gap-2.5">
      <Logo size={30} />
      <span className="font-display text-[20px] font-bold tracking-[-0.035em] text-ink">
        Parichay
      </span>
    </div>
  )
}
