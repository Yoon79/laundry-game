import { useMemo } from 'react'
import * as THREE from 'three'

// ── Sky dome ──────────────────────────────────────────────────────────────

function Cloud({ pos, scale = 1 }: { pos: [number, number, number]; scale?: number }) {
  const puffs: [number, number, number, number][] = [
    [0,    0,    0,    2.2 * scale],
    [2.6, -0.4,  0.3,  1.7 * scale],
    [-2.3, -0.3, -0.2, 1.5 * scale],
    [0.9,  1.0,  0.2,  1.4 * scale],
    [-0.7,  0.8, -0.3, 1.2 * scale],
    [4.2,  0.1,  0,    1.2 * scale],
    [-3.8,  0.2,  0.1, 1.0 * scale],
    [1.8,  -0.6,  0.5,  1.0 * scale],
  ]
  return (
    <group position={pos}>
      {puffs.map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[r, 8, 6]} />
          <meshStandardMaterial color="#FAFCFF" roughness={0.95} fog={false} />
        </mesh>
      ))}
    </group>
  )
}

function SkyDome() {
  const skyTex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 4; c.height = 512
    const ctx = c.getContext('2d')!
    const g = ctx.createLinearGradient(0, 0, 0, 512)
    g.addColorStop(0,    '#1A50A0')   // deep zenith blue
    g.addColorStop(0.22, '#3878C0')   // mid-high sky
    g.addColorStop(0.44, '#68A8DC')   // open sky
    g.addColorStop(0.60, '#96C0DC')   // near-horizon pale
    g.addColorStop(0.72, '#C8D8E4')   // horizon haze
    g.addColorStop(0.84, '#D8CCB8')   // warm horizon glow
    g.addColorStop(1,    '#C8B8A0')   // below horizon (hidden by terrain)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 4, 512)
    const tex = new THREE.CanvasTexture(c)
    tex.wrapS = THREE.RepeatWrapping
    return tex
  }, [])

  return (
    <group>
      {/* Sky sphere — viewed from inside */}
      <mesh>
        <sphereGeometry args={[85, 32, 20]} />
        <meshStandardMaterial
          map={skyTex}
          side={THREE.BackSide}
          fog={false}
          depthWrite={false}
        />
      </mesh>

      {/* Fluffy clouds at varying heights */}
      <Cloud pos={[-22, 20, -18]} scale={1.2} />
      <Cloud pos={[ 30, 24, -28]} scale={1.5} />
      <Cloud pos={[-44, 18,  2]}  scale={1.0} />
      <Cloud pos={[ 14, 21,  22]} scale={1.3} />
      <Cloud pos={[-10, 26, -42]} scale={1.8} />
      <Cloud pos={[ 42, 17, -10]} scale={0.9} />
    </group>
  )
}

// ── Meadow ground ─────────────────────────────────────────────────────────

function MeadowGround() {
  const grassTex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 512; c.height = 512
    const ctx = c.getContext('2d')!

    // Base rich grass green
    ctx.fillStyle = '#88C458'
    ctx.fillRect(0, 0, 512, 512)

    // Variation blobs (deterministic)
    const cols = ['#78B048', '#9ED468', '#72A840', '#98D060', '#82BC50', '#A0D870']
    for (let i = 0; i < 160; i++) {
      ctx.fillStyle = cols[i % cols.length]
      ctx.beginPath()
      ctx.arc((i * 137) % 512, (i * 97 + 31) % 512, 10 + (i * 19) % 26, 0, Math.PI * 2)
      ctx.fill()
    }

    // Fine grass-blade texture
    ctx.strokeStyle = '#609828'
    ctx.lineWidth = 1
    for (let i = 0; i < 700; i++) {
      const x = (i * 73)  % 512
      const y = (i * 113) % 512
      const dx = ((i % 7) - 3) * 0.8
      const dy = -(6 + (i % 10))
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dx, y + dy); ctx.stroke()
    }

    const tex = new THREE.CanvasTexture(c)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(30, 30)
    return tex
  }, [])

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
      <planeGeometry args={[260, 260]} />
      <meshStandardMaterial map={grassTex} roughness={0.90} />
    </mesh>
  )
}

// ── Rolling hills ─────────────────────────────────────────────────────────

interface HillDef {
  x: number; z: number
  rx: number; ry: number; rz: number
  color: string
}

