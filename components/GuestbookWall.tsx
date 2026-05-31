'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import type { GuestbookEntry } from '@/lib/guestbook'

// ── Stand world position ──────────────────────────────────────────────────────
// Placed to the LEFT of the bench [3.0, 0, 6.4], between bench and entrance.
// rotationY faces the sign slightly toward approaching visitors.

const PX    =  2.2     // world x (left of bench)
const PZ    =  7.0     // world z (slightly toward player)
const ROT_Y =  0.30    // slight rotation toward entrance

// ── Easel geometry constants ──────────────────────────────────────────────────
const LEG_R  = 0.018   // leg cylinder radius
const LEG_H  = 1.30    // leg length from foot to pivot
const SPREAD = 0.28    // half-spread of front legs at floor
const BACK_D = 0.38    // back leg depth at floor

// Board (in easel local coords; board face at z ≈ 0)
const BW = 0.68        // board width
const BH = 0.88        // board height
const BY = 0.78        // board centre y (above ground)

// Note size & 3×3 grid inside board (local coords)
const NOTE_W   = 0.175
const NOTE_H   = 0.130
const SLOT_MAX = 9
const NOTE_SLOTS: [number, number][] = [
  // row 1 — top (below title plate)
  [-0.20, 1.02], [0.00, 1.05], [0.20, 1.00],
  // row 2 — middle
  [-0.20, 0.71], [0.00, 0.74], [0.20, 0.69],
  // row 3 — lower
  [-0.20, 0.40], [0.00, 0.37], [0.20, 0.43],
]
const TILTS = [-1.3, 0.9, -0.6, 1.5, -0.9, 0.4, -1.4, 0.8, -0.3]

// ── Cork texture (module-level, created once) ─────────────────────────────────

let _corkTex: THREE.CanvasTexture | null = null
function getCorkTex() {
  if (_corkTex) return _corkTex
  const W = 128, H = 256
  const c = document.createElement('canvas'); c.width = W; c.height = H
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#C8A870'; ctx.fillRect(0, 0, W, H)
  for (let i = 0; i < 52; i++) {
    const yy = (i / 52) * H
    const l = 43 + Math.round(Math.sin(i * 0.7) * 7)
    ctx.fillStyle = `hsl(34, 48%, ${l}%)`; ctx.fillRect(0, yy, W, 2 + (i % 3))
  }
  for (let i = 0; i < 20; i++) {
    const x = (i * 37) % W, y = (i * 53 + 17) % H
    ctx.fillStyle = 'rgba(90,50,18,0.12)'
    ctx.beginPath(); ctx.ellipse(x, y, 9+i%7, 3+i%3, i*0.3, 0, Math.PI*2); ctx.fill()
  }
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1.2, 2.5)
  _corkTex = t; return t
}

let _titleTex: THREE.CanvasTexture | null = null
function getTitleTex() {
  if (_titleTex) return _titleTex
  const W = 220, H = 56
  const c = document.createElement('canvas'); c.width = W; c.height = H
  const ctx = c.getContext('2d')!
  const g = ctx.createLinearGradient(0, 0, 0, H)
  g.addColorStop(0, '#D4A840'); g.addColorStop(1, '#B88C28')
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)
  ctx.shadowColor = 'rgba(0,0,0,0.30)'; ctx.shadowBlur = 2
  ctx.fillStyle = '#3A1808'; ctx.font = 'bold 28px serif'
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText('방  명  록', W/2, H/2)
  _titleTex = new THREE.CanvasTexture(c); return _titleTex
}

// ── Easel stand component ─────────────────────────────────────────────────────

