'use client'

import type { Album } from '@/lib/albums'

interface Props {
  album: Album
  onClose: () => void
}

export default function AlbumPanel({ album, onClose }: Props) {
  const totalSeconds = album.tracks.reduce((sum, t) => {
    const [m, s] = t.duration.split(':').map(Number)
    return sum + m * 60 + s
  }, 0)
  const totalMin = Math.floor(totalSeconds / 60)
  const totalSec = totalSeconds % 60

  return (
    /* Full-screen backdrop */
    <div
      className="fixed inset-0 z-30 flex items-center justify-center"
      style={{ background: 'rgba(20,12,6,0.72)', backdropFilter: 'blur(3px)' }}
      onClick={onClose}
    >
      {/* Panel card */}
      <div
        className="relative flex flex-col max-h-[88vh] w-[min(480px,92vw)] overflow-hidden"
        style={{
          background: '#FAF4EC',
          border: '2px solid #C8A870',
          fontFamily: 'var(--font-space-mono), monospace',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Colour accent bar */}
        <div style={{ height: 8, background: album.color }} />

        {/* Header */}
        <div className="px-7 pt-5 pb-4" style={{ borderBottom: '1px solid #D8C8A8' }}>
          {/* Artist + year + type */}
          <div
            className="flex items-center justify-between mb-2 text-[10px] tracking-[0.18em] uppercase"
            style={{ color: '#9A7A50' }}
          >
            <span>Sweden Laundry</span>
            <span>{album.year} · {album.type}</span>
          </div>

          {/* Album title */}
          <h2
            className="text-2xl leading-tight mb-1"
            style={{
              fontFamily: 'var(--font-playfair), serif',
              color: '#2A1A08',
              letterSpacing: '-0.01em',
            }}
          >
            {album.title}
          </h2>
          <p
            className="text-[11px] tracking-wider mb-3"
            style={{ color: '#8A6A40' }}
          >
            {album.titleEn}
          </p>

          {/* Description */}
          <p
            className="text-[12px] leading-relaxed"
            style={{ color: '#5A4030' }}
          >
            {album.description}
          </p>
        </div>

        {/* Track listing (scrollable) */}
        <div className="overflow-y-auto flex-1 px-7 py-4">
          {album.tracks.map((track) => (
            <div
              key={track.number}
              className="flex items-baseline justify-between py-[5px] text-[12px]"
              style={{
                borderBottom: '1px solid rgba(180,150,100,0.15)',
                color: '#3A2810',
              }}
            >
              <div className="flex items-baseline gap-3 min-w-0">
                <span
                  className="shrink-0 text-[10px] tabular-nums"
                  style={{ color: '#A08050', width: '1.6em', textAlign: 'right' }}
                >
                  {track.number}
                </span>
                <span className="truncate">{track.title}</span>
              </div>
              <span
                className="shrink-0 ml-4 tabular-nums text-[11px]"
                style={{ color: '#9A7A50' }}
              >
                {track.duration}
              </span>
            </div>
          ))}

          {/* Total time */}
          <div
            className="flex justify-between mt-3 pt-2 text-[10px] tracking-widest uppercase"
            style={{ color: '#9A7A50', borderTop: '1px solid #D8C8A8' }}
          >
            <span>{album.tracks.length} tracks</span>
            <span>{totalMin}:{String(totalSec).padStart(2, '0')} total</span>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-[18px] leading-none"
          style={{ color: '#A08050' }}
          aria-label="Close"
        >
          ×
        </button>

        {/* Bottom decorative rule */}
        <div
          className="px-7 py-2 text-center text-[9px] tracking-[0.22em] uppercase"
          style={{ color: '#B09060', borderTop: '1px solid #D8C8A8' }}
        >
          스웨덴세탁소 · EST. 2012 · Click anywhere to close
        </div>
      </div>
    </div>
  )
}
