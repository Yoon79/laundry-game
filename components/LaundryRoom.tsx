import { useMemo } from 'react'
import * as THREE from 'three'
import WashingMachine from './WashingMachine'

interface LaundryRoomProps {
  onSelectAlbum: (id: number) => void
  deliveryTargetAlbumId?: number | null   // which machine to deliver laundry to
  onDeliverLaundry?: (albumId: number) => void
}

// Room geometry — front wall aligns with building facade at z=5.5
const W          = 4
const H          = 3.0
const ROOM_FRONT = 5.5     // front opening (matches FACADE_Z)
const ROOM_BACK  = -9.5    // back wall (door to ClothesRoom)
const D          = ROOM_FRONT - ROOM_BACK   // 15
const ROOM_CZ    = (ROOM_FRONT + ROOM_BACK) / 2   // -2

const WAINSCOT_H = 0.9
const DOOR_W = 2.0
const DOOR_H = 2.2

// 12 columns × 2 sides × 2 stacks = 48 slots (46 albums + 2 empty)
// 1.2 m spacing, front (z≈4.8) = newest, back (z≈-8.4) = oldest
// All positions strictly inside [ROOM_BACK, ROOM_FRONT]
const MACHINE_Z = [4.8, 3.6, 2.4, 1.2, 0.0, -1.2, -2.4, -3.6, -4.8, -6.0, -7.2, -8.4]

const MACHINE_X = 1.83
const STACK_Y   = 0.49   // 2nd level offset

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
    tex.repeat.set(W / 2, D / 2)
    return tex
  }, [])

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, ROOM_CZ]} receiveShadow>
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

// Suspended ceiling with subtle tile grid
function CeilingMesh() {
  const texture = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 512; c.height = 512
    const ctx = c.getContext('2d')!
    // Warm cream base
    ctx.fillStyle = '#F8F2E8'
    ctx.fillRect(0, 0, 512, 512)
    // Tile recessed grid
    const step = 128
    ctx.strokeStyle = 'rgba(160,138,115,0.22)'
    ctx.lineWidth = 3
    for (let v = 0; v <= 512; v += step) {
      ctx.beginPath(); ctx.moveTo(v, 0); ctx.lineTo(v, 512); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(0, v); ctx.lineTo(512, v); ctx.stroke()
    }
    // Inner bevel shadow per tile
    ctx.strokeStyle = 'rgba(190,165,140,0.13)'
    ctx.lineWidth = 10
    for (let x = 0; x < 512; x += step) {
      for (let y = 0; y < 512; y += step) {
        ctx.strokeRect(x + 12, y + 12, step - 24, step - 24)
      }
    }
    const tex = new THREE.CanvasTexture(c)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(W / 1.5, D / 1.5)
    return tex
  }, [])

  return (
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H, ROOM_CZ]} receiveShadow>
      <planeGeometry args={[W, D]} />
      <meshStandardMaterial map={texture} roughness={0.55} />
    </mesh>
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
      <mesh position={[-W / 2 + thick / 2, 0, ROOM_CZ]}>
        <boxGeometry args={[thick, thick, D]} />
        {mat}
      </mesh>
      {/* Right */}
      <mesh position={[W / 2 - thick / 2, 0, ROOM_CZ]}>
        <boxGeometry args={[thick, thick, D]} />
        {mat}
      </mesh>
      {/* Back */}
      <mesh position={[0, 0, ROOM_BACK + thick / 2]}>
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
      <mesh position={[-W / 2 + 0.001, 0, ROOM_CZ]}>
        <boxGeometry args={[thick, thick, D]} />
        {mat}
      </mesh>
      {/* Right wall */}
      <mesh position={[W / 2 - 0.001, 0, ROOM_CZ]}>
        <boxGeometry args={[thick, thick, D]} />
        {mat}
      </mesh>
      {/* Back wall — split around doorway */}
      <mesh position={[-(W + DOOR_W) / 4, 0, ROOM_BACK + 0.001]}>
        <boxGeometry args={[(W - DOOR_W) / 2, thick, thick]} />
        {mat}
      </mesh>
      <mesh position={[(W + DOOR_W) / 4, 0, ROOM_BACK + 0.001]}>
        <boxGeometry args={[(W - DOOR_W) / 2, thick, thick]} />
        {mat}
      </mesh>
    </group>
  )
}

