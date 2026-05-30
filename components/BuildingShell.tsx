import { useMemo } from 'react'
import * as THREE from 'three'

// ── Constants (must stay in sync with Exterior.tsx & LaundryRoom.tsx) ────
const FACADE_Z   = 5.5
const FACADE_W   = 8.5
const FW2        = FACADE_W / 2   // 4.25
const H          = 3.0
const WAINSCOT_H = 0.9
const CORNICE_H  = 0.65
const BLDG_FAR   = -18.0
const BLDG_D     = FACADE_Z - BLDG_FAR   // 23.5
const BLDG_CZ    = (FACADE_Z + BLDG_FAR) / 2   // -6.25

// ── Hip roof geometry constants ───────────────────────────────────────────
// Eave sits just above the cornice top (H + CORNICE_H = 3.65)
const EAVE_Y    = H + CORNICE_H + 0.14   // 3.79
const EAVE_OH   = 0.38                   // overhang beyond wall edge
const RIDGE_H   = 1.85                   // rise from eave to ridge
const RIDGE_I   = 3.8                    // z-inset from eave ends to ridge starts

const EAVE_W    = FW2 + EAVE_OH          // 4.63
const FRONT_Z   = FACADE_Z  + EAVE_OH   // 5.88
const BACK_Z    = BLDG_FAR  - EAVE_OH   // -12.88
const RIDGE_Y   = EAVE_Y + RIDGE_H      // 5.64
const RIDGE_FZ  = FRONT_Z  - RIDGE_I    // 2.08
const RIDGE_BZ  = BACK_Z   + RIDGE_I    // -9.08
const RIDGE_MZ  = (RIDGE_FZ + RIDGE_BZ) / 2   // -3.50
const RIDGE_LEN = RIDGE_FZ - RIDGE_BZ   // 11.16

const MINT      = '#A0C898'
const MINT_DARK = '#789878'
const CREAM     = '#F0E8DC'
const CREAM2    = '#D8CEBC'

// ── Chimney stack ─────────────────────────────────────────────────────────

interface ChimneyProps { x: number; z: number; baseY?: number }

function ChimneyStack({ x, z, baseY = EAVE_Y }: ChimneyProps) {
  return (
    <group position={[x, baseY, z]}>
      <mesh position={[0, 0.42, 0]}>
        <boxGeometry args={[0.30, 0.84, 0.30]} />
        <meshStandardMaterial color={CREAM2} roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.86, 0]}>
        <boxGeometry args={[0.40, 0.10, 0.40]} />
        <meshStandardMaterial color={CREAM} roughness={0.55} />
      </mesh>
      <mesh position={[0, 1.00, 0]}>
        <cylinderGeometry args={[0.08, 0.11, 0.18, 10]} />
        <meshStandardMaterial color="#706050" roughness={0.80} />
      </mesh>
      <mesh position={[0, 1.09, 0]}>
        <torusGeometry args={[0.09, 0.015, 6, 16]} />
        <meshStandardMaterial color="#605040" roughness={0.80} />
      </mesh>
    </group>
  )
}

// ── Hip roof (custom BufferGeometry) ──────────────────────────────────────

