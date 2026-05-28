import { useMemo } from 'react'
import * as THREE from 'three'

// Must match LaundryRoom constants exactly
const FACADE_Z  = 5.5   // z = +D/2 (front face of laundry room)
const W         = 4
const H         = 3.0
const DOOR_W    = 2.0
const DOOR_H    = 2.2
const WAINSCOT_H = 0.9
const EXT_DEPTH = 7     // exterior corridor: z = 5.5 → 12.5
const EXT_CZ    = FACADE_Z + EXT_DEPTH / 2  // 9.0

function ExteriorFloor() {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')!
    // Warm stone pavement — slightly cooler than interior
    ctx.fillStyle = '#EDE5DA'
    ctx.fillRect(0, 0, 256, 256)
    ctx.fillStyle = '#DDD4C6'
    ctx.fillRect(128, 0, 128, 128)
    ctx.fillRect(0, 128, 128, 128)
    ctx.strokeStyle = 'rgba(150,130,110,0.45)'
    ctx.lineWidth = 4
    for (let i = 0; i <= 2; i++) {
      ctx.beginPath(); ctx.moveTo(i * 128, 0); ctx.lineTo(i * 128, 256); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(0, i * 128); ctx.lineTo(256, i * 128); ctx.stroke()
    }
    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(W / 2, EXT_DEPTH / 2)
    return tex
  }, [])

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, EXT_CZ]} receiveShadow>
      <planeGeometry args={[W, EXT_DEPTH]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  )
}

function SignBoard() {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 128
    const ctx = canvas.getContext('2d')!
    // Background
    ctx.fillStyle = '#FBF3EC'
    ctx.fillRect(0, 0, 512, 128)
    // Outer border
    ctx.strokeStyle = '#C8A08A'
    ctx.lineWidth = 7
    ctx.strokeRect(6, 6, 500, 116)
    // Inner decorative line
    ctx.strokeStyle = '#D8B090'
    ctx.lineWidth = 2
    ctx.strokeRect(14, 14, 484, 100)
    // Main Korean text
    ctx.fillStyle = '#3D2B1E'
    ctx.font = 'bold 44px serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('스웨덴세탁소', 256, 52)
    // Sub-text
    ctx.font = '500 15px serif'
    ctx.fillStyle = '#A07860'
    ctx.textBaseline = 'middle'
    ctx.fillText('S W E D E N   L A U N D R Y', 256, 96)
    return new THREE.CanvasTexture(canvas)
  }, [])

  return (
    <mesh position={[0, H + 0.17, FACADE_Z + 0.08]}>
      <boxGeometry args={[DOOR_W + 0.55, 0.44, 0.08]} />
      <meshStandardMaterial map={texture} roughness={0.3} />
    </mesh>
  )
}

function Awning() {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 64
    const ctx = canvas.getContext('2d')!
    // Candy-stripe: cream + dusty rose, 8 stripes
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#FAF0E6' : '#E8B4B8'
      ctx.fillRect(i * 32, 0, 32, 64)
    }
    const tex = new THREE.CanvasTexture(canvas)
    return tex
  }, [])

  return (
    <group position={[0, DOOR_H + 0.12, FACADE_Z + 0.04]}>
      {/* Awning body — angled outward and downward */}
      <mesh position={[0, 0, 0.36]} rotation={[-Math.PI / 7, 0, 0]}>
        <boxGeometry args={[DOOR_W + 0.22, 0.012, 0.72]} />
        <meshStandardMaterial map={texture} side={THREE.DoubleSide} roughness={0.65} />
      </mesh>
      {/* Valance strip at the front edge */}
      <mesh position={[0, -0.09, 0.70]}>
        <boxGeometry args={[DOOR_W + 0.22, 0.18, 0.012]} />
        <meshStandardMaterial color="#E8B4B8" roughness={0.7} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function StepStone() {
  // A small step in front of the doorway
  return (
    <mesh position={[0, 0.025, FACADE_Z + 0.25]} receiveShadow>
      <boxGeometry args={[DOOR_W - 0.1, 0.05, 0.5]} />
      <meshStandardMaterial color="#D8CFC4" roughness={0.8} />
    </mesh>
  )
}

export default function Exterior() {
  return (
    <group>
      {/* ── Outdoor directional light (sunlight from upper right) ── */}
      <directionalLight
        position={[4, 10, 8]}
        intensity={1.8}
        color="#FFF8F0"
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
      />

      {/* ── Exterior floor (stone pavement) ── */}
      <ExteriorFloor />

      {/* ── Entrance decorations ── */}
      <SignBoard />
      <Awning />
      <StepStone />

      {/* ── Exterior building side walls ── */}
      {/* Left side (visible as you approach from outside) */}
      <mesh position={[-W / 2, WAINSCOT_H + (H - WAINSCOT_H) / 2, EXT_CZ]}
            rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[EXT_DEPTH, H - WAINSCOT_H]} />
        <meshStandardMaterial color="#F0D0D0" />
      </mesh>
      <mesh position={[-W / 2, WAINSCOT_H / 2, EXT_CZ]}
            rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[EXT_DEPTH, WAINSCOT_H]} />
        <meshStandardMaterial color="#D8B8B8" />
      </mesh>
      {/* Right side */}
      <mesh position={[W / 2, WAINSCOT_H + (H - WAINSCOT_H) / 2, EXT_CZ]}
            rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[EXT_DEPTH, H - WAINSCOT_H]} />
        <meshStandardMaterial color="#F0D0D0" />
      </mesh>
      <mesh position={[W / 2, WAINSCOT_H / 2, EXT_CZ]}
            rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[EXT_DEPTH, WAINSCOT_H]} />
        <meshStandardMaterial color="#D8B8B8" />
      </mesh>

      {/* ── Exterior ceiling strip (matches building height) ── */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H, EXT_CZ]}>
        <planeGeometry args={[W, EXT_DEPTH]} />
        <meshStandardMaterial color="#F5F0E8" />
      </mesh>

      {/* ── Wainscot cap on side walls ── */}
      {([-W / 2 + 0.001, W / 2 - 0.001] as number[]).map((x, i) => (
        <mesh key={i} position={[x, WAINSCOT_H + 0.017, EXT_CZ]}>
          <boxGeometry args={[0.035, 0.035, EXT_DEPTH]} />
          <meshStandardMaterial color="#FDFAF5" roughness={0.5} />
        </mesh>
      ))}

      {/* ── Crown molding on side walls ── */}
      {([-W / 2 + 0.025, W / 2 - 0.025] as number[]).map((x, i) => (
        <mesh key={i} position={[x, H - 0.025, EXT_CZ]}>
          <boxGeometry args={[0.05, 0.05, EXT_DEPTH]} />
          <meshStandardMaterial color="#FDFAF5" roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}
