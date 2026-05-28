import { useMemo } from 'react'
import * as THREE from 'three'

// Room geometry
const W = 8
const H = 3.8          // slightly higher than laundry room
const ROOM_NEAR = -11  // connects to laundry room at z = -11
const ROOM_FAR  = -25  // back wall
const DEPTH = Math.abs(ROOM_FAR - ROOM_NEAR)  // 14
const CZ = (ROOM_NEAR + ROOM_FAR) / 2         // -18 (center z for floor/ceiling planes)
const WAINSCOT_H = 1.1

// Doorway dimensions (must match LaundryRoom's DOOR_W / DOOR_H)
const DOOR_W = 4.0
const DOOR_H = 2.5

// Ceiling rails — run along X axis (left-right) at these Z positions
// Player walks through successive rows of hanging clothes
const RAIL_Z = [-13.5, -16.5, -19.5, -22.5]
const RAIL_HALF = 3.4   // rail extends from x = -3.4 to 3.4

// Hanging positions per rail (within player corridor ±2 + outer items)
const CLOTHES_X = [-3.0, -2.0, -1.0, 0.0, 1.0, 2.0, 3.0]

const HANGER_MAT_COLOR = '#B8A890'

// Color families per rail — organised by hue (Wes Anderson palette)
const RAIL_COLORS: string[][] = [
  ['#C86878', '#D47888', '#C05870', '#D06880', '#C87080', '#D07888', '#C86070'], // rose row
  ['#6878C8', '#7888D0', '#6070C0', '#80A0D8', '#6890C8', '#5868C0', '#7080C8'], // blue row
  ['#60A070', '#78B888', '#90C880', '#68A870', '#80B870', '#70B878', '#60A868'], // green row
  ['#C89050', '#D0A060', '#C08840', '#C89858', '#D0A870', '#C09848', '#D09858'], // amber row
]

// ── Sub-components ──────────────────────────────────────────────

function CeilingRail({ z }: { z: number }) {
  return (
    // Cylinder defaults to Y-axis; rotate Z by π/2 → runs along X
    <mesh position={[0, H - 0.04, z]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.018, 0.018, RAIL_HALF * 2, 8]} />
      <meshStandardMaterial color="#C0B0A0" metalness={0.88} roughness={0.12} />
    </mesh>
  )
}

interface HangingItemProps {
  position: [number, number, number]
  color: string
}

