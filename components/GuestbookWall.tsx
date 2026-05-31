'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import type { GuestbookEntry } from '@/lib/guestbook'

// ── Board geometry ────────────────────────────────────────────────────────────
// Mounted on the RIGHT section of the facade exterior (between door pilaster
// at x=1.0 and right window frame at x≈1.96), facing outward (+z).

const BX   = 1.48   // board centre x
const BY   = 1.55   // board centre y
const BZ   = 5.62   // z — just in front of facade (FACADE_Z=5.5)
const BW   = 0.86   // board width  (fits between pilaster x=1.0 and window x=1.96)
const BH   = 1.68   // board height (wainscot top ~0.9 → just above door arch)
const FT   = 0.055  // frame rail thickness
const FD   = 0.048  // frame depth

// ── Note size & slot layout ────────────────────────────────────────────────────
// 3 cols × 3 rows = 9 note slots, evenly distributed within the cork area.
// Slight y jitter per slot for natural "pinned" look.

const NOTE_W = 0.200   // note width  (world units)
const NOTE_H = 0.148   // note height

const NOTE_SLOTS: [number, number][] = [
  // row 1 — upper
  [1.18, 1.99], [1.48, 2.04], [1.78, 1.97],
  // row 2 — middle
  [1.18, 1.42], [1.48, 1.47], [1.78, 1.40],
  // row 3 — lower
  [1.18, 0.88], [1.48, 0.83], [1.78, 0.91],
]
const SLOT_MAX = NOTE_SLOTS.length  // 9

// Slight tilt per slot for natural appearance
const TILTS = [-1.4, 1.0, -0.7, 1.6, -1.0, 0.5, -1.6, 0.9, -0.4]

// ── Cork board decoration ─────────────────────────────────────────────────────