// Wicker laundry basket
function LaundryBasket({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Main basket body */}
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.11, 0.085, 0.24, 16]} />
        <meshStandardMaterial color="#C8A870" roughness={0.9} />
      </mesh>
      {/* Wicker weave bands */}
      {[0.04, 0.10, 0.18, 0.22].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <torusGeometry args={[0.10, 0.007, 6, 20]} />
          <meshStandardMaterial color="#A87840" roughness={0.95} />
        </mesh>
      ))}
      {/* Handle arc */}
      <mesh position={[0, 0.30, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.085, 0.008, 6, 20, Math.PI]} />
        <meshStandardMaterial color="#A07030" roughness={0.85} />
      </mesh>
    </group>
  )
}

// Floating wall shelf with product bottles
function WallShelf({ position, side }: { position: [number, number, number], side: 'left' | 'right' }) {
  const rotY = side === 'left' ? Math.PI / 2 : -Math.PI / 2
  const bottles = [
    { x: -0.16, color: '#B8D4E8', capColor: '#8890A0' },
    { x: 0,     color: '#C8D4B0', capColor: '#788860' },
    { x: 0.16,  color: '#E4C8B0', capColor: '#906850' },
  ]
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* Shelf plank */}
      <mesh position={[0, 0, 0.025]}>
        <boxGeometry args={[0.46, 0.025, 0.1]} />
        <meshStandardMaterial color="#C8A870" roughness={0.8} />
      </mesh>
      {/* Shelf bracket left */}
      <mesh position={[-0.19, -0.04, 0.06]}>
        <boxGeometry args={[0.018, 0.06, 0.09]} />
        <meshStandardMaterial color="#B09060" roughness={0.8} />
      </mesh>
      {/* Shelf bracket right */}
      <mesh position={[0.19, -0.04, 0.06]}>
        <boxGeometry args={[0.018, 0.06, 0.09]} />
        <meshStandardMaterial color="#B09060" roughness={0.8} />
      </mesh>
      {/* Bottles */}
      {bottles.map((b, i) => (
        <group key={i} position={[b.x, 0.065, 0.065]}>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.028, 0.028, 0.1, 12]} />
            <meshStandardMaterial color={b.color} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.062, 0]}>
            <cylinderGeometry args={[0.016, 0.022, 0.025, 8]} />
            <meshStandardMaterial color={b.capColor} roughness={0.4} />
          </mesh>
          {/* Label */}
          <mesh position={[0, 0, 0.029]}>
            <planeGeometry args={[0.042, 0.05]} />
            <meshStandardMaterial color="#FAF0E6" roughness={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// Hanging plant from ceiling
function CeilingPlant({ position }: { position: [number, number, number] }) {
  const leaves = Array.from({ length: 12 }, (_, i) => i)
  return (
    <group position={position}>
      {/* Hanging cord */}
      <mesh position={[0, -0.12, 0]}>
        <cylinderGeometry args={[0.004, 0.004, 0.24, 4]} />
        <meshStandardMaterial color="#8A7060" />
      </mesh>
      {/* Pot */}
      <mesh position={[0, -0.30, 0]}>
        <cylinderGeometry args={[0.075, 0.055, 0.13, 14]} />
        <meshStandardMaterial color="#C8785A" roughness={0.85} />
      </mesh>
      {/* Soil */}
      <mesh position={[0, -0.235, 0]}>
        <cylinderGeometry args={[0.072, 0.072, 0.01, 14]} />
        <meshStandardMaterial color="#6A4A30" roughness={1} />
      </mesh>
      {/* Trailing leaves */}
      {leaves.map((i) => {
        const angle = (i / leaves.length) * Math.PI * 2
        const drop = 0.06 + (i % 3) * 0.07
        const r = 0.065 + (i % 2) * 0.03
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * r, -0.33 - drop, Math.sin(angle) * r]}
            rotation={[Math.cos(angle) * 0.6, angle, 0.3]}
            scale={[0.8, 0.5, 1]}
          >
            <circleGeometry args={[0.045, 6]} />
            <meshStandardMaterial color={i % 3 === 0 ? '#7AB868' : '#5A9848'} roughness={0.8} side={THREE.DoubleSide} />
          </mesh>
        )
      })}
    </group>
  )
}