function HangingItem({ position, color }: HangingItemProps) {
  return (
    // Group origin sits at the rail; geometry hangs downward
    <group position={position}>
      {/* Vertical hook stem */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.2, 6]} />
        <meshStandardMaterial color={HANGER_MAT_COLOR} metalness={0.75} roughness={0.25} />
      </mesh>
      {/* Horizontal shoulder bar (along X) */}
      <mesh position={[0, -0.23, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.007, 0.007, 0.46, 6]} />
        <meshStandardMaterial color={HANGER_MAT_COLOR} metalness={0.75} roughness={0.25} />
      </mesh>
      {/* Left diagonal */}
      <mesh position={[-0.13, -0.265, 0]} rotation={[0, 0, Math.PI / 6]}>
        <cylinderGeometry args={[0.006, 0.006, 0.1, 6]} />
        <meshStandardMaterial color={HANGER_MAT_COLOR} metalness={0.75} roughness={0.25} />
      </mesh>
      {/* Right diagonal */}
      <mesh position={[0.13, -0.265, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <cylinderGeometry args={[0.006, 0.006, 0.1, 6]} />
        <meshStandardMaterial color={HANGER_MAT_COLOR} metalness={0.75} roughness={0.25} />
      </mesh>
      {/* Garment — faces ±Z so player sees front as they walk through */}
      <mesh position={[0, -0.72, 0]}>
        <planeGeometry args={[0.42, 0.78]} />
        <meshStandardMaterial color={color} roughness={0.88} side={THREE.DoubleSide} />
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

// ── Main component ───────────────────────────────────────────────

export default function ClothesRoom() {
  return (
    <group>
      {/* ── Lighting — warm point above each rail ── */}
      {RAIL_Z.map((z) => (
        <pointLight key={z} position={[0, H - 0.12, z]} intensity={2.0} distance={6} color="#FFE8C0" />
      ))}

      {/* ── Floor (continuous checkerboard from laundry room) ── */}
      <CheckerFloor />

      {/* ── Ceiling ── */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H, CZ]}>
        <planeGeometry args={[W, DEPTH]} />
        <meshStandardMaterial color="#FBF5EE" />
      </mesh>

      {/* ── Left wall ── */}
      <mesh position={[-W / 2, WAINSCOT_H + (H - WAINSCOT_H) / 2, CZ]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[DEPTH, H - WAINSCOT_H]} />
        <meshStandardMaterial color="#F5E8D8" />
      </mesh>
      <mesh position={[-W / 2, WAINSCOT_H / 2, CZ]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[DEPTH, WAINSCOT_H]} />
        <meshStandardMaterial color="#D8C4B0" />
      </mesh>

      {/* ── Right wall ── */}
      <mesh position={[W / 2, WAINSCOT_H + (H - WAINSCOT_H) / 2, CZ]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[DEPTH, H - WAINSCOT_H]} />
        <meshStandardMaterial color="#F5E8D8" />
      </mesh>
      <mesh position={[W / 2, WAINSCOT_H / 2, CZ]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[DEPTH, WAINSCOT_H]} />
        <meshStandardMaterial color="#D8C4B0" />
      </mesh>

      {/* ── Back wall ── */}
      <mesh position={[0, H / 2, ROOM_FAR]}>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial color="#F5E8D8" />
      </mesh>
      <mesh position={[0, WAINSCOT_H / 2, ROOM_FAR + 0.001]}>
        <planeGeometry args={[W, WAINSCOT_H]} />
        <meshStandardMaterial color="#D8C4B0" />
      </mesh>

      {/* ── Front wall — visible from inside (mirrors laundry room door opening) ── */}
      {/* Top panel */}
      <mesh position={[0, DOOR_H + (H - DOOR_H) / 2, ROOM_NEAR]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[W, H - DOOR_H]} />
        <meshStandardMaterial color="#F5E8D8" />
      </mesh>
      {/* Left panel */}
      <mesh position={[-(W + DOOR_W) / 4, WAINSCOT_H + (DOOR_H - WAINSCOT_H) / 2, ROOM_NEAR]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[(W - DOOR_W) / 2, DOOR_H - WAINSCOT_H]} />
        <meshStandardMaterial color="#F5E8D8" />
      </mesh>
      {/* Right panel */}
      <mesh position={[(W + DOOR_W) / 4, WAINSCOT_H + (DOOR_H - WAINSCOT_H) / 2, ROOM_NEAR]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[(W - DOOR_W) / 2, DOOR_H - WAINSCOT_H]} />
        <meshStandardMaterial color="#F5E8D8" />
      </mesh>
      {/* Left wainscoting */}
      <mesh position={[-(W + DOOR_W) / 4, WAINSCOT_H / 2, ROOM_NEAR - 0.001]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[(W - DOOR_W) / 2, WAINSCOT_H]} />
        <meshStandardMaterial color="#D8C4B0" />
      </mesh>
      {/* Right wainscoting */}
      <mesh position={[(W + DOOR_W) / 4, WAINSCOT_H / 2, ROOM_NEAR - 0.001]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[(W - DOOR_W) / 2, WAINSCOT_H]} />
        <meshStandardMaterial color="#D8C4B0" />
      </mesh>

      {/* ── Crown molding ── */}
      {([-W / 2 + 0.03, W / 2 - 0.03] as number[]).map((x, i) => (
        <mesh key={i} position={[x, H - 0.03, CZ]}>
          <boxGeometry args={[0.06, 0.06, DEPTH]} />
          <meshStandardMaterial color="#FDFAF5" roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, H - 0.03, ROOM_FAR + 0.03]}>
        <boxGeometry args={[W, 0.06, 0.06]} />
        <meshStandardMaterial color="#FDFAF5" roughness={0.6} />
      </mesh>

      {/* ── Wainscot cap ── */}
      {([-W / 2 + 0.001, W / 2 - 0.001] as number[]).map((x, i) => (
        <mesh key={i} position={[x, WAINSCOT_H + 0.02, CZ]}>
          <boxGeometry args={[0.04, 0.04, DEPTH]} />
          <meshStandardMaterial color="#FDFAF5" roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, WAINSCOT_H + 0.02, ROOM_FAR + 0.001]}>
        <boxGeometry args={[W, 0.04, 0.04]} />
        <meshStandardMaterial color="#FDFAF5" roughness={0.5} />
      </mesh>

      {/* ── Ceiling rails ── */}
      {RAIL_Z.map((z) => (
        <CeilingRail key={z} z={z} />
      ))}

      {/* ── Hanging clothes — 4 rows × 7 items, color-sorted per row ── */}
      {RAIL_Z.map((z, railIdx) => (
        <group key={railIdx}>
          {CLOTHES_X.map((x, itemIdx) => (
            <HangingItem
              key={itemIdx}
              position={[x, H - 0.04, z]}
              color={RAIL_COLORS[railIdx][itemIdx]}
            />
          ))}
        </group>
      ))}
    </group>
  )
}
