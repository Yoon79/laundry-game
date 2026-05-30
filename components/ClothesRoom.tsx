import { useMemo } from 'react'
import * as THREE from 'three'

// Room geometry (half-sized)
const W = 4
const H = 3.0
const ROOM_NEAR = -5.5   // connects to laundry room at z = -5.5
const ROOM_FAR  = -12.5  // back wall
const DEPTH = Math.abs(ROOM_FAR - ROOM_NEAR)  // 7
const CZ = (ROOM_NEAR + ROOM_FAR) / 2         // -9 (center z for floor/ceiling planes)
const WAINSCOT_H = 0.9

// Doorway dimensions (must match LaundryRoom's DOOR_W / DOOR_H)
const DOOR_W = 2.0
const DOOR_H = 2.2

// Ceiling rails — run along X axis (left-right) at these Z positions
const RAIL_Z = [-7, -9, -11]
const RAIL_HALF = 1.7   // rail extends from x = -1.7 to 1.7

// Hanging positions per rail (5 items, evenly spaced within rail)
const CLOTHES_X = [-1.2, -0.6, 0.0, 0.6, 1.2]

const HANGER_MAT_COLOR = '#B8A890'

// Color families per rail — organised by hue (Wes Anderson palette)
const RAIL_COLORS: string[][] = [
  ['#C86878', '#D47888', '#C05870', '#D06880', '#C87080'],  // rose row
  ['#6878C8', '#7888D0', '#6070C0', '#80A0D8', '#6890C8'],  // blue row
  ['#60A070', '#78B888', '#90C880', '#68A870', '#80B870'],   // green row
]

// ── Sub-components ──────────────────────────────────────────────

function CeilingRail({ z }: { z: number }) {
  return (
    // Cylinder defaults to Y-axis; rotate Z by π/2 → runs along X
    <mesh position={[0, H - 0.04, z]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.009, 0.009, RAIL_HALF * 2, 8]} />
      <meshStandardMaterial color="#C0B0A0" metalness={0.88} roughness={0.12} />
    </mesh>
  )
}

// ── Clothing type system ─────────────────────────────────────────────────

type ClothingType = 'tshirt' | 'dress' | 'pants' | 'coat'

// Per-type plane config: [width, height, centerY from rail]
const CLOTHING_CONFIG: Record<ClothingType, [number, number, number]> = {
  tshirt: [0.24, 0.29, -0.285],
  dress:  [0.25, 0.44, -0.36],
  pants:  [0.23, 0.40, -0.34],
  coat:   [0.28, 0.47, -0.385],
}

// Clothing type pattern per row: 3 rows × 5 items
const ITEM_TYPES: ClothingType[][] = [
  ['coat',   'tshirt', 'dress',  'pants', 'tshirt'],
  ['tshirt', 'dress',  'coat',   'tshirt', 'pants'],
  ['dress',  'pants',  'tshirt', 'coat',  'dress'],
]