// Framed chalkboard sign
function ChalkSign() {
  const texture = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 256; c.height = 160
    const ctx = c.getContext('2d')!
    // Dark green board
    ctx.fillStyle = '#3A5A42'
    ctx.fillRect(0, 0, 256, 160)
    // Chalk text lines
    ctx.fillStyle = 'rgba(255,255,255,0.82)'
    ctx.font = 'bold 20px serif'
    ctx.textAlign = 'center'
    ctx.fillText('SWEDEN LAUNDRY', 128, 42)
    ctx.font = '13px serif'
    ctx.fillStyle = 'rgba(255,255,220,0.70)'
    ctx.fillText('Wash · Dry · Fold', 128, 72)
    ctx.fillText('Est. 2012', 128, 94)
    // Divider line
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(40, 56); ctx.lineTo(216, 56); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(40, 104); ctx.lineTo(216, 104); ctx.stroke()
    // Corner decorations
    ;[[30, 128], [226, 128], [30, 32], [226, 32]].forEach(([x, y]) => {
      ctx.fillStyle = 'rgba(255,255,200,0.5)'
      ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill()
    })
    return new THREE.CanvasTexture(c)
  }, [])

  return (
    <group position={[0, H - 0.45, ROOM_BACK + 0.02]}>
      {/* Frame */}
      <mesh>
        <boxGeometry args={[0.88, 0.56, 0.04]} />
        <meshStandardMaterial color="#8A6040" roughness={0.7} />
      </mesh>
      {/* Board face */}
      <mesh position={[0, 0, 0.022]}>
        <planeGeometry args={[0.78, 0.46]} />
        <meshStandardMaterial map={texture} roughness={0.9} />
      </mesh>
    </group>
  )
}

