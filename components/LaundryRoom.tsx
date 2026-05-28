import { useMemo } from 'react'
import * as THREE from 'three'
import WashingMachine from './WashingMachine'

// Room dimensions (half-sized)
const W = 4    // width  (x: -2 to 2)
const H = 3.0  // height (y: 0 to 3.0)
const D = 11   // depth  (z: -5.5 to 5.5)

const WAINSCOT_H = 0.9  // lower wall panel height

// Doorway opening into the clothes room (centered in back wall)
const DOOR_W = 2.0
const DOOR_H = 2.2

// 5 machine pairs — symmetric on z axis
const MACHINE_Z = [-4, -2, 0, 2, 4]

// Left machine center x: wall at -2, machine depth 0.34 → center at -2 + 0.17 = -1.83
// Right machine center x: wall at +2, machine depth 0.34 → center at +2 - 0.17 = 1.83
const MACHINE_X = 1.83

function CheckerFloor() {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')!

    // 2×2 checkerboard per repeat tile
    ctx.fillStyle = '#FAF0E6'
    ctx.fillRect(0, 0, 256, 256)
    ctx.fillStyle = '#E8B4B8'
    ctx.fillRect(128, 0, 128, 128)
    ctx.fillRect(0, 128, 128, 128)

    // Subtle grout lines
    ctx.strokeStyle = 'rgba(180,150,140,0.35)'
    ctx.lineWidth = 3
    for (let i = 0; i <= 2; i++) {
      ctx.beginPath()
      ctx.moveTo(i * 128, 0)
      ctx.lineTo(i * 128, 256)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, i * 128)
      ctx.lineTo(256, i * 128)
      ctx.stroke()
    }

    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    // W=4, D=11 → want ~1 unit tiles → repeat = (W/2, D/2) since 2 tiles per repeat
    tex.repeat.set(W / 2, D / 2)
    return tex
  }, [])

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[W, D]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  )
}

function PendantLight({ z }: { z: number }) {
  return (
    <group position={[0, H, z]}>
      <pointLight
        intensity={2.2}
        distance={6}
        color="#FFE0A8"
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
      />
      {/* Ceiling cord */}
      <mesh position={[0, -0.25, 0]}>
        <cylinderGeometry args={[0.006, 0.006, 0.5, 6]} />
        <meshStandardMaterial color="#8A7060" />
      </mesh>
      {/* Shade — open-bottomed cone */}
      <mesh position={[0, -0.65, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.20, 0.30, 24, 1, true]} />
        <meshStandardMaterial color="#F2DFA0" side={THREE.DoubleSide} roughness={0.7} />
      </mesh>
      {/* Bulb glow */}
      <mesh position={[0, -0.63, 0]}>
        <sphereGeometry args={[0.040, 12, 8]} />
        <meshStandardMaterial
          color="#FFE8B0"
          emissive="#FFE8B0"
          emissiveIntensity={3}
          roughness={0.2}
        />
      </mesh>
    </group>
  )
}

// Crown molding strip where wall meets ceiling
function CrownMolding() {
  const mat = (
    <meshStandardMaterial color="#FDFAF5" roughness={0.6} />
  )
  const thick = 0.05
  return (
    <group position={[0, H - thick / 2, 0]}>
      {/* Left */}
      <mesh position={[-W / 2 + thick / 2, 0, 0]}>
        <boxGeometry args={[thick, thick, D]} />
        {mat}
      </mesh>
      {/* Right */}
      <mesh position={[W / 2 - thick / 2, 0, 0]}>
        <boxGeometry args={[thick, thick, D]} />
        {mat}
      </mesh>
      {/* Back */}
      <mesh position={[0, 0, -D / 2 + thick / 2]}>
        <boxGeometry args={[W, thick, thick]} />
        {mat}
      </mesh>
    </group>
  )
}

