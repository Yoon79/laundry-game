'use client'

import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import type { GuestbookEntry } from '@/lib/guestbook'
import { touchState } from '@/lib/touchState'

// ── Stand world position ──────────────────────────────────────────────────────
// Behind and to the left of bench [3.0, 0, 6.4], propped against the building.
// PZ < bench z=6.4 → sign appears behind the bench when viewed from outside.

const PX    =  2.4     // world x (left of bench)
const PZ    =  5.95    // world z — behind bench, near building wall (z=5.5)
const ROT_Y =  0.18    // slight angle toward approaching visitor

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

// ── Wes Anderson palette ──────────────────────────────────────────────────────
// Ties to the building: MINT walls (#A0C898), CREAM cornice (#F0E8DC),
// warm amber board, dusty rose title → coherent, cinematic.

const WA_CREAM  = '#EDE4CE'   // legs / top rail
const WA_MINT   = '#98B890'   // side/bottom rails (matches building)
const WA_AMBER  = '#C4A040'   // cork board face
const WA_PLATE  = '#E8CFC0'   // title plate (dusty rose-peach)
const WA_WOOD   = '#8A5C28'   // foot caps / back leg

let _corkTex: THREE.CanvasTexture | null = null
function getCorkTex() {
  if (_corkTex) return _corkTex
  const W = 128, H = 256
  const c = document.createElement('canvas'); c.width = W; c.height = H
  const ctx = c.getContext('2d')!

  // Rich amber cork base
  ctx.fillStyle = WA_AMBER; ctx.fillRect(0, 0, W, H)

  // Horizontal grain in amber tones
  for (let i = 0; i < 52; i++) {
    const yy = (i / 52) * H
    const l = 38 + Math.round(Math.sin(i * 0.72) * 6)
    ctx.fillStyle = `hsl(40, 68%, ${l}%)`
    ctx.fillRect(0, yy, W, 2 + (i % 3))
  }

  // Darker cork cell patches
  for (let i = 0; i < 18; i++) {
    const x = (i * 37) % W, y = (i * 53 + 17) % H
    ctx.fillStyle = 'rgba(100,60,12,0.14)'
    ctx.beginPath(); ctx.ellipse(x, y, 9+i%7, 3+i%3, i*0.32, 0, Math.PI*2); ctx.fill()
  }

  // Lighter honey highlights
  for (let i = 0; i < 10; i++) {
    const x = (i * 61) % W, y = (i * 43) % H
    ctx.fillStyle = 'rgba(255,210,80,0.08)'
    ctx.beginPath(); ctx.ellipse(x, y, 12+i%9, 4+i%3, i*0.45, 0, Math.PI*2); ctx.fill()
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

  // Dusty rose-peach plate
  const g = ctx.createLinearGradient(0, 0, 0, H)
  g.addColorStop(0, '#EED4C4'); g.addColorStop(1, '#D8B8A8')
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)

  // Thin border
  ctx.strokeStyle = 'rgba(120,70,40,0.30)'; ctx.lineWidth = 1.5
  ctx.strokeRect(4, 4, W-8, H-8)

  // Text
  ctx.shadowColor = 'rgba(80,30,10,0.22)'; ctx.shadowBlur = 1.5
  ctx.fillStyle = '#4A2410'; ctx.font = 'bold 26px "Mona12", sans-serif'
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText('방  명  록', W/2, H/2)
  ctx.shadowBlur = 0

  _titleTex = new THREE.CanvasTexture(c); return _titleTex
}

// ── Easel stand component ─────────────────────────────────────────────────────

