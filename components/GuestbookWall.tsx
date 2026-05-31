'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import type { GuestbookEntry } from '@/lib/guestbook'

// ── Layout constants ──────────────────────────────────────────────────────────
// Notes appear on the facade wall (z ≈ 5.5) to the right of the entrance,
// roughly above the bench which is at [3.0, 0, 6.4].

const WALL_Z   = 5.55       // just in front of facade
const NOTE_W   = 0.30       // width in world units
const NOTE_H   = 0.22       // height in world units
const COL_X    = [3.20, 3.60, 3.90]  // x columns
const ROW_Y    = [2.35, 1.95, 1.55]  // y rows
const SLOT_MAX = COL_X.length * ROW_Y.length  // 9 slots

// Slight random-looking tilt per slot (deterministic by index)
const TILTS    = [-1.5, 1.2, -0.8, 1.8, -1.2, 0.6, -1.8, 1.0, -0.5]

// ── Note texture ──────────────────────────────────────────────────────────────

function makeNoteTexture(entry: GuestbookEntry): THREE.CanvasTexture {
  const W = 256, H = 192
  const c = document.createElement('canvas'); c.width = W; c.height = H
  const ctx = c.getContext('2d')!

  // Cream paper background with slight grain
  ctx.fillStyle = '#FBF5E8'; ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = 'rgba(180,150,100,0.06)'
  for (let i = 0; i < 60; i++) {
    ctx.fillRect((i * 73) % W, (i * 37) % H, 3, 1)
  }

  // Ruled lines (notebook style)
  ctx.strokeStyle = 'rgba(160,130,80,0.20)'; ctx.lineWidth = 1
  for (let y = 40; y < H - 18; y += 18) {
    ctx.beginPath(); ctx.moveTo(16, y); ctx.lineTo(W - 16, y); ctx.stroke()
  }

  // Red margin line
  ctx.strokeStyle = 'rgba(200,80,60,0.28)'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(38, 20); ctx.lineTo(38, H - 18); ctx.stroke()

  // Top tape strip (semi-transparent)
  ctx.fillStyle = 'rgba(200,180,120,0.35)'
  ctx.fillRect(W / 2 - 22, 0, 44, 10)
  ctx.fillStyle = 'rgba(220,200,150,0.20)'
  ctx.fillRect(W / 2 - 18, 1, 36, 8)

  // Date (small, top right)
  ctx.fillStyle = '#A07848'; ctx.font = '11px monospace'; ctx.textAlign = 'right'
  const date = new Date(entry.timestamp)
  ctx.fillText(
    `${date.getMonth() + 1}/${date.getDate()}`,
    W - 14, 16
  )

  // Message text — wrapped within ruled area
  ctx.fillStyle = '#2A1808'
  const fontSize = entry.text.length > 40 ? 13 : 15
  ctx.font = `${fontSize}px serif`
  ctx.textAlign = 'left'

  const maxW = W - 56   // account for margin
  const words = entry.text.split(' ')
  const lines: string[] = []
  let cur = ''
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w
    if (ctx.measureText(test).width > maxW && cur) {
      lines.push(cur); cur = w
    } else cur = test
  }
  if (cur) lines.push(cur)

  lines.slice(0, 6).forEach((ln, i) => {
    ctx.fillText(ln, 44, 36 + i * 18)
  })

  return new THREE.CanvasTexture(c)
}

// ── Single note mesh ──────────────────────────────────────────────────────────

interface NoteProps {
  entry: GuestbookEntry
  slotIndex: number
  onSelect: (entry: GuestbookEntry) => void
}

function Note({ entry, slotIndex, onSelect }: NoteProps) {
  const col  = slotIndex % COL_X.length
  const row  = Math.floor(slotIndex / COL_X.length)
  const x    = COL_X[col] ?? 3.2
  const y    = ROW_Y[row] ?? 1.95
  const tilt = (TILTS[slotIndex % TILTS.length] ?? 0) * Math.PI / 180

  const tex = useMemo(() => makeNoteTexture(entry), [entry])

  return (
    <group
      position={[x, y, WALL_Z]}
      rotation={[0, 0, tilt]}
      onClick={e => { e.stopPropagation(); onSelect(entry) }}
    >
      {/* Paper */}
      <mesh>
        <planeGeometry args={[NOTE_W, NOTE_H]} />
        <meshStandardMaterial map={tex} roughness={0.80} />
      </mesh>
      {/* Slight shadow cast (thin dark rect behind) */}
      <mesh position={[0.005, -0.005, -0.001]}>
        <planeGeometry args={[NOTE_W + 0.01, NOTE_H + 0.01]} />
        <meshStandardMaterial color="#2A1808" transparent opacity={0.12} depthWrite={false} />
      </mesh>
    </group>
  )
}

// ── Bench "앉기" prompt (3D billboard) — positioned above bench ───────────────
// Rendered when bench is clicked; clicking it opens guestbook modal.

interface SitPromptProps {
  visible: boolean
  onSit: () => void
}

export function BenchSitPrompt({ visible, onSit }: SitPromptProps) {
  if (!visible) return null
  return (
    // HTML billboard handled in GameClient; this is just a marker
    // (the actual prompt is a CSS overlay, see GameClient)
    null
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
      {visible.map((entry, i) => (
        <Note key={entry.id} entry={entry} slotIndex={i} onSelect={onSelectEntry} />
      ))}
    </group>
  )
}
