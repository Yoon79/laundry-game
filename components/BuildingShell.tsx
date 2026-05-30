import { useMemo } from 'react'
import * as THREE from 'three'

// ── Constants (must stay in sync with Exterior.tsx & LaundryRoom.tsx) ────
const FACADE_Z   = 5.5
const FACADE_W   = 8.5
const FW2        = FACADE_W / 2   // 4.25
const H          = 3.0
const WAINSCOT_H = 0.9
const CORNICE_H  = 0.65
const BLDG_FAR   = -12.5                            // back wall z (ClothesRoom ROOM_FAR)
const BLDG_D     = FACADE_Z - BLDG_FAR              // 18
const BLDG_CZ    = (FACADE_Z + BLDG_FAR) / 2        // -3.5
const ROOF_Y     = H + 0.02
const PARAPET_H  = 0.28
const PARAPET_T  = 0.18

const MINT       = '#A0C898'
const MINT_DARK  = '#789878'
const CREAM      = '#F0E8DC'
const CREAM2     = '#D8CEBC'

// ── Chimney stack ─────────────────────────────────────────────────────────

interface ChimneyProps { x: number; z: number }

function ChimneyStack({ x, z }: ChimneyProps) {
  return (
    <group position={[x, ROOF_Y, z]}>
      {/* Main brick body */}
      <mesh position={[0, 0.40, 0]}>
        <boxGeometry args={[0.30, 0.80, 0.30]} />
        <meshStandardMaterial color={CREAM2} roughness={0.75} />
      </mesh>
      {/* Cap shelf */}
      <mesh position={[0, 0.82, 0]}>
        <boxGeometry args={[0.40, 0.10, 0.40]} />
        <meshStandardMaterial color={CREAM} roughness={0.55} />
      </mesh>
      {/* Clay pot */}
      <mesh position={[0, 0.95, 0]}>
        <cylinderGeometry args={[0.08, 0.11, 0.18, 10]} />
        <meshStandardMaterial color="#706050" roughness={0.80} />
      </mesh>
      {/* Pot rim */}
      <mesh position={[0, 1.04, 0]}>
        <torusGeometry args={[0.09, 0.015, 6, 16]} />
        <meshStandardMaterial color="#605040" roughness={0.80} />
      </mesh>
    </group>
  )
}

// ── Roof surface + parapet ────────────────────────────────────────────────

function BuildingRoof() {
  const roofTex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 256; c.height = 256
    const ctx = c.getContext('2d')!
    // Dark green base
    ctx.fillStyle = '#3A5838'
    ctx.fillRect(0, 0, 256, 256)
    // Tile grid
    const step = 32
    ctx.strokeStyle = 'rgba(20,38,20,0.60)'
    ctx.lineWidth = 2.5
    for (let v = 0; v <= 256; v += step) {
      ctx.beginPath(); ctx.moveTo(v, 0); ctx.lineTo(v, 256); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(0, v); ctx.lineTo(256, v); ctx.stroke()
    }
    // Subtle highlight per tile
    ctx.fillStyle = 'rgba(255,255,255,0.04)'
    for (let x = 0; x < 256; x += step) {
      for (let y = 0; y < 256; y += step) {
        ctx.fillRect(x + 3, y + 3, step - 6, step - 6)
      }
    }
    const tex = new THREE.CanvasTexture(c)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(FACADE_W / 2, BLDG_D / 2)
    return tex
  }, [])

  const cMat = <meshStandardMaterial color={CREAM} roughness={0.50} />

  return (
    <group>
      {/* ── Flat roof surface ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, ROOF_Y, BLDG_CZ]}>
        <planeGeometry args={[FACADE_W, BLDG_D]} />
        <meshStandardMaterial map={roofTex} roughness={0.90} />
      </mesh>

      {/* ── Parapet walls ── */}
      {/* Front */}
      <mesh position={[0, ROOF_Y + PARAPET_H / 2, FACADE_Z + PARAPET_T / 2]}>
        <boxGeometry args={[FACADE_W + PARAPET_T * 2, PARAPET_H, PARAPET_T]} />
        {cMat}
      </mesh>
      {/* Back */}
      <mesh position={[0, ROOF_Y + PARAPET_H / 2, BLDG_FAR - PARAPET_T / 2]}>
        <boxGeometry args={[FACADE_W + PARAPET_T * 2, PARAPET_H, PARAPET_T]} />
        {cMat}
      </mesh>
      {/* Left */}
      <mesh position={[-FW2 - PARAPET_T / 2, ROOF_Y + PARAPET_H / 2, BLDG_CZ]}>
        <boxGeometry args={[PARAPET_T, PARAPET_H, BLDG_D + PARAPET_T * 2]} />
        {cMat}
      </mesh>
      {/* Right */}
      <mesh position={[FW2 + PARAPET_T / 2, ROOF_Y + PARAPET_H / 2, BLDG_CZ]}>
        <boxGeometry args={[PARAPET_T, PARAPET_H, BLDG_D + PARAPET_T * 2]} />
        {cMat}
      </mesh>

      {/* ── Corner parapet blocks ── */}
      {([-FW2, FW2] as number[]).flatMap((x, i) =>
        ([FACADE_Z, BLDG_FAR] as number[]).map((z, j) => (
          <mesh key={`c-${i}-${j}`} position={[x, ROOF_Y + PARAPET_H / 2, z]}>
            <boxGeometry args={[PARAPET_T * 2 + 0.04, PARAPET_H + 0.06, PARAPET_T * 2 + 0.04]} />
            {cMat}
          </mesh>
        ))
      )}

      {/* ── Chimney stacks ── */}
      <ChimneyStack x={-2.0} z={-2.0} />
      <ChimneyStack x={ 2.0} z={-2.0} />
      <ChimneyStack x={ 0.0} z={-8.5} />
    </group>
  )
}