function EaselStand({ onBoardClick }: { onBoardClick?: () => void }) {
  const [boardHovered, setBoardHovered] = useState(false)
  const corkTex  = useMemo(() => getCorkTex(), [])
  const titleTex = useMemo(() => getTitleTex(), [])

  // Computed leg geometry
  const frontLen = Math.sqrt(SPREAD * SPREAD + LEG_H * LEG_H)  // ≈ 1.33 m
  const frontAng = Math.atan(SPREAD / LEG_H)                   // ≈ 0.212 rad
  const backLen  = Math.sqrt(BACK_D * BACK_D + LEG_H * LEG_H) // ≈ 1.36 m
  const backAng  = Math.atan(BACK_D / LEG_H)                   // ≈ 0.284 rad

  // Wes Anderson palette materials
  const legMat   = <meshStandardMaterial color={WA_CREAM} roughness={0.55} />
  const railTopB = <meshStandardMaterial color={WA_CREAM} roughness={0.55} />  // top+bottom rail
  const railSide = <meshStandardMaterial color={WA_MINT}  roughness={0.58} />  // side rails
  const backMat  = <meshStandardMaterial color={WA_WOOD}  roughness={0.72} />
  const FT = 0.048  // frame rail thickness
  const FD = 0.040  // frame depth

  return (
    <group>
      {/* ── Front-left leg (CREAM) ── */}
      <mesh position={[-SPREAD / 2, LEG_H / 2, 0]} rotation={[0, 0, frontAng]}>
        <cylinderGeometry args={[LEG_R, LEG_R * 1.2, frontLen, 8]} />{legMat}
      </mesh>

      {/* ── Front-right leg (CREAM) ── */}
      <mesh position={[SPREAD / 2, LEG_H / 2, 0]} rotation={[0, 0, -frontAng]}>
        <cylinderGeometry args={[LEG_R, LEG_R * 1.2, frontLen, 8]} />{legMat}
      </mesh>

      {/* ── Back support leg (warm wood) ── */}
      <mesh position={[0, LEG_H / 2, -BACK_D / 2]} rotation={[backAng, 0, 0]}>
        <cylinderGeometry args={[LEG_R * 0.85, LEG_R, backLen, 8]} />{backMat}
      </mesh>

      {/* ── Top crossbar (hinge, CREAM) ── */}
      <mesh position={[0, LEG_H, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[LEG_R * 0.8, LEG_R * 0.8, SPREAD * 1.2, 8]} />{legMat}
      </mesh>

      {/* ── Bottom rope / brace (dusty rope color) ── */}
      <mesh position={[0, 0.14, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.006, 0.006, SPREAD * 1.6, 6]} />
        <meshStandardMaterial color="#C8A870" roughness={0.88} />
      </mesh>

      {/* ── Foot caps (warm wood) ── */}
      {([-SPREAD / 2, SPREAD / 2] as number[]).map((x, i) => (
        <mesh key={i} position={[x, 0.01, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.02, 8]} />{backMat}
        </mesh>
      ))}

      {/* ── Cork board surface — clickable, glows on hover ── */}
      <mesh
        position={[0, BY, 0.02]}
        onClick={(e) => { e.stopPropagation(); onBoardClick?.() }}
        onPointerOver={(e) => { e.stopPropagation(); if (document.pointerLockElement) setBoardHovered(true) }}
        onPointerOut={() => setBoardHovered(false)}
      >
        <planeGeometry args={[BW - FT * 2, BH - FT * 2]} />
        <meshStandardMaterial
          map={corkTex}
          roughness={0.92}
          emissive={new THREE.Color('#FFD878')}
          emissiveIntensity={boardHovered ? 0.28 : 0}
        />
      </mesh>
      {/* Hover glow point light */}
      {boardHovered && (
        <pointLight position={[0, BY, 0.6]} color="#FFD060" intensity={0.8} distance={1.2} />
      )}

      {/* ── Frame rails: top+bottom CREAM, sides MINT ── */}
      {/* Top rail */}
      <mesh position={[0, BY + BH/2 - FT/2, 0.025]}>
        <boxGeometry args={[BW, FT, FD]} />{railTopB}
      </mesh>
      {/* Bottom rail */}
      <mesh position={[0, BY - BH/2 + FT/2, 0.025]}>
        <boxGeometry args={[BW, FT, FD]} />{railTopB}
      </mesh>
      {/* Left rail (MINT) */}
      <mesh position={[-BW/2 + FT/2, BY, 0.025]}>
        <boxGeometry args={[FT, BH - FT*2, FD]} />{railSide}
      </mesh>
      {/* Right rail (MINT) */}
      <mesh position={[BW/2 - FT/2, BY, 0.025]}>
        <boxGeometry args={[FT, BH - FT*2, FD]} />{railSide}
      </mesh>

      {/* ── Corner pegs (dusty rose, matching title plate) ── */}
      {([[-1,1],[1,1],[-1,-1],[1,-1]] as const).map(([sx,sy],i) => (
        <mesh key={i}
          position={[sx*(BW/2 - FT*1.4), BY + sy*(BH/2 - FT*1.4), 0.048]}>
          <sphereGeometry args={[0.016, 8, 6]} />
          <meshStandardMaterial color={WA_PLATE} metalness={0.20} roughness={0.55} />
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
  const W = 256, H = 192
  const c = document.createElement('canvas'); c.width = W; c.height = H
  const ctx = c.getContext('2d')!

  // White paper
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, W, H)

  // Very subtle warm tint (just a whisper)
  ctx.fillStyle = 'rgba(255,248,238,0.45)'; ctx.fillRect(0, 0, W, H)

  // Ruled lines (light blue, notebook style)
  ctx.strokeStyle = 'rgba(160,200,230,0.40)'; ctx.lineWidth = 1
  for (let y = 42; y < H - 10; y += 18) {
    ctx.beginPath(); ctx.moveTo(10, y); ctx.lineTo(W - 10, y); ctx.stroke()
  }

  // Red margin line
  ctx.strokeStyle = 'rgba(220,80,60,0.35)'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(36, 10); ctx.lineTo(36, H - 10); ctx.stroke()

  // Tape strip at top (semi-transparent warm)
  ctx.fillStyle = 'rgba(220,200,150,0.35)'
  ctx.fillRect(W/2 - 22, 0, 44, 9)

  // Pin dot
  ctx.fillStyle = 'rgba(160,60,40,0.70)'
  ctx.beginPath(); ctx.arc(W/2, 5, 4.5, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = 'rgba(220,100,80,0.50)'
  ctx.beginPath(); ctx.arc(W/2 - 1, 4, 2, 0, Math.PI*2); ctx.fill()

  // Date (top right, small and clear)
  const date = new Date(entry.timestamp)
  ctx.fillStyle = '#888888'
  ctx.font = 'bold 11px "Mona12", sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText(
    `${date.getMonth() + 1}.${String(date.getDate()).padStart(2, '0')}`,
    W - 10, 18
  )

  // Message text — dark, clear
  ctx.fillStyle = '#1A1A1A'
  const fs = entry.text.length > 40 ? 13 : entry.text.length > 20 ? 15 : 17
  ctx.font = `${fs}px "Mona12", sans-serif`
  ctx.textAlign = 'left'
  const maxLineW = W - 52
  const words = entry.text.split(' ')
  const lines: string[] = []; let cur = ''
  for (const w of words) {
    const t = cur ? `${cur} ${w}` : w
    if (ctx.measureText(t).width > maxLineW && cur) { lines.push(cur); cur = w } else cur = t
  }
  if (cur) lines.push(cur)
  const lineH = fs * 1.55
  const startY = 38
  lines.slice(0, 6).forEach((ln, i) => ctx.fillText(ln, 42, startY + i * lineH))

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
  const tilt    = (TILTS[slotIndex % TILTS.length] ?? 0) * Math.PI / 180
  const tex     = useMemo(() => getNoteTexture(entry), [entry])
  const [hovered, setHovered] = useState(false)

  return (
    <group
      position={[lx, ly, 0.05]}
      rotation={[0, 0, tilt]}
      onClick={e => { e.stopPropagation(); onSelect(entry) }}
      onPointerOver={e => { e.stopPropagation(); if (document.pointerLockElement) setHovered(true) }}
      onPointerOut={() => setHovered(false)}
    >
      {/* Paper — emissive glow on hover */}
      <mesh>
        <planeGeometry args={[NOTE_W, NOTE_H]} />
        <meshStandardMaterial
          map={tex}
          roughness={0.84}
          emissive={new THREE.Color('#FFFDE0')}
          emissiveIntensity={hovered ? 0.35 : 0}
        />
      </mesh>
      {/* Hover point light */}
      {hovered && (
        <pointLight position={[0, 0, 0.12]} color="#FFFAC0" intensity={1.8} distance={0.35} />
      )}
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
  onClickBoard?: () => void
}

export default function GuestbookWall({ entries, onSelectEntry, onClickBoard }: GuestbookWallProps) {
  const visible = entries.slice(0, SLOT_MAX)
  const firedRef = useRef(false)

  const triggerBoard = (e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    if (firedRef.current) return
    firedRef.current = true
    setTimeout(() => { firedRef.current = false }, 400)
    onClickBoard?.()
  }

  // Whole easel is clickable — notes use stopPropagation so they still
  // open the share modal independently without triggering this.
  return (
    <group
      position={[PX, 0, PZ]}
      rotation={[0, ROT_Y, 0]}
      onClick={triggerBoard}
      onPointerDown={(e) => { if (!touchState.dragging) triggerBoard(e) }}
    >
      <EaselStand onBoardClick={onClickBoard} />
      {visible.map((entry, i) => (
        <Note key={entry.id} entry={entry} slotIndex={i} onSelect={onSelectEntry} />
      ))}
    </group>
  )
}