export default function LaundryRoom({ onSelectAlbum, deliveryTargetAlbumId, onDeliverLaundry }: LaundryRoomProps) {
  return (
    <group>
      {/* ── Lighting — 6 pendants spread across D=15 ── */}
      <ambientLight intensity={0.5} color="#FFF5E4" />
      <PendantLight z={4.2} />
      <PendantLight z={1.5} />
      <PendantLight z={-1.2} />
      <PendantLight z={-4.0} />
      <PendantLight z={-6.8} />
      <PendantLight z={-8.8} />

      {/* ── Floor ── */}
      <CheckerFloor />

      {/* ── Ceiling (tile grid texture) ── */}
      <CeilingMesh />

      {/* ── Back wall — split around doorway into clothes room ── */}
      <mesh position={[0, DOOR_H + (H - DOOR_H) / 2, ROOM_BACK]}>
        <planeGeometry args={[W, H - DOOR_H]} />
        <meshStandardMaterial color="#B0C8A8" />
      </mesh>
      <mesh position={[-(W + DOOR_W) / 4, WAINSCOT_H + (DOOR_H - WAINSCOT_H) / 2, ROOM_BACK]}>
        <planeGeometry args={[(W - DOOR_W) / 2, DOOR_H - WAINSCOT_H]} />
        <meshStandardMaterial color="#B0C8A8" />
      </mesh>
      <mesh position={[(W + DOOR_W) / 4, WAINSCOT_H + (DOOR_H - WAINSCOT_H) / 2, ROOM_BACK]}>
        <planeGeometry args={[(W - DOOR_W) / 2, DOOR_H - WAINSCOT_H]} />
        <meshStandardMaterial color="#B0C8A8" />
      </mesh>
      <mesh position={[-(W + DOOR_W) / 4, WAINSCOT_H / 2, ROOM_BACK + 0.001]}>
        <planeGeometry args={[(W - DOOR_W) / 2, WAINSCOT_H]} />
        <meshStandardMaterial color="#88AA88" />
      </mesh>
      <mesh position={[(W + DOOR_W) / 4, WAINSCOT_H / 2, ROOM_BACK + 0.001]}>
        <planeGeometry args={[(W - DOOR_W) / 2, WAINSCOT_H]} />
        <meshStandardMaterial color="#88AA88" />
      </mesh>
      <mesh position={[-DOOR_W / 2, DOOR_H / 2, ROOM_BACK + 0.002]}>
        <boxGeometry args={[0.06, DOOR_H, 0.05]} />
        <meshStandardMaterial color="#FDFAF5" roughness={0.5} />
      </mesh>
      <mesh position={[DOOR_W / 2, DOOR_H / 2, ROOM_BACK + 0.002]}>
        <boxGeometry args={[0.06, DOOR_H, 0.05]} />
        <meshStandardMaterial color="#FDFAF5" roughness={0.5} />
      </mesh>
      <mesh position={[0, DOOR_H + 0.03, ROOM_BACK + 0.002]}>
        <boxGeometry args={[DOOR_W + 0.06, 0.06, 0.05]} />
        <meshStandardMaterial color="#FDFAF5" roughness={0.5} />
      </mesh>

      {/* ── Left wall ── */}
      <mesh position={[-W / 2, WAINSCOT_H + (H - WAINSCOT_H) / 2, ROOM_CZ]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[D, H - WAINSCOT_H]} />
        <meshStandardMaterial color="#B0C8A8" />
      </mesh>
      <mesh position={[-W / 2, WAINSCOT_H / 2, ROOM_CZ]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[D, WAINSCOT_H]} />
        <meshStandardMaterial color="#88AA88" />
      </mesh>

      {/* ── Right wall ── */}
      <mesh position={[W / 2, WAINSCOT_H + (H - WAINSCOT_H) / 2, ROOM_CZ]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[D, H - WAINSCOT_H]} />
        <meshStandardMaterial color="#B0C8A8" />
      </mesh>
      <mesh position={[W / 2, WAINSCOT_H / 2, ROOM_CZ]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[D, WAINSCOT_H]} />
        <meshStandardMaterial color="#88AA88" />
      </mesh>

      {/* ── Trim details ── */}
      <CrownMolding />
      <WainscotCap />

      {/* ── Interior decor ── */}
      <LaundryBasket position={[-MACHINE_X + 0.28, 0, -2.4]} />
      <LaundryBasket position={[-MACHINE_X + 0.28, 0,  0.0]} />
      <LaundryBasket position={[ MACHINE_X - 0.28, 0, -1.2]} />
      <LaundryBasket position={[ MACHINE_X - 0.28, 0,  1.2]} />

      <WallShelf position={[-W / 2, 1.65, -4.2]} side="left" />
      <WallShelf position={[-W / 2, 1.65,  0.6]} side="left" />
      <WallShelf position={[-W / 2, 1.65, -7.8]} side="left" />
      <WallShelf position={[ W / 2, 1.65, -4.2]} side="right" />
      <WallShelf position={[ W / 2, 1.65,  0.6]} side="right" />
      <WallShelf position={[ W / 2, 1.65, -7.8]} side="right" />

      <CeilingPlant position={[-W / 2 + 0.22, H, ROOM_BACK + 1.0]} />
      <CeilingPlant position={[ W / 2 - 0.22, H, ROOM_BACK + 1.0]} />
      <CeilingPlant position={[-W / 2 + 0.22, H, ROOM_FRONT - 1.0]} />
      <CeilingPlant position={[ W / 2 - 0.22, H, ROOM_FRONT - 1.0]} />

      <ChalkSign />


      {/* ── Washing machines: 12 cols × 2 stacks × 2 sides = 48 slots ── */}
      {/* albumId = col*4 + {left-bottom=0, left-top=1, right-bottom=2, right-top=3} */}
      {MACHINE_Z.map((z, col) => {
        const base = col * 4
        const bracket = (x: number) => (
          <mesh key={`br-${x}-${z}`} position={[x, STACK_Y - 0.005, z]}>
            <boxGeometry args={[0.008, 0.01, 0.30]} />
            <meshStandardMaterial color="#A09080" metalness={0.6} roughness={0.4} />
          </mesh>
        )
        const machine = (
          x: number, y: number, rotY: number,
          albumId: number
        ) => albumId < 46 ? (
          <WashingMachine
            key={`m-${x}-${y}-${z}`}
            position={[x, y, z]}
            rotationY={rotY}
            colorIndex={albumId % 5}
            onSelect={() => onSelectAlbum(albumId)}
            isDeliveryTarget={deliveryTargetAlbumId === albumId}
            onDeliver={deliveryTargetAlbumId === albumId
              ? () => onDeliverLaundry?.(albumId) : undefined}
          />
        ) : null

        return (
          <group key={col}>
            {machine(-MACHINE_X, 0,      Math.PI / 2, base + 0)}
            {machine(-MACHINE_X, STACK_Y, Math.PI / 2, base + 1)}
            {bracket(-MACHINE_X + 0.17)}

            {machine( MACHINE_X, 0,      -Math.PI / 2, base + 2)}
            {machine( MACHINE_X, STACK_Y, -Math.PI / 2, base + 3)}
            {bracket( MACHINE_X - 0.17)}
          </group>
        )
      })}
    </group>
  )
}