function makeClothingCanvas(type: ClothingType, color: string): THREE.CanvasTexture {
  const W = 256, H = 384
  const c = document.createElement('canvas')
  c.width = W; c.height = H
  const ctx = c.getContext('2d')!
  ctx.clearRect(0, 0, W, H)

  if (type === 'tshirt') {
    // ── T-shirt ──
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(W*0.36, 4)
    ctx.lineTo(W*0.08, 4)
    ctx.lineTo(W*0.0,  H*0.09)
    ctx.lineTo(W*0.0,  H*0.24)
    ctx.lineTo(W*0.21, H*0.20)
    ctx.lineTo(W*0.20, H*0.96)
    ctx.lineTo(W*0.80, H*0.96)
    ctx.lineTo(W*0.79, H*0.20)
    ctx.lineTo(W*1.0,  H*0.24)
    ctx.lineTo(W*1.0,  H*0.09)
    ctx.lineTo(W*0.92, 4)
    ctx.lineTo(W*0.64, 4)
    ctx.quadraticCurveTo(W*0.5, H*0.17, W*0.36, 4)
    ctx.closePath()
    ctx.fill()
    // Collar stitch
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.moveTo(W*0.36, 4)
    ctx.quadraticCurveTo(W*0.5, H*0.17, W*0.64, 4)
    ctx.stroke()
    // Center fold
    ctx.strokeStyle = 'rgba(0,0,0,0.07)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(W*0.5, H*0.22); ctx.lineTo(W*0.5, H*0.93); ctx.stroke()
    // Sleeve seam
    ctx.beginPath()
    ctx.moveTo(W*0.21, H*0.20); ctx.lineTo(W*0.0, H*0.09); ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(W*0.79, H*0.20); ctx.lineTo(W*1.0, H*0.09); ctx.stroke()

  } else if (type === 'dress') {
    // ── Dress/원피스 ──
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(W*0.38, 4)
    ctx.lineTo(W*0.12, 4)
    ctx.lineTo(W*0.06, H*0.04)
    ctx.lineTo(W*0.04, H*0.11)
    ctx.lineTo(W*0.19, H*0.09)
    ctx.lineTo(W*0.21, H*0.38)   // waist left
    ctx.lineTo(W*0.04, H*0.97)   // skirt hem left (flared)
    ctx.lineTo(W*0.96, H*0.97)   // skirt hem right
    ctx.lineTo(W*0.79, H*0.38)   // waist right
    ctx.lineTo(W*0.81, H*0.09)
    ctx.lineTo(W*0.96, H*0.11)
    ctx.lineTo(W*0.94, H*0.04)
    ctx.lineTo(W*0.88, 4)
    ctx.lineTo(W*0.62, 4)
    ctx.quadraticCurveTo(W*0.5, H*0.15, W*0.38, 4)
    ctx.closePath()
    ctx.fill()
    // Waist belt
    ctx.fillStyle = 'rgba(0,0,0,0.14)'
    ctx.fillRect(W*0.21, H*0.355, W*0.58, H*0.04)
    // Skirt shading (both sides)
    ctx.fillStyle = 'rgba(0,0,0,0.07)'
    ctx.beginPath()
    ctx.moveTo(W*0.21, H*0.40); ctx.lineTo(W*0.04, H*0.97); ctx.lineTo(W*0.28, H*0.97); ctx.closePath(); ctx.fill()
    ctx.beginPath()
    ctx.moveTo(W*0.79, H*0.40); ctx.lineTo(W*0.96, H*0.97); ctx.lineTo(W*0.72, H*0.97); ctx.closePath(); ctx.fill()
    // Neckline stitch
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(W*0.38, 4)
    ctx.quadraticCurveTo(W*0.5, H*0.15, W*0.62, 4)
    ctx.stroke()
    // Skirt center fold
    ctx.strokeStyle = 'rgba(0,0,0,0.06)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(W*0.5, H*0.40); ctx.lineTo(W*0.5, H*0.95); ctx.stroke()

  } else if (type === 'pants') {
    // ── Pants/바지 ──
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(W*0.06, 4)
    ctx.lineTo(W*0.94, 4)
    ctx.lineTo(W*0.92, H*0.40)
    ctx.lineTo(W*0.94, H*0.97)
    ctx.lineTo(W*0.55, H*0.97)
    ctx.lineTo(W*0.52, H*0.42)
    ctx.quadraticCurveTo(W*0.5, H*0.49, W*0.48, H*0.42)
    ctx.lineTo(W*0.45, H*0.97)
    ctx.lineTo(W*0.06, H*0.97)
    ctx.lineTo(W*0.08, H*0.40)
    ctx.closePath()
    ctx.fill()
    // Waistband
    ctx.fillStyle = 'rgba(0,0,0,0.13)'
    ctx.fillRect(W*0.06, 4, W*0.88, H*0.09)
    // Waistband highlight
    ctx.fillStyle = 'rgba(255,255,255,0.12)'
    ctx.fillRect(W*0.06, 4, W*0.88, H*0.03)
    // Belt loops
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = 'rgba(0,0,0,0.18)'
      ctx.fillRect(W*(0.20 + i*0.20), 4, W*0.045, H*0.08)
    }
    // Leg seam
    ctx.strokeStyle = 'rgba(0,0,0,0.10)'
    ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(W*0.5, H*0.10); ctx.lineTo(W*0.5, H*0.44); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(W*0.50, H*0.44); ctx.lineTo(W*0.46, H*0.95); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(W*0.50, H*0.44); ctx.lineTo(W*0.54, H*0.95); ctx.stroke()
    // Outer leg crease
    ctx.beginPath(); ctx.moveTo(W*0.30, H*0.10); ctx.lineTo(W*0.28, H*0.95); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(W*0.70, H*0.10); ctx.lineTo(W*0.72, H*0.95); ctx.stroke()

  } else {
    // ── Coat/코트 ──
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(W*0.36, 4)
    ctx.lineTo(W*0.06, 4)
    ctx.lineTo(W*0.0,  H*0.08)
    ctx.lineTo(W*0.0,  H*0.30)   // long sleeve
    ctx.lineTo(W*0.17, H*0.27)
    ctx.lineTo(W*0.16, H*0.97)
    ctx.lineTo(W*0.84, H*0.97)
    ctx.lineTo(W*0.83, H*0.27)
    ctx.lineTo(W*1.0,  H*0.30)
    ctx.lineTo(W*1.0,  H*0.08)
    ctx.lineTo(W*0.94, 4)
    ctx.lineTo(W*0.64, 4)
    ctx.lineTo(W*0.70, H*0.22)   // right lapel point
    ctx.lineTo(W*0.56, H*0.29)   // center V
    ctx.lineTo(W*0.30, H*0.22)   // left lapel point
    ctx.closePath()
    ctx.fill()
    // Lapel highlights
    ctx.fillStyle = 'rgba(255,255,255,0.14)'
    ctx.beginPath()
    ctx.moveTo(W*0.36, 4); ctx.lineTo(W*0.30, H*0.22); ctx.lineTo(W*0.56, H*0.29); ctx.lineTo(W*0.56, 4); ctx.closePath(); ctx.fill()
    ctx.beginPath()
    ctx.moveTo(W*0.64, 4); ctx.lineTo(W*0.70, H*0.22); ctx.lineTo(W*0.56, H*0.29); ctx.lineTo(W*0.56, 4); ctx.closePath(); ctx.fill()
    // Buttons
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = 'rgba(255,255,255,0.60)'
      ctx.beginPath(); ctx.arc(W*0.5, H*(0.32 + i*0.13), 5, 0, Math.PI*2); ctx.fill()
      ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 1; ctx.stroke()
    }
    // Pockets
    ctx.strokeStyle = 'rgba(0,0,0,0.14)'; ctx.lineWidth = 2
    ctx.strokeRect(W*0.22, H*0.74, W*0.20, H*0.08)
    ctx.strokeRect(W*0.58, H*0.74, W*0.20, H*0.08)
    // Sleeve seam
    ctx.strokeStyle = 'rgba(0,0,0,0.08)'; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(W*0.17, H*0.27); ctx.lineTo(W*0.0, H*0.08); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(W*0.83, H*0.27); ctx.lineTo(W*1.0, H*0.08); ctx.stroke()
    // Center front seam
    ctx.beginPath(); ctx.moveTo(W*0.5, H*0.30); ctx.lineTo(W*0.5, H*0.95); ctx.stroke()
  }

  // Subtle fabric sheen highlight (left side)
  ctx.fillStyle = 'rgba(255,255,255,0.04)'
  ctx.fillRect(W*0.10, H*0.05, W*0.18, H*0.88)

  const tex = new THREE.CanvasTexture(c)
  return tex
}

