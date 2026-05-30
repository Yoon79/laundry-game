'use client'

import { useMemo } from 'react'
import type { LostItem } from './LostLaundry'

interface Props {
  item: LostItem
  onClose: () => void
}

// Canvas-drawn polaroid placeholder — swap src prop for real photos later
function PolaroidImage({ color, albumTitle }: { color: string; albumTitle: string }) {
  const dataUrl = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 360; c.height = 300
    const ctx = c.getContext('2d')!

    // Background wash — grainy film effect
    ctx.fillStyle = color
    ctx.fillRect(0, 0, 360, 300)

    // Grain overlay
    for (let i = 0; i < 6000; i++) {
      const x = Math.random() * 360
      const y = Math.random() * 300
      const a = Math.random() * 0.12
      ctx.fillStyle = `rgba(0,0,0,${a})`
      ctx.fillRect(x, y, 1, 1)
    }

    // Soft vignette
    const vign = ctx.createRadialGradient(180, 150, 60, 180, 150, 220)
    vign.addColorStop(0, 'rgba(0,0,0,0)')
    vign.addColorStop(1, 'rgba(0,0,0,0.42)')
    ctx.fillStyle = vign
    ctx.fillRect(0, 0, 360, 300)

    // Lighter center oval — "light leak"
    const light = ctx.createRadialGradient(200, 120, 0, 200, 120, 160)
    light.addColorStop(0, 'rgba(255,255,240,0.22)')
    light.addColorStop(1, 'rgba(255,255,240,0)')
    ctx.fillStyle = light
    ctx.fillRect(0, 0, 360, 300)

    // Stamp watermark
    ctx.save()
    ctx.globalAlpha = 0.18
    ctx.font = 'bold 38px serif'
    ctx.fillStyle = '#FFFFFF'
    ctx.textAlign = 'center'
    ctx.translate(180, 170)
    ctx.rotate(-0.18)
    ctx.fillText('SWEDEN LAUNDRY', 0, 0)
    ctx.restore()

    // Small decorative corners
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'
    ctx.lineWidth = 1.5
    ;[[8,8],[352,8],[8,292],[352,292]].forEach(([x,y]) => {
      const s = 14
      const sx = x < 180 ? 1 : -1
      const sy = y < 150 ? 1 : -1
      ctx.beginPath()
      ctx.moveTo(x, y + sy * s); ctx.lineTo(x, y); ctx.lineTo(x + sx * s, y)
      ctx.stroke()
    })

    return c.toDataURL()
  }, [color, albumTitle])

  return (
    <img
      src={dataUrl}
      alt={albumTitle}
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
    />
  )
}

export default function BehindPhoto({ item, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center"
      style={{ background: 'rgba(10,6,4,0.88)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      {/* Polaroid card */}
      <div
        className="relative flex flex-col"
        style={{
          background: '#F8F4EE',
          padding: '14px 14px 52px',
          boxShadow: '0 30px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(200,180,140,0.3)',
          maxWidth: 320,
          width: '88vw',
          transform: 'rotate(-1.5deg)',
          fontFamily: 'var(--font-space-mono), monospace',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Photo area */}
        <div style={{ width: '100%', aspectRatio: '4/3', overflow: 'hidden', background: item.color }}>
          <PolaroidImage color={item.color} albumTitle={item.albumTitle} />
        </div>

        {/* Polaroid caption strip */}
        <div className="mt-3 px-1">
          {/* Album title — handwritten feel */}
          <p
            className="text-[13px] font-bold tracking-tight mb-1"
            style={{
              color: '#2A1A08',
              fontFamily: 'var(--font-playfair), serif',
              fontSize: 17,
            }}
          >
            {item.albumTitle}
          </p>
          <p
            className="text-[10px] tracking-widest uppercase mb-2"
            style={{ color: '#A08050' }}
          >
            Behind the Scenes
          </p>
          <p
            className="text-[11px] leading-relaxed"
            style={{ color: '#5A4030' }}
          >
            {item.story}
          </p>
        </div>

        {/* Date stamp bottom-right */}
        <p
          className="absolute bottom-[14px] right-[16px] text-[9px] tracking-widest"
          style={{ color: '#B09060' }}
        >
          SWEDEN LAUNDRY · EST.2012
        </p>

        {/* Close ✕ */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-[20px] leading-none"
          style={{ color: '#A08050' }}
          aria-label="닫기"
        >
          ×
        </button>
      </div>

      {/* Hint */}
      <p
        className="absolute bottom-8 text-[11px] tracking-widest uppercase"
        style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-space-mono)' }}
      >
        클릭하면 닫힙니다
      </p>
    </div>
  )
}