// ── Exterior building side walls + back wall ──────────────────────────────

function BuildingWalls() {
  return (
    <group>
      {/* ── Left exterior wall (x = -FW2) ── */}
      <mesh
        position={[-FW2, WAINSCOT_H + (H - WAINSCOT_H) / 2, BLDG_CZ]}
        rotation={[0, -Math.PI / 2, 0]}
      >
        <planeGeometry args={[BLDG_D, H - WAINSCOT_H]} />
        <meshStandardMaterial color={MINT} side={THREE.DoubleSide} />
      </mesh>
      <mesh
        position={[-FW2, WAINSCOT_H / 2, BLDG_CZ]}
        rotation={[0, -Math.PI / 2, 0]}
      >
        <planeGeometry args={[BLDG_D, WAINSCOT_H]} />
        <meshStandardMaterial color={MINT_DARK} side={THREE.DoubleSide} />
      </mesh>

      {/* ── Right exterior wall (x = +FW2) ── */}
      <mesh
        position={[FW2, WAINSCOT_H + (H - WAINSCOT_H) / 2, BLDG_CZ]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <planeGeometry args={[BLDG_D, H - WAINSCOT_H]} />
        <meshStandardMaterial color={MINT} side={THREE.DoubleSide} />
      </mesh>
      <mesh
        position={[FW2, WAINSCOT_H / 2, BLDG_CZ]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <planeGeometry args={[BLDG_D, WAINSCOT_H]} />
        <meshStandardMaterial color={MINT_DARK} side={THREE.DoubleSide} />
      </mesh>

      {/* ── Back exterior wall (z = BLDG_FAR) ── */}
      <mesh position={[0, WAINSCOT_H + (H - WAINSCOT_H) / 2, BLDG_FAR]}>
        <planeGeometry args={[FACADE_W, H - WAINSCOT_H]} />
        <meshStandardMaterial color={MINT} />
      </mesh>
      <mesh position={[0, WAINSCOT_H / 2, BLDG_FAR + 0.002]}>
        <planeGeometry args={[FACADE_W, WAINSCOT_H]} />
        <meshStandardMaterial color={MINT_DARK} />
      </mesh>

      {/* ── Cornice strips on side & back walls ── */}
      {/* Left side cornice */}
      <mesh
        position={[-FW2 - 0.06, H + CORNICE_H / 2, BLDG_CZ]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <boxGeometry args={[BLDG_D, CORNICE_H, 0.16]} />
        <meshStandardMaterial color={CREAM} roughness={0.45} />
      </mesh>
      {/* Right side cornice */}
      <mesh
        position={[FW2 + 0.06, H + CORNICE_H / 2, BLDG_CZ]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <boxGeometry args={[BLDG_D, CORNICE_H, 0.16]} />
        <meshStandardMaterial color={CREAM} roughness={0.45} />
      </mesh>
      {/* Back wall cornice */}
      <mesh position={[0, H + CORNICE_H / 2, BLDG_FAR - 0.06]}>
        <boxGeometry args={[FACADE_W + 0.18, CORNICE_H, 0.16]} />
        <meshStandardMaterial color={CREAM} roughness={0.45} />
      </mesh>

      {/* ── Wainscot cap strips on side/back ── */}
      {/* Left */}
      <mesh
        position={[-FW2 - 0.002, WAINSCOT_H + 0.02, BLDG_CZ]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <boxGeometry args={[BLDG_D, 0.04, 0.10]} />
        <meshStandardMaterial color="#FDFAF5" roughness={0.50} />
      </mesh>
      {/* Right */}
      <mesh
        position={[FW2 + 0.002, WAINSCOT_H + 0.02, BLDG_CZ]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <boxGeometry args={[BLDG_D, 0.04, 0.10]} />
        <meshStandardMaterial color="#FDFAF5" roughness={0.50} />
      </mesh>
      {/* Back */}
      <mesh position={[0, WAINSCOT_H + 0.02, BLDG_FAR + 0.003]}>
        <boxGeometry args={[FACADE_W, 0.04, 0.10]} />
        <meshStandardMaterial color="#FDFAF5" roughness={0.50} />
      </mesh>
    </group>
  )
}

// ── Entrance door frame (wall thickness detail) ───────────────────────────

function EntranceDoorFrame() {
  const WALL_T  = 0.28
  const DOOR_W  = 2.0
  const DOOR_H  = 2.2
  const fz      = FACADE_Z - WALL_T / 2
  const mat     = <meshStandardMaterial color={CREAM} roughness={0.50} />
  return (
    <group>
      {/* Lintel (top of opening) */}
      <mesh position={[0, DOOR_H + 0.1, fz]}>
        <boxGeometry args={[DOOR_W + 0.04, 0.22, WALL_T]} />
        {mat}
      </mesh>
      {/* Left jamb */}
      <mesh position={[-(DOOR_W / 2 + 0.13), DOOR_H / 2, fz]}>
        <boxGeometry args={[0.26, DOOR_H + 0.04, WALL_T]} />
        {mat}
      </mesh>
      {/* Right jamb */}
      <mesh position={[DOOR_W / 2 + 0.13, DOOR_H / 2, fz]}>
        <boxGeometry args={[0.26, DOOR_H + 0.04, WALL_T]} />
        {mat}
      </mesh>
    </group>
  )
}

// ── Main export ───────────────────────────────────────────────────────────

export default function BuildingShell() {
  return (
    <group>
      <BuildingWalls />
      <BuildingRoof />
      <EntranceDoorFrame />
    </group>
  )
}