// ─────────────────────────────────────────────────────────────────────────

interface HangingItemProps {
  position: [number, number, number]
  color: string
  type: ClothingType
}

function HangingItem({ position, color, type }: HangingItemProps) {
  const clothingTex = useMemo(() => makeClothingCanvas(type, color), [type, color])
  const [pw, ph, cy] = CLOTHING_CONFIG[type]

  return (
    <group position={position}>
      {/* Vertical hook stem */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.1, 6]} />
        <meshStandardMaterial color={HANGER_MAT_COLOR} metalness={0.75} roughness={0.25} />
      </mesh>
      {/* Horizontal shoulder bar */}
      <mesh position={[0, -0.115, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.0035, 0.0035, 0.23, 6]} />
        <meshStandardMaterial color={HANGER_MAT_COLOR} metalness={0.75} roughness={0.25} />
      </mesh>
      {/* Left diagonal */}
      <mesh position={[-0.065, -0.132, 0]} rotation={[0, 0, Math.PI / 6]}>
        <cylinderGeometry args={[0.003, 0.003, 0.05, 6]} />
        <meshStandardMaterial color={HANGER_MAT_COLOR} metalness={0.75} roughness={0.25} />
      </mesh>
      {/* Right diagonal */}
      <mesh position={[0.065, -0.132, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <cylinderGeometry args={[0.003, 0.003, 0.05, 6]} />
        <meshStandardMaterial color={HANGER_MAT_COLOR} metalness={0.75} roughness={0.25} />
      </mesh>
      {/* Garment (canvas silhouette texture, transparent background) */}
      <mesh position={[0, cy, 0]}>
        <planeGeometry args={[pw, ph]} />
        <meshStandardMaterial
          map={clothingTex}
          side={THREE.DoubleSide}
          transparent
          alphaTest={0.08}
          roughness={0.85}
        />
      </mesh>
    </group>
  )
}

function CheckerFloor() {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#FAF0E6'
    ctx.fillRect(0, 0, 256, 256)
    ctx.fillStyle = '#E8B4B8'
    ctx.fillRect(128, 0, 128, 128)
    ctx.fillRect(0, 128, 128, 128)
    ctx.strokeStyle = 'rgba(180,150,140,0.35)'
    ctx.lineWidth = 3
    for (let i = 0; i <= 2; i++) {
      ctx.beginPath(); ctx.moveTo(i * 128, 0); ctx.lineTo(i * 128, 256); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(0, i * 128); ctx.lineTo(256, i * 128); ctx.stroke()
    }
    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(W / 2, DEPTH / 2)  // keeps 1-unit tiles consistent with laundry room
    return tex
  }, [])

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, CZ]} receiveShadow>
      <planeGeometry args={[W, DEPTH]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  )
}

