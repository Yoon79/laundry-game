import { useMemo } from 'react'
import * as THREE from 'three'
import WashingMachine from './WashingMachine'

// Room dimensions
const W = 8    // width  (x: -4 to 4)
const H = 3.6  // height (y: 0 to 3.6)
const D = 22   // depth  (z: -11 to 11)

const WAINSCOT_H = 1.1  // lower wall panel height

// 5 machine pairs — symmetric on z axis, spread from back to near entrance
const MACHINE_Z = [-9, -5.5, -2, 1.5, 7]

// Left machine center x: wall at -4, machine depth 0.68 → center at -4 + 0.34 = -3.66
// Right machine center x: wall at +4, machine depth 0.68 → center at +4 - 0.34 = 3.66
const MACHINE_X = 3.66

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
    // Room W=8, D=22 → want ~1 unit tiles → repeat = (W/2, D/2) since 2 tiles per repeat
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
        distance={8}
        color="#FFE0A8"
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
      />
      {/* Ceiling cord */}
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.007, 0.007, 0.6, 6]} />
        <meshStandardMaterial color="#8A7060" />
      </mesh>
      {/* Shade — open-bottomed cone */}
      <mesh position={[0, -0.78, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.28, 0.38, 24, 1, true]} />
        <meshStandardMaterial color="#F2DFA0" side={THREE.DoubleSide} roughness={0.7} />
      </mesh>
      {/* Bulb glow */}
      <mesh position={[0, -0.76, 0]}>
        <sphereGeometry args={[0.055, 12, 8]} />
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
  const thick = 0.06
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
  const thick = 0.04
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
      {/* Back wall */}
      <mesh position={[0, 0, -D / 2 + 0.001]}>
        <boxGeometry args={[W, thick, thick]} />
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
      <PendantLight z={-6.5} />
      <PendantLight z={0} />
      <PendantLight z={6.5} />

      {/* ── Floor ── */}
      <CheckerFloor />

      {/* ── Ceiling ── */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H, 0]} receiveShadow>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial color="#FBF5EE" />
      </mesh>

      {/* ── Back wall ── */}
      <mesh position={[0, H / 2, -D / 2]}>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial color="#F2D6D6" />
      </mesh>
      {/* Back wainscoting */}
      <mesh position={[0, WAINSCOT_H / 2, -D / 2 + 0.001]}>
        <planeGeometry args={[W, WAINSCOT_H]} />
        <meshStandardMaterial color="#D4B5B5" />
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