function EaselStand() {
  const corkTex  = useMemo(() => getCorkTex(), [])
  const titleTex = useMemo(() => getTitleTex(), [])

  // Computed leg geometry
  const frontLen = Math.sqrt(SPREAD * SPREAD + LEG_H * LEG_H)  // ≈ 1.33 m
  const frontAng = Math.atan(SPREAD / LEG_H)                   // ≈ 0.212 rad
  const backLen  = Math.sqrt(BACK_D * BACK_D + LEG_H * LEG_H) // ≈ 1.36 m
  const backAng  = Math.atan(BACK_D / LEG_H)                   // ≈ 0.284 rad

  const woodMat  = <meshStandardMaterial color="#7A5018" roughness={0.60} />
  const frameMat = <meshStandardMaterial color="#6A3E14" roughness={0.65} />
  const FT = 0.048  // frame rail thickness
  const FD = 0.040  // frame depth

  return (
    <group>
      {/* ── Front-left leg ── */}
      <mesh
        position={[-SPREAD / 2, LEG_H / 2, 0]}
        rotation={[0, 0, frontAng]}
      >
        <cylinderGeometry args={[LEG_R, LEG_R * 1.2, frontLen, 8]} />{woodMat}
      </mesh>

      {/* ── Front-right leg ── */}
      <mesh
        position={[SPREAD / 2, LEG_H / 2, 0]}
        rotation={[0, 0, -frontAng]}
      >
        <cylinderGeometry args={[LEG_R, LEG_R * 1.2, frontLen, 8]} />{woodMat}
      </mesh>

      {/* ── Back support leg ── */}
      <mesh
        position={[0, LEG_H / 2, -BACK_D / 2]}
        rotation={[backAng, 0, 0]}
      >
        <cylinderGeometry args={[LEG_R * 0.85, LEG_R, backLen, 8]} />{woodMat}
      </mesh>

      {/* ── Top crossbar (hinge bar) ── */}
      <mesh position={[0, LEG_H, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[LEG_R * 0.8, LEG_R * 0.8, SPREAD * 1.2, 8]} />{woodMat}
      </mesh>

      {/* ── Bottom rope / cross-brace ── */}
      <mesh position={[0, 0.14, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.006, 0.006, SPREAD * 1.6, 6]} />
        <meshStandardMaterial color="#A07840" roughness={0.85} />
      </mesh>

      {/* ── Rubber foot caps ── */}
      {([-SPREAD / 2, SPREAD / 2] as number[]).map((x, i) => (
        <mesh key={i} position={[x, 0.01, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.02, 8]} />
          <meshStandardMaterial color="#2A1808" roughness={0.95} />
        </mesh>
      ))}

      {/* ── Cork board surface ── */}
      <mesh position={[0, BY, 0.02]}>
        <planeGeometry args={[BW - FT * 2, BH - FT * 2]} />
        <meshStandardMaterial map={corkTex} roughness={0.92} />
      </mesh>

      {/* ── Wooden frame ── */}
      {/* Top rail */}
      <mesh position={[0, BY + BH/2 - FT/2, 0.025]}>
        <boxGeometry args={[BW, FT, FD]} />{frameMat}
      </mesh>
      {/* Bottom rail */}
      <mesh position={[0, BY - BH/2 + FT/2, 0.025]}>
        <boxGeometry args={[BW, FT, FD]} />{frameMat}
      </mesh>
      {/* Left rail */}
      <mesh position={[-BW/2 + FT/2, BY, 0.025]}>
        <boxGeometry args={[FT, BH - FT*2, FD]} />{frameMat}
      </mesh>
      {/* Right rail */}
      <mesh position={[BW/2 - FT/2, BY, 0.025]}>
        <boxGeometry args={[FT, BH - FT*2, FD]} />{frameMat}
      </mesh>

      {/* ── Corner brass pegs ── */}
      {([[-1,1],[1,1],[-1,-1],[1,-1]] as const).map(([sx,sy],i) => (
        <mesh key={i}
          position={[sx*(BW/2 - FT*1.4), BY + sy*(BH/2 - FT*1.4), 0.048]}>
          <sphereGeometry args={[0.016, 8, 6]} />
          <meshStandardMaterial color="#C89040" metalness={0.72} roughness={0.28} />
        </mesh>
      ))}

      {/* ── Title plate ── */}
      <mesh position={[0, BY + BH/2 - FT*1.8, 0.050]}>
        <planeGeometry args={[0.34, 0.068]} />
        <meshStandardMaterial map={titleTex} roughness={0.32} metalness={0.28} />
      </mesh>

      {/* ── Board drop shadow ── */}
      <mesh position={[0.008, BY - 0.008, 0.005]}>
        <planeGeometry args={[BW + 0.02, BH + 0.02]} />
        <meshStandardMaterial color="#100600" transparent opacity={0.16} depthWrite={false} />
      </mesh>
    </group>
  )
}

// ── Note texture cache ────────────────────────────────────────────────────────

const _noteCache = new Map<string, THREE.CanvasTexture>()

function getNoteTexture(entry: GuestbookEntry): THREE.CanvasTexture {
  if (_noteCache.has(entry.id)) return _noteCache.get(entry.id)!
  const W = 200, H = 148
  const c = document.createElement('canvas'); c.width = W; c.height = H
  const ctx = c.getContext('2d')!

  // Pastel paper (4 tones)
  const papers = ['#FBF5E8', '#F5F0E8', '#EEF5E8', '#E8F0F5']
  ctx.fillStyle = papers[parseInt(entry.id.slice(-1), 16) % papers.length]
  ctx.fillRect(0, 0, W, H)

  // Grain
  ctx.fillStyle = 'rgba(140,100,50,0.05)'
  for (let i = 0; i < 28; i++) ctx.fillRect((i*41)%W, (i*31)%H, 3, 1)

  // Ruled lines
  ctx.strokeStyle = 'rgba(130,100,60,0.16)'; ctx.lineWidth = 1
  for (let y = 36; y < H - 12; y += 15) {
    ctx.beginPath(); ctx.moveTo(12, y); ctx.lineTo(W-12, y); ctx.stroke()
  }
  // Red margin
  ctx.strokeStyle = 'rgba(200,70,50,0.20)'; ctx.lineWidth = 1.2
  ctx.beginPath(); ctx.moveTo(32, 12); ctx.lineTo(32, H-12); ctx.stroke()

  // Tape + pin
  ctx.fillStyle = 'rgba(210,185,125,0.28)'
  ctx.fillRect(W/2 - 18, 0, 36, 7)
  ctx.fillStyle = 'rgba(140,55,35,0.55)'
  ctx.beginPath(); ctx.arc(W/2, 4, 3.5, 0, Math.PI*2); ctx.fill()

  // Date
  const date = new Date(entry.timestamp)
  ctx.fillStyle = '#A07848'; ctx.font = '10px monospace'; ctx.textAlign = 'right'
  ctx.fillText(`${date.getMonth()+1}/${date.getDate()}`, W-8, 15)

  // Message
  ctx.fillStyle = '#2A1808'
  const fs = entry.text.length > 30 ? 11 : 13
  ctx.font = `${fs}px serif`; ctx.textAlign = 'left'
  const words = entry.text.split(' ')
  const lines: string[] = []; let cur = ''
  for (const w of words) {
    const t = cur ? `${cur} ${w}` : w
    if (ctx.measureText(t).width > W-46 && cur) { lines.push(cur); cur = w } else cur = t
  }
  if (cur) lines.push(cur)
  lines.slice(0, 6).forEach((ln, i) => ctx.fillText(ln, 38, 32 + i*15))

  const tex = new THREE.CanvasTexture(c)
  _noteCache.set(entry.id, tex); return tex
}

// ── Single pinned note ────────────────────────────────────────────────────────

interface NoteProps {
  entry: GuestbookEntry
  slotIndex: number
  onSelect: (entry: GuestbookEntry) => void
}

function Note({ entry, slotIndex, onSelect }: NoteProps) {
  const [lx, ly] = NOTE_SLOTS[slotIndex % SLOT_MAX]
  const tilt = (TILTS[slotIndex % TILTS.length] ?? 0) * Math.PI / 180
  const tex  = useMemo(() => getNoteTexture(entry), [entry])

  return (
    <group
      position={[lx, ly, 0.05]}  // local coords within stand group
      rotation={[0, 0, tilt]}
      onClick={e => { e.stopPropagation(); onSelect(entry) }}
    >
      <mesh>
        <planeGeometry args={[NOTE_W, NOTE_H]} />
        <meshStandardMaterial map={tex} roughness={0.84} />
      </mesh>
      {/* Drop shadow */}
      <mesh position={[0.005, -0.005, -0.002]}>
        <planeGeometry args={[NOTE_W+0.006, NOTE_H+0.006]} />
        <meshStandardMaterial color="#100600" transparent opacity={0.13} depthWrite={false} />
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
    // Stand group — rotated slightly toward visitor, placed left of bench
    <group position={[PX, 0, PZ]} rotation={[0, ROT_Y, 0]}>
      <EaselStand />
      {visible.map((entry, i) => (
        <Note key={entry.id} entry={entry} slotIndex={i} onSelect={onSelectEntry} />
      ))}
    </group>
  )
}