function GuestbookBoard() {
  // Cork texture
  const corkTex = useMemo(() => {
    const W = 128, H = 256
    const c = document.createElement('canvas'); c.width = W; c.height = H
    const ctx = c.getContext('2d')!

    // Base warm tan
    ctx.fillStyle = '#C8A870'; ctx.fillRect(0, 0, W, H)

    // Horizontal grain streaks
    for (let i = 0; i < 48; i++) {
      const yy = (i / 48) * H
      const l = 42 + Math.round(Math.sin(i * 0.72) * 7)
      ctx.fillStyle = `hsl(34, 48%, ${l}%)`
      ctx.fillRect(0, yy, W, 2 + (i % 3))
    }

    // Darker cork patches (cell walls)
    for (let i = 0; i < 18; i++) {
      const x = (i * 37) % W, y = (i * 53 + 17) % H
      ctx.fillStyle = 'rgba(90,50,18,0.13)'
      ctx.beginPath()
      ctx.ellipse(x, y, 9 + i % 8, 3 + i % 3, i * 0.28, 0, Math.PI * 2)
      ctx.fill()
    }

    // Lighter highlight patches
    for (let i = 0; i < 10; i++) {
      const x = (i * 67) % W, y = (i * 41 + 5) % H
      ctx.fillStyle = 'rgba(240,200,120,0.10)'
      ctx.beginPath()
      ctx.ellipse(x, y, 14 + i % 10, 5 + i % 4, i * 0.5, 0, Math.PI * 2)
      ctx.fill()
    }

    const tex = new THREE.CanvasTexture(c)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(1.5, 3)
    return tex
  }, [])

  // Title plate texture ("방명록")
  const titleTex = useMemo(() => {
    const W = 200, H = 52
    const c = document.createElement('canvas'); c.width = W; c.height = H
    const ctx = c.getContext('2d')!

    // Gold plate base
    const g = ctx.createLinearGradient(0, 0, 0, H)
    g.addColorStop(0, '#D4A840'); g.addColorStop(1, '#B88C28')
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)

    // Engraved text effect
    ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 2
    ctx.fillStyle = '#3A1808'
    ctx.font = 'bold 28px serif'
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('방  명  록', W / 2, H / 2)
    ctx.shadowBlur = 0

    return new THREE.CanvasTexture(c)
  }, [])

  const woodMat = <meshStandardMaterial color="#6A3E18" roughness={0.65} />
  const halfW = BW / 2, halfH = BH / 2

  return (
    <group position={[BX, BY, BZ]}>
      {/* ── Cork surface ── */}
      <mesh>
        <planeGeometry args={[BW - FT * 2, BH - FT * 2]} />
        <meshStandardMaterial map={corkTex} roughness={0.92} />
      </mesh>

      {/* ── Wooden frame rails ── */}
      {/* Top */}
      <mesh position={[0, halfH - FT / 2, FD / 2]}>
        <boxGeometry args={[BW, FT, FD]} />{woodMat}
      </mesh>
      {/* Bottom */}
      <mesh position={[0, -halfH + FT / 2, FD / 2]}>
        <boxGeometry args={[BW, FT, FD]} />{woodMat}
      </mesh>
      {/* Left */}
      <mesh position={[-halfW + FT / 2, 0, FD / 2]}>
        <boxGeometry args={[FT, BH - FT * 2, FD]} />{woodMat}
      </mesh>
      {/* Right */}
      <mesh position={[halfW - FT / 2, 0, FD / 2]}>
        <boxGeometry args={[FT, BH - FT * 2, FD]} />{woodMat}
      </mesh>

      {/* ── Corner pegs (decorative nails) ── */}
      {([[-1,1],[1,1],[-1,-1],[1,-1]] as const).map(([sx,sy],i) => (
        <mesh key={i}
          position={[sx*(halfW - FT * 1.5), sy*(halfH - FT * 1.5), FD + 0.01]}>
          <sphereGeometry args={[0.018, 8, 6]} />
          <meshStandardMaterial color="#C89040" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}

      {/* ── Title plate ── */}
      <mesh position={[0, halfH - FT * 1.6, FD + 0.01]}>
        <planeGeometry args={[0.32, 0.075]} />
        <meshStandardMaterial map={titleTex} roughness={0.35} metalness={0.25} />
      </mesh>

      {/* ── Shadow (card behind board for depth) ── */}
      <mesh position={[0.01, -0.01, -0.005]}>
        <planeGeometry args={[BW + 0.02, BH + 0.02]} />
        <meshStandardMaterial color="#1A0A00" transparent opacity={0.18} depthWrite={false} />
      </mesh>
    </group>
  )
}

// ── Note texture ──────────────────────────────────────────────────────────────

const _noteCache = new Map<string, THREE.CanvasTexture>()

function getNoteTexture(entry: GuestbookEntry): THREE.CanvasTexture {
  if (_noteCache.has(entry.id)) return _noteCache.get(entry.id)!

  const W = 220, H = 160
  const c = document.createElement('canvas'); c.width = W; c.height = H
  const ctx = c.getContext('2d')!

  // Paper colours (rotate through 4 pastel tones)
  const papers = ['#FBF5E8', '#F5F0E8', '#EEF5E8', '#E8F0F5']
  ctx.fillStyle = papers[parseInt(entry.id.slice(-1), 16) % papers.length]
  ctx.fillRect(0, 0, W, H)

  // Subtle grain
  ctx.fillStyle = 'rgba(150,110,60,0.05)'
  for (let i = 0; i < 30; i++) ctx.fillRect((i * 41) % W, (i * 31) % H, 3, 1)

  // Ruled lines
  ctx.strokeStyle = 'rgba(140,110,70,0.18)'; ctx.lineWidth = 1
  for (let y = 38; y < H - 14; y += 16) {
    ctx.beginPath(); ctx.moveTo(14, y); ctx.lineTo(W - 14, y); ctx.stroke()
  }

  // Left margin line
  ctx.strokeStyle = 'rgba(200,80,60,0.22)'; ctx.lineWidth = 1.2
  ctx.beginPath(); ctx.moveTo(34, 14); ctx.lineTo(34, H - 14); ctx.stroke()

  // Tape strip at top
  ctx.fillStyle = 'rgba(210,190,130,0.30)'
  ctx.fillRect(W / 2 - 20, 0, 40, 8)

  // Pin dot
  ctx.fillStyle = 'rgba(150,60,40,0.60)'
  ctx.beginPath(); ctx.arc(W / 2, 5, 4, 0, Math.PI * 2); ctx.fill()

  // Date
  const date = new Date(entry.timestamp)
  ctx.fillStyle = '#A07848'; ctx.font = '10px monospace'; ctx.textAlign = 'right'
  ctx.fillText(`${date.getMonth() + 1}/${date.getDate()}`, W - 10, 16)

  // Message text (wrapped)
  ctx.fillStyle = '#2A1808'
  const fs = entry.text.length > 36 ? 12 : 14
  ctx.font = `${fs}px serif`; ctx.textAlign = 'left'
  const mw = W - 50
  const words = entry.text.split(' ')
  const lines: string[] = []; let cur = ''
  for (const w of words) {
    const t = cur ? `${cur} ${w}` : w
    if (ctx.measureText(t).width > mw && cur) { lines.push(cur); cur = w }
    else cur = t
  }
  if (cur) lines.push(cur)
  lines.slice(0, 6).forEach((ln, i) => ctx.fillText(ln, 40, 34 + i * 16))

  const tex = new THREE.CanvasTexture(c)
  _noteCache.set(entry.id, tex)
  return tex
}

// ── Single pinned note ────────────────────────────────────────────────────────

interface NoteProps {
  entry: GuestbookEntry
  slotIndex: number
  onSelect: (entry: GuestbookEntry) => void
}

function Note({ entry, slotIndex, onSelect }: NoteProps) {
  const [x, y] = NOTE_SLOTS[slotIndex % SLOT_MAX]
  const tilt   = (TILTS[slotIndex % TILTS.length] ?? 0) * Math.PI / 180
  const tex    = useMemo(() => getNoteTexture(entry), [entry])

  return (
    <group
      position={[x, y, BZ + 0.02]}
      rotation={[0, 0, tilt]}
      onClick={e => { e.stopPropagation(); onSelect(entry) }}
    >
      {/* Paper */}
      <mesh>
        <planeGeometry args={[NOTE_W, NOTE_H]} />
        <meshStandardMaterial map={tex} roughness={0.82} />
      </mesh>
      {/* Drop shadow */}
      <mesh position={[0.006, -0.006, -0.002]}>
        <planeGeometry args={[NOTE_W + 0.008, NOTE_H + 0.008]} />
        <meshStandardMaterial color="#1A0A00" transparent opacity={0.14} depthWrite={false} />
      </mesh>
    </group>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

interface GuestbookWallProps {
  entries: GuestbookEntry[]
  onSelectEntry: (entry: GuestbookEntry) => void
}

export default function GuestbookWall({ entries, onSelectEntry }: GuestbookWallProps) {
  const visible = entries.slice(0, SLOT_MAX)
  return (
    <group>
      {/* The cork bulletin board */}
      <GuestbookBoard />
      {/* Notes pinned on it */}
      {visible.map((entry, i) => (
        <Note key={entry.id} entry={entry} slotIndex={i} onSelect={onSelectEntry} />
      ))}
    </group>
  )
}
