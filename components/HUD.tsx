interface Props {
  locked: boolean
}

export default function HUD({ locked }: Props) {
  return (
    <div className="pointer-events-none fixed inset-0 z-10">
      {/* Center crosshair */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[5px] h-[5px] rounded-full bg-[#5A3E32]/50" />
      </div>

      {/* "Click to explore" hint when unlocked */}
      {!locked && (
        <div className="absolute inset-0 flex items-end justify-center pb-16">
          <p
            className="text-[#5A3E32]/70 text-[10px] tracking-[0.45em] uppercase animate-pulse"
            style={{ fontFamily: 'var(--font-space-mono)' }}
          >
            Click to explore
          </p>
        </div>
      )}

      {/* Controls hint when locked */}
      {locked && (
        <div className="absolute bottom-7 left-1/2 -translate-x-1/2">
          <p
            className="text-[#5A3E32]/35 text-[9px] tracking-[0.35em] uppercase"
            style={{ fontFamily: 'var(--font-space-mono)' }}
          >
            WASD 이동 &nbsp;·&nbsp; 마우스 시점 &nbsp;·&nbsp; ESC 일시정지
          </p>
        </div>
      )}
    </div>
  )
}