function HipRoof() {
  // Canvas tile texture
  const tileTex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 256; c.height = 256
    const ctx = c.getContext('2d')!
    // Base dark green
    ctx.fillStyle = '#364E34'
    ctx.fillRect(0, 0, 256, 256)
    // Horizontal tile rows (like lap shingles)
    const rowH = 20
    for (let y = 0; y < 256; y += rowH) {
      const offset = ((y / rowH) % 2) * 32
      // Row shadow
      ctx.fillStyle = 'rgba(0,0,0,0.20)'
      ctx.fillRect(0, y, 256, 3)
      // Individual tiles in row
      for (let x = -32 + offset; x < 256; x += 64) {
        // Tile body
        ctx.fillStyle = `hsl(120,${22 + ((x * 3 + y * 7) & 7)}%,${23 + ((x * 5 + y * 3) & 5)}%)`
        ctx.fillRect(x + 2, y + 3, 60, rowH - 4)
        // Tile highlight (top edge)
        ctx.fillStyle = 'rgba(255,255,255,0.06)'
        ctx.fillRect(x + 2, y + 3, 60, 2)
        // Tile right edge shadow
        ctx.fillStyle = 'rgba(0,0,0,0.12)'
        ctx.fillRect(x + 60, y + 3, 2, rowH - 4)
      }
    }
    const tex = new THREE.CanvasTexture(c)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(4, 3)
    return tex
  }, [])

  // Build non-indexed BufferGeometry for the 6-face hip roof
  const geo = useMemo<THREE.BufferGeometry>(() => {
    type V3 = [number, number, number]
    type V2 = [number, number]

    const FL: V3 = [-EAVE_W, EAVE_Y, FRONT_Z]
    const FR: V3 = [ EAVE_W, EAVE_Y, FRONT_Z]
    const BL: V3 = [-EAVE_W, EAVE_Y, BACK_Z]
    const BR: V3 = [ EAVE_W, EAVE_Y, BACK_Z]
    const RF: V3 = [0, RIDGE_Y, RIDGE_FZ]
    const RB: V3 = [0, RIDGE_Y, RIDGE_BZ]

    const pos: number[] = []
    const uvs: number[] = []

    const tri = (
      p0: V3, u0: V2,
      p1: V3, u1: V2,
      p2: V3, u2: V2
    ) => {
      pos.push(...p0, ...p1, ...p2)
      uvs.push(...u0, ...u1, ...u2)
    }

    // ── Front hip (triangle facing +z) ──
    tri(FL, [0, 0], FR, [1, 0], RF, [0.5, 1])

    // ── Back hip (triangle facing -z) ──
    tri(BR, [0, 0], BL, [1, 0], RB, [0.5, 1])

    // ── Left slope ──  (eaveW wide, BLDG_D long, trapezoidal)
    tri(BL, [0, 0], FL, [1, 0], RF, [1, 1])
    tri(BL, [0, 0], RF, [1, 1], RB, [0, 1])

    // ── Right slope ──
    tri(FR, [0, 0], BR, [1, 0], RB, [1, 1])
    tri(FR, [0, 0], RB, [1, 1], RF, [0, 1])

    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3))
    g.setAttribute('uv',       new THREE.BufferAttribute(new Float32Array(uvs), 2))
    g.computeVertexNormals()
    return g
  }, [])

  // Side chimney base y — interpolate on slope at x=±2.0
  const sideChimneyY = EAVE_Y + RIDGE_H * (1 - 2.0 / EAVE_W) * 0.85

  return (
    <group>
      {/* ── Main hip roof surface ── */}
      <mesh geometry={geo}>
        <meshStandardMaterial
          map={tileTex}
          roughness={0.88}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── Eave fascia trim (cream band along all 4 eave edges) ── */}
      {/* Front eave */}
      <mesh position={[0, EAVE_Y - 0.06, FRONT_Z]}>
        <boxGeometry args={[EAVE_W * 2 + 0.1, 0.14, 0.12]} />
        <meshStandardMaterial color={CREAM} roughness={0.5} />
      </mesh>
      {/* Back eave */}
      <mesh position={[0, EAVE_Y - 0.06, BACK_Z]}>
        <boxGeometry args={[EAVE_W * 2 + 0.1, 0.14, 0.12]} />
        <meshStandardMaterial color={CREAM} roughness={0.5} />
      </mesh>
      {/* Left eave */}
      <mesh position={[-EAVE_W, EAVE_Y - 0.06, BLDG_CZ]}>
        <boxGeometry args={[0.12, 0.14, Math.abs(BACK_Z - FRONT_Z) + 0.1]} />
        <meshStandardMaterial color={CREAM} roughness={0.5} />
      </mesh>
      {/* Right eave */}
      <mesh position={[EAVE_W, EAVE_Y - 0.06, BLDG_CZ]}>
        <boxGeometry args={[0.12, 0.14, Math.abs(BACK_Z - FRONT_Z) + 0.1]} />
        <meshStandardMaterial color={CREAM} roughness={0.5} />
      </mesh>

      {/* ── Ridge cap (cream strip along the ridge) ── */}
      <mesh position={[0, RIDGE_Y + 0.06, RIDGE_MZ]}>
        <boxGeometry args={[0.20, 0.16, RIDGE_LEN + 0.15]} />
        <meshStandardMaterial color={CREAM} roughness={0.5} />
      </mesh>
      {/* Ridge end caps */}
      <mesh position={[0, RIDGE_Y + 0.04, RIDGE_FZ]}>
        <boxGeometry args={[0.22, 0.18, 0.22]} />
        <meshStandardMaterial color={CREAM2} roughness={0.5} />
      </mesh>
      <mesh position={[0, RIDGE_Y + 0.04, RIDGE_BZ]}>
        <boxGeometry args={[0.22, 0.18, 0.22]} />
        <meshStandardMaterial color={CREAM2} roughness={0.5} />
      </mesh>

      {/* ── Chimney stacks ── */}
      {/* Two flanking chimneys on the side slopes */}
      <ChimneyStack x={-1.6} z={-1.8} baseY={sideChimneyY} />
      <ChimneyStack x={ 1.6} z={-1.8} baseY={sideChimneyY} />
      {/* One tall chimney on the ridge */}
      <ChimneyStack x={0} z={RIDGE_MZ} baseY={RIDGE_Y - 0.1} />
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
      <mesh
        position={[-FW2 - 0.06, H + CORNICE_H / 2, BLDG_CZ]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <boxGeometry args={[BLDG_D, CORNICE_H, 0.16]} />
        <meshStandardMaterial color={CREAM} roughness={0.45} />
      </mesh>
      <mesh
        position={[FW2 + 0.06, H + CORNICE_H / 2, BLDG_CZ]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <boxGeometry args={[BLDG_D, CORNICE_H, 0.16]} />
        <meshStandardMaterial color={CREAM} roughness={0.45} />
      </mesh>
      <mesh position={[0, H + CORNICE_H / 2, BLDG_FAR - 0.06]}>
        <boxGeometry args={[FACADE_W + 0.18, CORNICE_H, 0.16]} />
        <meshStandardMaterial color={CREAM} roughness={0.45} />
      </mesh>

      {/* ── Wainscot cap strips ── */}
      <mesh
        position={[-FW2 - 0.002, WAINSCOT_H + 0.02, BLDG_CZ]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <boxGeometry args={[BLDG_D, 0.04, 0.10]} />
        <meshStandardMaterial color="#FDFAF5" roughness={0.50} />
      </mesh>
      <mesh
        position={[FW2 + 0.002, WAINSCOT_H + 0.02, BLDG_CZ]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <boxGeometry args={[BLDG_D, 0.04, 0.10]} />
        <meshStandardMaterial color="#FDFAF5" roughness={0.50} />
      </mesh>
      <mesh position={[0, WAINSCOT_H + 0.02, BLDG_FAR + 0.003]}>
        <boxGeometry args={[FACADE_W, 0.04, 0.10]} />
        <meshStandardMaterial color="#FDFAF5" roughness={0.50} />
      </mesh>
    </group>
  )
}

// ── Entrance door frame (wall thickness detail) ───────────────────────────

function EntranceDoorFrame() {
  const WALL_T = 0.28
  const DOOR_W = 2.0
  const DOOR_H = 2.2
  const fz     = FACADE_Z - WALL_T / 2
  const mat    = <meshStandardMaterial color={CREAM} roughness={0.50} />
  return (
    <group>
      <mesh position={[0, DOOR_H + 0.1, fz]}>
        <boxGeometry args={[DOOR_W + 0.04, 0.22, WALL_T]} />
        {mat}
      </mesh>
      <mesh position={[-(DOOR_W / 2 + 0.13), DOOR_H / 2, fz]}>
        <boxGeometry args={[0.26, DOOR_H + 0.04, WALL_T]} />
        {mat}
      </mesh>
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
      <HipRoof />
      <EntranceDoorFrame />
    </group>
  )
}