// Wainscoting cap strip
function WainscotCap() {
  const mat = <meshStandardMaterial color="#FDFAF5" roughness={0.5} />
  const thick = 0.035
  return (
    <group position={[0, WAINSCOT_H + thick / 2, 0]}>
      {/* Left wall */}
      <mesh position={[-W / 2 + 0.001, 0, 0]}>
        <boxGeometry args={[thick, thick, D]} />
        {mat}
      </mesh>
      {/* Right wall */}
      <mesh position={[W / 2 - 0.001, 0, 0]}>
        <boxGeometry args={[thick, thick, D]} />
        {mat}
      </mesh>
      {/* Back wall — split around doorway */}
      <mesh position={[-(W + DOOR_W) / 4, 0, -D / 2 + 0.001]}>
        <boxGeometry args={[(W - DOOR_W) / 2, thick, thick]} />
        {mat}
      </mesh>
      <mesh position={[(W + DOOR_W) / 4, 0, -D / 2 + 0.001]}>
        <boxGeometry args={[(W - DOOR_W) / 2, thick, thick]} />
        {mat}
      </mesh>
    </group>
  )
}

export default function LaundryRoom() {
  return (
    <group>
      {/* ── Lighting ── */}
      <ambientLight intensity={0.5} color="#FFF5E4" />
      <PendantLight z={-3} />
      <PendantLight z={0} />
      <PendantLight z={3} />

      {/* ── Floor ── */}
      <CheckerFloor />

      {/* ── Ceiling ── */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H, 0]} receiveShadow>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial color="#FBF5EE" />
      </mesh>

      {/* ── Back wall — split around doorway into clothes room ── */}
      {/* Top panel: full width, above doorway */}
      <mesh position={[0, DOOR_H + (H - DOOR_H) / 2, -D / 2]}>
        <planeGeometry args={[W, H - DOOR_H]} />
        <meshStandardMaterial color="#F2D6D6" />
      </mesh>
      {/* Left upper panel */}
      <mesh position={[-(W + DOOR_W) / 4, WAINSCOT_H + (DOOR_H - WAINSCOT_H) / 2, -D / 2]}>
        <planeGeometry args={[(W - DOOR_W) / 2, DOOR_H - WAINSCOT_H]} />
        <meshStandardMaterial color="#F2D6D6" />
      </mesh>
      {/* Right upper panel */}
      <mesh position={[(W + DOOR_W) / 4, WAINSCOT_H + (DOOR_H - WAINSCOT_H) / 2, -D / 2]}>
        <planeGeometry args={[(W - DOOR_W) / 2, DOOR_H - WAINSCOT_H]} />
        <meshStandardMaterial color="#F2D6D6" />
      </mesh>
      {/* Left wainscoting */}
      <mesh position={[-(W + DOOR_W) / 4, WAINSCOT_H / 2, -D / 2 + 0.001]}>
        <planeGeometry args={[(W - DOOR_W) / 2, WAINSCOT_H]} />
        <meshStandardMaterial color="#D4B5B5" />
      </mesh>
      {/* Right wainscoting */}
      <mesh position={[(W + DOOR_W) / 4, WAINSCOT_H / 2, -D / 2 + 0.001]}>
        <planeGeometry args={[(W - DOOR_W) / 2, WAINSCOT_H]} />
        <meshStandardMaterial color="#D4B5B5" />
      </mesh>
      {/* Door frame — left post, right post, lintel */}
      <mesh position={[-DOOR_W / 2, DOOR_H / 2, -D / 2 + 0.002]}>
        <boxGeometry args={[0.06, DOOR_H, 0.05]} />
        <meshStandardMaterial color="#FDFAF5" roughness={0.5} />
      </mesh>
      <mesh position={[DOOR_W / 2, DOOR_H / 2, -D / 2 + 0.002]}>
        <boxGeometry args={[0.06, DOOR_H, 0.05]} />
        <meshStandardMaterial color="#FDFAF5" roughness={0.5} />
      </mesh>
      <mesh position={[0, DOOR_H + 0.03, -D / 2 + 0.002]}>
        <boxGeometry args={[DOOR_W + 0.06, 0.06, 0.05]} />
        <meshStandardMaterial color="#FDFAF5" roughness={0.5} />
      </mesh>

      {/* ── Left wall ── */}
      {/* Upper */}
      <mesh
        position={[-W / 2, WAINSCOT_H + (H - WAINSCOT_H) / 2, 0]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <planeGeometry args={[D, H - WAINSCOT_H]} />
        <meshStandardMaterial color="#F2D6D6" />
      </mesh>
      {/* Wainscoting */}
      <mesh
        position={[-W / 2, WAINSCOT_H / 2, 0]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <planeGeometry args={[D, WAINSCOT_H]} />
        <meshStandardMaterial color="#D4B5B5" />
      </mesh>

      {/* ── Right wall ── */}
      {/* Upper */}
      <mesh
        position={[W / 2, WAINSCOT_H + (H - WAINSCOT_H) / 2, 0]}
        rotation={[0, -Math.PI / 2, 0]}
      >
        <planeGeometry args={[D, H - WAINSCOT_H]} />
        <meshStandardMaterial color="#F2D6D6" />
      </mesh>
      {/* Wainscoting */}
      <mesh
        position={[W / 2, WAINSCOT_H / 2, 0]}
        rotation={[0, -Math.PI / 2, 0]}
      >
        <planeGeometry args={[D, WAINSCOT_H]} />
        <meshStandardMaterial color="#D4B5B5" />
      </mesh>

      {/* ── Front wall (entrance side, z = +D/2 = +5.5) ── */}
      {/* Top panel */}
      <mesh position={[0, DOOR_H + (H - DOOR_H) / 2, D / 2]}>
        <planeGeometry args={[W, H - DOOR_H]} />
        <meshStandardMaterial color="#F2D6D6" side={THREE.DoubleSide} />
      </mesh>
      {/* Left upper panel */}
      <mesh position={[-(W + DOOR_W) / 4, WAINSCOT_H + (DOOR_H - WAINSCOT_H) / 2, D / 2]}>
        <planeGeometry args={[(W - DOOR_W) / 2, DOOR_H - WAINSCOT_H]} />
        <meshStandardMaterial color="#F2D6D6" side={THREE.DoubleSide} />
      </mesh>
      {/* Right upper panel */}
      <mesh position={[(W + DOOR_W) / 4, WAINSCOT_H + (DOOR_H - WAINSCOT_H) / 2, D / 2]}>
        <planeGeometry args={[(W - DOOR_W) / 2, DOOR_H - WAINSCOT_H]} />
        <meshStandardMaterial color="#F2D6D6" side={THREE.DoubleSide} />
      </mesh>
      {/* Left wainscoting */}
      <mesh position={[-(W + DOOR_W) / 4, WAINSCOT_H / 2, D / 2]}>
        <planeGeometry args={[(W - DOOR_W) / 2, WAINSCOT_H]} />
        <meshStandardMaterial color="#D4B5B5" side={THREE.DoubleSide} />
      </mesh>
      {/* Right wainscoting */}
      <mesh position={[(W + DOOR_W) / 4, WAINSCOT_H / 2, D / 2]}>
        <planeGeometry args={[(W - DOOR_W) / 2, WAINSCOT_H]} />
        <meshStandardMaterial color="#D4B5B5" side={THREE.DoubleSide} />
      </mesh>
      {/* Front door frame — left post, right post, lintel */}
      <mesh position={[-DOOR_W / 2, DOOR_H / 2, D / 2]}>
        <boxGeometry args={[0.06, DOOR_H, 0.1]} />
        <meshStandardMaterial color="#FDFAF5" roughness={0.5} />
      </mesh>
      <mesh position={[DOOR_W / 2, DOOR_H / 2, D / 2]}>
        <boxGeometry args={[0.06, DOOR_H, 0.1]} />
        <meshStandardMaterial color="#FDFAF5" roughness={0.5} />
      </mesh>
      <mesh position={[0, DOOR_H + 0.03, D / 2]}>
        <boxGeometry args={[DOOR_W + 0.06, 0.06, 0.1]} />
        <meshStandardMaterial color="#FDFAF5" roughness={0.5} />
      </mesh>

      {/* ── Trim details ── */}
      <CrownMolding />
      <WainscotCap />

      {/* ── Washing machines (5 pairs, perfect symmetry) ── */}
      {MACHINE_Z.map((z, i) => (
        <group key={i}>
          {/* Left — rotY = +π/2 so front (+z local) faces world +x (inward) */}
          <WashingMachine
            position={[-MACHINE_X, 0, z]}
            rotationY={Math.PI / 2}
            colorIndex={i}
          />
          {/* Right — rotY = -π/2 so front (+z local) faces world -x (inward) */}
          <WashingMachine
            position={[MACHINE_X, 0, z]}
            rotationY={-Math.PI / 2}
            colorIndex={i}
          />
        </group>
      ))}
    </group>
  )
}