function CeilingMesh() {
  const texture = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 512; c.height = 512
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#F8F2E8'
    ctx.fillRect(0, 0, 512, 512)
    const step = 128
    ctx.strokeStyle = 'rgba(160,138,115,0.22)'
    ctx.lineWidth = 3
    for (let v = 0; v <= 512; v += step) {
      ctx.beginPath(); ctx.moveTo(v, 0); ctx.lineTo(v, 512); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(0, v); ctx.lineTo(512, v); ctx.stroke()
    }
    ctx.strokeStyle = 'rgba(190,165,140,0.13)'
    ctx.lineWidth = 10
    for (let x = 0; x < 512; x += step) {
      for (let y = 0; y < 512; y += step) {
        ctx.strokeRect(x + 12, y + 12, step - 24, step - 24)
      }
    }
    const tex = new THREE.CanvasTexture(c)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(W / 1.5, DEPTH / 1.5)
    return tex
  }, [])

  return (
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H, CZ]}>
      <planeGeometry args={[W, DEPTH]} />
      <meshStandardMaterial map={texture} roughness={0.55} />
    </mesh>
  )
}

// ── Main component ───────────────────────────────────────────────

export default function ClothesRoom() {
  return (
    <group>
      {/* ── Lighting — warm point above each rail ── */}
      {RAIL_Z.map((z) => (
        <pointLight key={z} position={[0, H - 0.12, z]} intensity={1.8} distance={5} color="#FFE8C0" />
      ))}

      {/* ── Floor (continuous checkerboard from laundry room) ── */}
      <CheckerFloor />

      {/* ── Ceiling (tile grid texture) ── */}
      <CeilingMesh />

      {/* ── Left wall ── */}
      <mesh position={[-W / 2, WAINSCOT_H + (H - WAINSCOT_H) / 2, CZ]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[DEPTH, H - WAINSCOT_H]} />
        <meshStandardMaterial color="#B0C8A8" />
      </mesh>
      <mesh position={[-W / 2, WAINSCOT_H / 2, CZ]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[DEPTH, WAINSCOT_H]} />
        <meshStandardMaterial color="#88AA88" />
      </mesh>

      {/* ── Right wall ── */}
      <mesh position={[W / 2, WAINSCOT_H + (H - WAINSCOT_H) / 2, CZ]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[DEPTH, H - WAINSCOT_H]} />
        <meshStandardMaterial color="#B0C8A8" />
      </mesh>
      <mesh position={[W / 2, WAINSCOT_H / 2, CZ]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[DEPTH, WAINSCOT_H]} />
        <meshStandardMaterial color="#88AA88" />
      </mesh>

      {/* ── Back wall ── */}
      <mesh position={[0, H / 2, ROOM_FAR]}>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial color="#B0C8A8" />
      </mesh>
      <mesh position={[0, WAINSCOT_H / 2, ROOM_FAR + 0.001]}>
        <planeGeometry args={[W, WAINSCOT_H]} />
        <meshStandardMaterial color="#88AA88" />
      </mesh>

      {/* ── Front wall — visible from inside (mirrors laundry room door opening) ── */}
      {/* Top panel */}
      <mesh position={[0, DOOR_H + (H - DOOR_H) / 2, ROOM_NEAR]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[W, H - DOOR_H]} />
        <meshStandardMaterial color="#B0C8A8" />
      </mesh>
      {/* Left panel */}
      <mesh position={[-(W + DOOR_W) / 4, WAINSCOT_H + (DOOR_H - WAINSCOT_H) / 2, ROOM_NEAR]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[(W - DOOR_W) / 2, DOOR_H - WAINSCOT_H]} />
        <meshStandardMaterial color="#B0C8A8" />
      </mesh>
      {/* Right panel */}
      <mesh position={[(W + DOOR_W) / 4, WAINSCOT_H + (DOOR_H - WAINSCOT_H) / 2, ROOM_NEAR]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[(W - DOOR_W) / 2, DOOR_H - WAINSCOT_H]} />
        <meshStandardMaterial color="#B0C8A8" />
      </mesh>
      {/* Left wainscoting */}
      <mesh position={[-(W + DOOR_W) / 4, WAINSCOT_H / 2, ROOM_NEAR - 0.001]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[(W - DOOR_W) / 2, WAINSCOT_H]} />
        <meshStandardMaterial color="#88AA88" />
      </mesh>
      {/* Right wainscoting */}
      <mesh position={[(W + DOOR_W) / 4, WAINSCOT_H / 2, ROOM_NEAR - 0.001]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[(W - DOOR_W) / 2, WAINSCOT_H]} />
        <meshStandardMaterial color="#88AA88" />
      </mesh>

      {/* ── Crown molding ── */}
      {([-W / 2 + 0.025, W / 2 - 0.025] as number[]).map((x, i) => (
        <mesh key={i} position={[x, H - 0.025, CZ]}>
          <boxGeometry args={[0.05, 0.05, DEPTH]} />
          <meshStandardMaterial color="#FDFAF5" roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, H - 0.025, ROOM_FAR + 0.025]}>
        <boxGeometry args={[W, 0.05, 0.05]} />
        <meshStandardMaterial color="#FDFAF5" roughness={0.6} />
      </mesh>

      {/* ── Wainscot cap ── */}
      {([-W / 2 + 0.001, W / 2 - 0.001] as number[]).map((x, i) => (
        <mesh key={i} position={[x, WAINSCOT_H + 0.017, CZ]}>
          <boxGeometry args={[0.035, 0.035, DEPTH]} />
          <meshStandardMaterial color="#FDFAF5" roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, WAINSCOT_H + 0.017, ROOM_FAR + 0.001]}>
        <boxGeometry args={[W, 0.035, 0.035]} />
        <meshStandardMaterial color="#FDFAF5" roughness={0.5} />
      </mesh>

      {/* ── Ceiling rails ── */}
      {RAIL_Z.map((z) => (
        <CeilingRail key={z} z={z} />
      ))}

      {/* ── Hanging clothes — 3 rows × 5 items, clothing-type per item ── */}
      {RAIL_Z.map((z, railIdx) => (
        <group key={railIdx}>
          {CLOTHES_X.map((x, itemIdx) => (
            <HangingItem
              key={itemIdx}
              position={[x, H - 0.04, z]}
              color={RAIL_COLORS[railIdx][itemIdx]}
              type={ITEM_TYPES[railIdx][itemIdx]}
            />
          ))}
        </group>
      ))}
    </group>
  )
}