const HILL_DATA: HillDef[] = [
  // Behind the building (deep background)
  { x:   0, z: -52, rx: 34, ry: 6.0, rz: 26, color: '#6090A8' },
  { x: -28, z: -44, rx: 26, ry: 7.0, rz: 20, color: '#72A840' },
  { x:  32, z: -47, rx: 28, ry: 5.5, rz: 22, color: '#68A040' },
  { x: -52, z: -28, rx: 22, ry: 5.0, rz: 18, color: '#80B04C' },
  { x:  50, z: -30, rx: 24, ry: 6.0, rz: 20, color: '#74A844' },
  // Left side hills
  { x: -58, z: -12, rx: 20, ry: 5.5, rz: 30, color: '#78AC4C' },
  { x: -50, z:  10, rx: 22, ry: 4.5, rz: 22, color: '#84B450' },
  { x: -62, z:  30, rx: 26, ry: 5.0, rz: 20, color: '#6898A8' },
  // Right side hills
  { x:  55, z:  -8, rx: 20, ry: 5.5, rz: 28, color: '#70A848' },
  { x:  50, z:  14, rx: 24, ry: 4.5, rz: 22, color: '#7CAC50' },
  { x:  60, z:  32, rx: 22, ry: 5.0, rz: 18, color: '#6898A8' },
  // Behind the player (when looking back)
  { x: -22, z:  48, rx: 28, ry: 5.5, rz: 20, color: '#7CAC50' },
  { x:  20, z:  50, rx: 24, ry: 6.0, rz: 22, color: '#78A848' },
  { x:   0, z:  58, rx: 32, ry: 5.0, rz: 18, color: '#6090A8' },
]

function RollingHills() {
  return (
    <>
      {HILL_DATA.map((h, i) => (
        <mesh
          key={i}
          position={[h.x, -0.4, h.z]}
          scale={[h.rx, h.ry, h.rz]}
        >
          <sphereGeometry args={[1, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={h.color} roughness={0.96} />
        </mesh>
      ))}
    </>
  )
}

// ── Wildflowers ───────────────────────────────────────────────────────────

const FLOWER_DATA = [
  // Around entrance
  { x:  6.5, z: 12.5, c: '#F0D040' }, { x: -5.5, z: 12.0, c: '#F2A8C0' },
  { x:  8.0, z: 14.5, c: '#FFFFFF' }, { x: -8.0, z: 13.5, c: '#F2D040' },
  { x:  5.0, z: 16.0, c: '#F2A8C0' }, { x: -5.0, z: 16.5, c: '#90D050' },
  // Scattered in meadow
  { x: 14.0, z: 11.0, c: '#FFFFFF' }, { x:-13.0, z: 10.0, c: '#F0D040' },
  { x: 19.0, z: 19.0, c: '#F2A8C0' }, { x:-17.0, z: 17.0, c: '#FFFFFF' },
  { x: 10.0, z: 23.0, c: '#F0D040' }, { x: -9.0, z: 21.0, c: '#90D050' },
  { x:-23.0, z: 15.0, c: '#F2A8C0' }, { x: 24.0, z: 13.0, c: '#F0D040' },
  { x: 28.0, z: 22.0, c: '#FFFFFF' }, { x:-27.0, z: 24.0, c: '#F2A8C0' },
  { x: 15.0, z: 30.0, c: '#F0D040' }, { x:-14.0, z: 28.0, c: '#FFFFFF' },
  { x:  3.0, z: 32.0, c: '#F2A8C0' }, { x: -2.0, z: 35.0, c: '#F0D040' },
]

function WildflowerField() {
  return (
    <>
      {FLOWER_DATA.map((f, i) => (
        <group key={i} position={[f.x, 0, f.z]}>
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.40, 5]} />
            <meshStandardMaterial color="#5A8830" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.42, 0]}>
            <sphereGeometry args={[0.08, 7, 5]} />
            <meshStandardMaterial color={f.c} roughness={0.7} />
          </mesh>
          {/* Two small petals */}
          <mesh position={[0.1, 0.42, 0]} rotation={[0, 0, 0.6]}>
            <sphereGeometry args={[0.045, 5, 4]} />
            <meshStandardMaterial color={f.c} roughness={0.7} />
          </mesh>
          <mesh position={[-0.1, 0.42, 0]} rotation={[0, 0, -0.6]}>
            <sphereGeometry args={[0.045, 5, 4]} />
            <meshStandardMaterial color={f.c} roughness={0.7} />
          </mesh>
        </group>
      ))}
    </>
  )
}

// ── Main export ───────────────────────────────────────────────────────────

export default function Environment() {
  return (
    <group>
      <SkyDome />
      <MeadowGround />
      <RollingHills />
      <WildflowerField />
    </group>
  )
}
