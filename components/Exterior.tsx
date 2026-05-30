import { useMemo } from 'react'
import * as THREE from 'three'
import BuildingShell from './BuildingShell'

// ── Constants (must match LaundryRoom) ────────────────────────────
const FACADE_Z    = 5.5
const FACADE_W    = 8.5    // visual building width (wider than interior W=4)
const FW2         = FACADE_W / 2   // 4.25
const H           = 3.0
const DOOR_W      = 2.0
const DOOR_H      = 2.2
const WAINSCOT_H  = 0.9
const WIN_W       = 1.85   // window width
const WIN_H_R     = 1.72   // rectangular portion height
const WIN_X       = 2.88   // abs x center of each window
const WIN_Y_BOT   = 0.22   // window bottom from floor
const WIN_ARC_R   = WIN_W / 2   // 0.925
const CORNICE_H   = 0.65
const EXT_DEPTH   = 9.5
const EXT_CZ      = FACADE_Z + EXT_DEPTH / 2   // 10.25

// ── Palette ───────────────────────────────────────────────────────
const MINT        = '#A0C898'
const MINT_DARK   = '#789878'
const CREAM       = '#F0E8DC'
const CREAM2      = '#D8CEBC'
const AW_BLUE     = '#88B0CC'
const AW_CREAM    = '#FAF0E8'

// ── Canvas helpers ────────────────────────────────────────────────

function makeWindowCanvas(side: 'left' | 'right'): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 256; c.height = 380
  const ctx = c.getContext('2d')!
  // Green wall
  ctx.fillStyle = '#A8C0A0'
  ctx.fillRect(0, 0, 256, 380)
  // Checkerboard floor
  for (let col = 0; col < 8; col++) {
    for (let row = 0; row < 5; row++) {
      ctx.fillStyle = (col + row) % 2 === 0 ? '#F0E4D8' : '#E0B4B4'
      ctx.fillRect(col * 32, 300 + row * 16, 32, 16)
    }
  }
  // Shadow line at floor join
  ctx.fillStyle = 'rgba(0,0,0,0.12)'
  ctx.fillRect(0, 298, 256, 5)

  if (side === 'left') {
    // Ceiling light glow
    ctx.fillStyle = '#FFE898'
    ctx.beginPath(); ctx.arc(128, 28, 24, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#FFDB60'
    ctx.beginPath(); ctx.arc(128, 38, 13, 0, Math.PI * 2); ctx.fill()
    // Three washing machines
    const mx = [62, 128, 194]
    const mc = ['#EBB8BC', '#B8D4EC', '#CAD9B8']
    mx.forEach((x, i) => {
      ctx.fillStyle = mc[i]
      ctx.fillRect(x - 26, 218, 52, 72)
      ctx.strokeStyle = 'rgba(0,0,0,0.12)'
      ctx.lineWidth = 1.5
      ctx.strokeRect(x - 26, 218, 52, 72)
      // Control panel strip
      ctx.fillStyle = '#D8D0C4'
      ctx.fillRect(x - 26, 218, 52, 13)
      // Porthole ring
      ctx.fillStyle = '#A4C4D4'
      ctx.beginPath(); ctx.arc(x, 256, 16, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = '#B0A090'
      ctx.lineWidth = 2.5; ctx.stroke()
      ctx.fillStyle = 'rgba(255,255,255,0.25)'
      ctx.beginPath(); ctx.arc(x - 5, 250, 5, 0, Math.PI * 2); ctx.fill()
    })
  } else {
    // Hanging plant at top
    ctx.fillStyle = '#7CA860'
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2
      ctx.beginPath()
      ctx.ellipse(128 + Math.cos(a) * 22, 38 + Math.sin(a) * 13, 15, 10, a, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.fillStyle = '#5A8840'
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2
      ctx.beginPath()
      ctx.ellipse(128 + Math.cos(a) * 10, 36 + Math.sin(a) * 7, 9, 6, a, 0, Math.PI * 2)
      ctx.fill()
    }
    // Three wooden shelves
    const shelfY = [105, 170, 235]
    shelfY.forEach(sy => {
      ctx.fillStyle = '#C8A870'
      ctx.fillRect(10, sy, 236, 9)
      ctx.fillStyle = 'rgba(0,0,0,0.08)'
      ctx.fillRect(10, sy + 9, 236, 4)
    })
    // Bottles on shelves
    shelfY.slice(0, 2).forEach(sy => {
      [38, 78, 128, 178, 218].forEach((bx, bi) => {
        const bc = ['#B8D4E4', '#C4D8B4', '#ECC8B0', '#D0B8D4', '#D4DCC4']
        ctx.fillStyle = bc[bi]
        ctx.beginPath(); ctx.ellipse(bx, sy - 20, 11, 22, 0, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = 'rgba(255,255,255,0.55)'
        ctx.fillRect(bx - 8, sy - 28, 16, 12)
        ctx.fillStyle = '#8A7060'
        ctx.fillRect(bx - 4, sy - 44, 8, 6)
      })
    })
    // Baskets on bottom shelf
    ;[55, 128, 201].forEach(bx => {
      ctx.fillStyle = '#C8A860'
      ctx.beginPath(); ctx.ellipse(bx, 272, 28, 22, 0, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = '#A87840'
      ctx.lineWidth = 1.5
      for (let i = -18; i <= 18; i += 5) {
        ctx.beginPath(); ctx.moveTo(bx + i, 252); ctx.lineTo(bx + i, 290); ctx.stroke()
      }
    })
  }
  // Edge vignette
  const vign = ctx.createLinearGradient(0, 0, 256, 0)
  vign.addColorStop(0, 'rgba(0,0,0,0.14)')
  vign.addColorStop(0.18, 'rgba(0,0,0,0)')
  vign.addColorStop(0.82, 'rgba(0,0,0,0)')
  vign.addColorStop(1, 'rgba(0,0,0,0.14)')
  ctx.fillStyle = vign; ctx.fillRect(0, 0, 256, 380)
  return new THREE.CanvasTexture(c)
}

// ── Sub-components ────────────────────────────────────────────────

function CobblestoneFloor() {
  const texture = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 512; c.height = 512
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#C0B8A8'
    ctx.fillRect(0, 0, 512, 512)
    const stoneC = ['#BDB5A5', '#CECA BA'.replace(' ', ''), '#B5AE9E', '#C8C0B0', '#D0C8B8']
    let y = 0; let row = 0
    while (y < 512) {
      let x = row % 2 === 0 ? 0 : -28
      while (x < 512) {
        const sw = 52 + (Math.sin(x * 0.3 + y * 0.2) * 6) | 0
        const sh = 28 + (Math.cos(x * 0.2 + y * 0.4) * 4) | 0
        ctx.fillStyle = stoneC[(row * 7 + (x / 50 | 0)) % stoneC.length]
        ctx.fillRect(x + 2, y + 2, sw - 4, sh - 4)
        x += sw + 2
      }
      y += 30 + (row % 3 === 0 ? 2 : 0)
      row++
    }
    const tex = new THREE.CanvasTexture(c)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(FACADE_W / 2.5, EXT_DEPTH / 2.5)
    return tex
  }, [])

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, EXT_CZ]} receiveShadow>
      <planeGeometry args={[FACADE_W + 4, EXT_DEPTH]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  )
}

function SkyBackground() {
  const texture = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 4; c.height = 512
    const ctx = c.getContext('2d')!
    const g = ctx.createLinearGradient(0, 0, 0, 512)
    g.addColorStop(0,    '#7898C0')
    g.addColorStop(0.30, '#A8BCD8')
    g.addColorStop(0.60, '#C8D8EC')
    g.addColorStop(0.82, '#DDD0C4')
    g.addColorStop(1,    '#EDE0D0')
    ctx.fillStyle = g; ctx.fillRect(0, 0, 4, 512)
    const tex = new THREE.CanvasTexture(c)
    tex.wrapS = THREE.RepeatWrapping
    return tex
  }, [])

  return (
    <group>
      {/* Sky behind the building */}
      <mesh position={[0, 9, -22]} rotation={[0, 0, 0]}>
        <planeGeometry args={[70, 26]} />
        <meshStandardMaterial map={texture} fog={false} depthWrite={false} />
      </mesh>
      {/* Sky above the scene */}
      <mesh position={[0, 22, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[90, 90]} />
        <meshStandardMaterial color="#8AAACE" fog={false} />
      </mesh>
      {/* Side sky — left */}
      <mesh position={[-32, 9, -5]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[60, 26]} />
        <meshStandardMaterial map={texture} fog={false} depthWrite={false} />
      </mesh>
      {/* Side sky — right */}
      <mesh position={[32, 9, -5]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[60, 26]} />
        <meshStandardMaterial map={texture} fog={false} depthWrite={false} />
      </mesh>
      {/* Sky behind player (visible when turning around) */}
      <mesh position={[0, 9, EXT_CZ + 14]}>
        <planeGeometry args={[70, 26]} />
        <meshStandardMaterial map={texture} fog={false} depthWrite={false} side={THREE.BackSide} />
      </mesh>
    </group>
  )
}

function BuildingFacade() {
  const sW  = FW2 - DOOR_W / 2        // 3.25 — width of each side section
  const sCX = -(DOOR_W / 2 + sW / 2)  // -2.625 — left section center x

  return (
    <group position={[0, 0, FACADE_Z + 0.003]}>
      {/* ── Top bar (full width, above door height) ── */}
      <mesh position={[0, DOOR_H + (H - DOOR_H) / 2, 0]}>
        <planeGeometry args={[FACADE_W, H - DOOR_H]} />
        <meshStandardMaterial color={MINT} side={THREE.DoubleSide} />
      </mesh>
      {/* ── Left side upper ── */}
      <mesh position={[sCX, WAINSCOT_H + (DOOR_H - WAINSCOT_H) / 2, 0]}>
        <planeGeometry args={[sW, DOOR_H - WAINSCOT_H]} />
        <meshStandardMaterial color={MINT} side={THREE.DoubleSide} />
      </mesh>
      {/* ── Left wainscot ── */}
      <mesh position={[sCX, WAINSCOT_H / 2, 0.001]}>
        <planeGeometry args={[sW, WAINSCOT_H]} />
        <meshStandardMaterial color={MINT_DARK} side={THREE.DoubleSide} />
      </mesh>
      {/* ── Right side upper ── */}
      <mesh position={[-sCX, WAINSCOT_H + (DOOR_H - WAINSCOT_H) / 2, 0]}>
        <planeGeometry args={[sW, DOOR_H - WAINSCOT_H]} />
        <meshStandardMaterial color={MINT} side={THREE.DoubleSide} />
      </mesh>
      {/* ── Right wainscot ── */}
      <mesh position={[-sCX, WAINSCOT_H / 2, 0.001]}>
        <planeGeometry args={[sW, WAINSCOT_H]} />
        <meshStandardMaterial color={MINT_DARK} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function WindowUnit({ cx, side }: { cx: number; side: 'left' | 'right' }) {
  const leftTex  = useMemo(() => makeWindowCanvas('left'),  [])
  const rightTex = useMemo(() => makeWindowCanvas('right'), [])
  const tex = side === 'left' ? leftTex : rightTex
  const fz = FACADE_Z + 0.018

  return (
    <group position={[cx, 0, 0]}>
      {/* Outer cream frame box */}
      <mesh position={[0, WIN_Y_BOT + WIN_H_R / 2, fz + 0.004]}>
        <boxGeometry args={[WIN_W + 0.14, WIN_H_R + 0.08, 0.09]} />
        <meshStandardMaterial color={CREAM} roughness={0.5} />
      </mesh>
      {/* Sill at base */}
      <mesh position={[0, WIN_Y_BOT - 0.04, fz + 0.04]}>
        <boxGeometry args={[WIN_W + 0.22, 0.07, 0.14]} />
        <meshStandardMaterial color={CREAM} roughness={0.5} />
      </mesh>
      {/* Interior illustrated glass */}
      <mesh position={[0, WIN_Y_BOT + WIN_H_R / 2, fz + 0.015]}>
        <planeGeometry args={[WIN_W - 0.04, WIN_H_R - 0.04]} />
        <meshStandardMaterial map={tex} roughness={0.1} />
      </mesh>
      {/* Horizontal mullion */}
      <mesh position={[0, WIN_Y_BOT + WIN_H_R / 2, fz + 0.02]}>
        <boxGeometry args={[WIN_W - 0.04, 0.032, 0.03]} />
        <meshStandardMaterial color={CREAM} roughness={0.5} />
      </mesh>
      {/* Vertical mullion */}
      <mesh position={[0, WIN_Y_BOT + WIN_H_R / 2, fz + 0.02]}>
        <boxGeometry args={[0.032, WIN_H_R - 0.04, 0.03]} />
        <meshStandardMaterial color={CREAM} roughness={0.5} />
      </mesh>
      {/* Arch frame (torus) */}
      <mesh
        position={[0, WIN_Y_BOT + WIN_H_R, fz + 0.012]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <torusGeometry args={[WIN_ARC_R, 0.05, 8, 28, Math.PI]} />
        <meshStandardMaterial color={CREAM} roughness={0.5} />
      </mesh>
      {/* Arch glass fill (semi-circle) */}
      <mesh position={[0, WIN_Y_BOT + WIN_H_R, fz + 0.008]}>
        <circleGeometry args={[WIN_ARC_R - 0.05, 20, 0, Math.PI]} />
        <meshStandardMaterial color="#B0C8D8" transparent opacity={0.45} roughness={0.1} />
      </mesh>
      {/* Arch keystone (decorative center piece) */}
      <mesh position={[0, WIN_Y_BOT + WIN_H_R + WIN_ARC_R - 0.03, fz + 0.025]}>
        <boxGeometry args={[0.1, 0.16, 0.07]} />
        <meshStandardMaterial color={CREAM2} roughness={0.5} />
      </mesh>
    </group>
  )
}

function Pilasters() {
  const xs = [-FW2 + 0.1, -(DOOR_W / 2), (DOOR_W / 2), FW2 - 0.1]
  return (
    <>
      {xs.map((x, i) => (
        <group key={i} position={[x, H / 2, FACADE_Z + 0.055]}>
          {/* Column shaft */}
          <mesh>
            <boxGeometry args={[0.22, H, 0.12]} />
            <meshStandardMaterial color={CREAM} roughness={0.5} />
          </mesh>
          {/* Capital (top flare) */}
          <mesh position={[0, H / 2 - 0.12, 0.02]}>
            <boxGeometry args={[0.28, 0.22, 0.14]} />
            <meshStandardMaterial color={CREAM} roughness={0.4} />
          </mesh>
          {/* Base plinth */}
          <mesh position={[0, -H / 2 + 0.08, 0.02]}>
            <boxGeometry args={[0.28, 0.16, 0.14]} />
            <meshStandardMaterial color={CREAM} roughness={0.5} />
          </mesh>
        </group>
      ))}
    </>
  )
}

function CorniceAndPediment() {
  return (
    <group>
      {/* Main cornice strip */}
      <mesh position={[0, H + CORNICE_H / 2, FACADE_Z + 0.08]}>
        <boxGeometry args={[FACADE_W + 0.3, CORNICE_H, 0.22]} />
        <meshStandardMaterial color={CREAM} roughness={0.45} />
      </mesh>
      {/* Lower cornice detail */}
      <mesh position={[0, H + 0.06, FACADE_Z + 0.1]}>
        <boxGeometry args={[FACADE_W + 0.2, 0.12, 0.18]} />
        <meshStandardMaterial color={CREAM2} roughness={0.5} />
      </mesh>
      {/* Central arch on cornice (pediment arch) */}
      <mesh
        position={[0, H + CORNICE_H / 2, FACADE_Z + 0.12]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <torusGeometry args={[0.8, 0.05, 8, 24, Math.PI]} />
        <meshStandardMaterial color={CREAM2} roughness={0.5} />
      </mesh>
      {/* Corner finials (left & right) */}
      {([-FW2 + 0.1, FW2 - 0.1] as const).map((x, i) => (
        <group key={i} position={[x, H + CORNICE_H + 0.12, FACADE_Z + 0.08]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.18, 0.22, 0.18]} />
            <meshStandardMaterial color={CREAM} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.2, 0]}>
            <sphereGeometry args={[0.13, 10, 8]} />
            <meshStandardMaterial color={MINT} roughness={0.4} />
          </mesh>
        </group>
      ))}
      {/* Central finial / orb */}
      <group position={[0, H + CORNICE_H + 0.12, FACADE_Z + 0.08]}>
        <mesh>
          <boxGeometry args={[0.16, 0.2, 0.16]} />
          <meshStandardMaterial color={CREAM} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.18, 0]}>
          <sphereGeometry args={[0.12, 10, 8]} />
          <meshStandardMaterial color={MINT} roughness={0.4} />
        </mesh>
      </group>
    </group>
  )
}

function SignBoard() {
  const texture = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 512; c.height = 136
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#FAF0E4'
    ctx.fillRect(0, 0, 512, 136)
    // Outer border
    ctx.strokeStyle = '#C8A880'
    ctx.lineWidth = 6
    ctx.strokeRect(5, 5, 502, 126)
    // Inner line
    ctx.lineWidth = 2
    ctx.strokeStyle = '#D8B890'
    ctx.strokeRect(13, 13, 486, 110)
    // Corner ornaments
    ;[[20, 20], [492, 20], [20, 116], [492, 116]].forEach(([x, y]) => {
      ctx.fillStyle = '#C8A880'
      ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill()
    })
    // Main text
    ctx.fillStyle = '#3D2818'
    ctx.font = 'bold 46px serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('SWEDEN LAUNDRY', 256, 52)
    // Divider line
    ctx.strokeStyle = '#C8A880'
    ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(100, 76); ctx.lineTo(412, 76); ctx.stroke()
    // Sub text
    ctx.font = '500 20px serif'
    ctx.fillStyle = '#A08060'
    ctx.fillText('EST. 2012', 256, 100)
    return new THREE.CanvasTexture(c)
  }, [])

  return (
    <mesh position={[0, H + CORNICE_H / 2, FACADE_Z + 0.14]}>
      <boxGeometry args={[DOOR_W + 1.2, CORNICE_H - 0.08, 0.07]} />
      <meshStandardMaterial map={texture} roughness={0.25} />
    </mesh>
  )
}

function Awning() {
  const texture = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 256; c.height = 64
    const ctx = c.getContext('2d')!
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = i % 2 === 0 ? AW_CREAM : AW_BLUE
      ctx.fillRect(i * 32, 0, 32, 64)
    }
    const tex = new THREE.CanvasTexture(c)
    return tex
  }, [])

  return (
    <group position={[0, DOOR_H + 0.14, FACADE_Z + 0.05]}>
      {/* Awning body — tilted outward */}
      <mesh position={[0, 0, 0.38]} rotation={[-Math.PI / 6, 0, 0]}>
        <boxGeometry args={[DOOR_W + 0.3, 0.012, 0.78]} />
        <meshStandardMaterial map={texture} side={THREE.DoubleSide} roughness={0.65} />
      </mesh>
      {/* Scalloped valance */}
      <mesh position={[0, -0.1, 0.74]}>
        <boxGeometry args={[DOOR_W + 0.3, 0.2, 0.012]} />
        <meshStandardMaterial color={AW_BLUE} roughness={0.65} side={THREE.DoubleSide} />
      </mesh>
      {/* Valance accent stripe */}
      <mesh position={[0, -0.05, 0.748]}>
        <boxGeometry args={[DOOR_W + 0.3, 0.04, 0.006]} />
        <meshStandardMaterial color={AW_CREAM} />
      </mesh>
    </group>
  )
}

function WallSconce({ x }: { x: number }) {
  return (
    <group position={[x, 2.08, FACADE_Z + 0.1]}>
      {/* Wall plate */}
      <mesh>
        <boxGeometry args={[0.09, 0.14, 0.06]} />
        <meshStandardMaterial color={CREAM2} metalness={0.3} roughness={0.5} />
      </mesh>
      {/* Bracket arm */}
      <mesh position={[0, -0.04, 0.12]}>
        <boxGeometry args={[0.04, 0.04, 0.24]} />
        <meshStandardMaterial color={CREAM2} metalness={0.4} roughness={0.4} />
      </mesh>
      {/* Globe shade */}
      <mesh position={[0, -0.04, 0.26]}>
        <sphereGeometry args={[0.09, 12, 10]} />
        <meshStandardMaterial color="#FFFAE0" transparent opacity={0.75} roughness={0.1} />
      </mesh>
      {/* Bulb glow */}
      <mesh position={[0, -0.04, 0.26]}>
        <sphereGeometry args={[0.055, 8, 6]} />
        <meshStandardMaterial
          color="#FFE880"
          emissive="#FFE880"
          emissiveIntensity={2.5}
          roughness={0.2}
        />
      </mesh>
      {/* Light */}
      <pointLight position={[0, -0.04, 0.28]} intensity={0.8} distance={3} color="#FFE8A0" />
    </group>
  )
}

function HangingBasket({ x }: { x: number }) {
  return (
    <group position={[x, 2.35, FACADE_Z + 0.25]}>
      {/* Chain/wire */}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.006, 0.006, 0.5, 6]} />
        <meshStandardMaterial color={CREAM2} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Basket body */}
      <mesh>
        <sphereGeometry args={[0.19, 12, 8]} />
        <meshStandardMaterial color="#C8A868" roughness={0.85} />
      </mesh>
      {/* Weave lines suggestion */}
      {([0, 0.5, 1, 1.5] as const).map((v, i) => (
        <mesh key={i} position={[0, -0.06 + i * 0.04, 0]}>
          <torusGeometry args={[0.17 - i * 0.01, 0.008, 6, 20]} />
          <meshStandardMaterial color="#A88848" roughness={0.9} />
        </mesh>
      ))}
      {/* Flowers */}
      {([0, 1, 2, 3, 4, 5, 6, 7] as const).map((_, i) => {
        const a = (i / 8) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * 0.12, 0.12, Math.sin(a) * 0.12]}>
            <sphereGeometry args={[0.055, 8, 6]} />
            <meshStandardMaterial
              color={i % 3 === 0 ? '#E890A8' : i % 3 === 1 ? '#F0C0C8' : '#F8DDE0'}
              roughness={0.7}
            />
          </mesh>
        )
      })}
      {/* Greenery */}
      {([0, 1, 2, 3] as const).map((_, i) => {
        const a = (i / 4) * Math.PI * 2 + 0.3
        return (
          <mesh key={i} position={[Math.cos(a) * 0.2, 0.0, Math.sin(a) * 0.2]} rotation={[0.4, a, 0]}>
            <boxGeometry args={[0.04, 0.22, 0.03]} />
            <meshStandardMaterial color="#78A858" roughness={0.8} />
          </mesh>
        )
      })}
    </group>
  )
}

interface PotProps { x: number; z: number; flowerColor: string; size?: number }

function FlowerPot({ x, z, flowerColor, size = 1 }: PotProps) {
  const s = size
  return (
    <group position={[x, 0, z]}>
      {/* Pot body */}
      <mesh position={[0, 0.18 * s, 0]}>
        <cylinderGeometry args={[0.13 * s, 0.1 * s, 0.28 * s, 12]} />
        <meshStandardMaterial color="#C08868" roughness={0.85} />
      </mesh>
      {/* Pot rim */}
      <mesh position={[0, 0.33 * s, 0]}>
        <torusGeometry args={[0.14 * s, 0.018 * s, 6, 16]} />
        <meshStandardMaterial color="#A87050" roughness={0.8} />
      </mesh>
      {/* Soil */}
      <mesh position={[0, 0.33 * s, 0]}>
        <cylinderGeometry args={[0.12 * s, 0.12 * s, 0.03 * s, 12]} />
        <meshStandardMaterial color="#5A3A20" roughness={0.95} />
      </mesh>
      {/* Stem */}
      <mesh position={[0, 0.52 * s, 0]}>
        <cylinderGeometry args={[0.014 * s, 0.014 * s, 0.38 * s, 6]} />
        <meshStandardMaterial color="#6A8A50" roughness={0.85} />
      </mesh>
      {/* Flower head */}
      <mesh position={[0, 0.72 * s, 0]}>
        <sphereGeometry args={[0.1 * s, 10, 8]} />
        <meshStandardMaterial color={flowerColor} roughness={0.7} />
      </mesh>
      {/* Petals ring */}
      {([0, 1, 2, 3, 4] as const).map((_, i) => {
        const a = (i / 5) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * 0.14 * s, 0.71 * s, Math.sin(a) * 0.14 * s]}>
            <sphereGeometry args={[0.065 * s, 8, 6]} />
            <meshStandardMaterial color={flowerColor} roughness={0.7} />
          </mesh>
        )
      })}
      {/* Two leaves */}
      {([0.6, -0.6] as const).map((lr, i) => (
        <mesh key={i} position={[lr * 0.1 * s, 0.48 * s, 0]} rotation={[0, 0, lr * 0.6]}>
          <boxGeometry args={[0.04 * s, 0.18 * s, 0.03 * s]} />
          <meshStandardMaterial color="#6A9050" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

function Bench() {
  return (
    <group position={[3.0, 0, FACADE_Z + 0.9]}>
      {/* Legs */}
      {([-0.36, 0.36] as const).map((lx, i) => (
        <group key={i}>
          <mesh position={[lx, 0.2, -0.14]}>
            <boxGeometry args={[0.05, 0.4, 0.05]} />
            <meshStandardMaterial color={MINT} metalness={0.15} roughness={0.6} />
          </mesh>
          <mesh position={[lx, 0.2, 0.14]}>
            <boxGeometry args={[0.05, 0.4, 0.05]} />
            <meshStandardMaterial color={MINT} metalness={0.15} roughness={0.6} />
          </mesh>
        </group>
      ))}
      {/* Seat slats */}
      {([-0.08, 0, 0.08] as const).map((slatz, i) => (
        <mesh key={i} position={[0, 0.41, slatz]}>
          <boxGeometry args={[0.78, 0.05, 0.06]} />
          <meshStandardMaterial color={CREAM} roughness={0.7} />
        </mesh>
      ))}
      {/* Back rest */}
      <mesh position={[0, 0.66, -0.12]}>
        <boxGeometry args={[0.78, 0.25, 0.05]} />
        <meshStandardMaterial color={MINT} metalness={0.15} roughness={0.5} />
      </mesh>
      {/* Connecting stretcher */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[0.75, 0.04, 0.04]} />
        <meshStandardMaterial color={MINT} metalness={0.15} roughness={0.6} />
      </mesh>
    </group>
  )
}

// ── Main export ───────────────────────────────────────────────────

export default function Exterior() {
  return (
    <group>
      {/* ── Outdoor lighting ── */}
      <directionalLight
        position={[5, 12, 9]}
        intensity={2.0}
        color="#FFF8F0"
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
      />
      <hemisphereLight args={['#C8D8F0', '#C0B090', 0.5]} />

      {/* ── Environment ── */}
      <SkyBackground />
      <CobblestoneFloor />

      {/* ── Building shell ── */}
      <BuildingFacade />
      <Pilasters />
      <CorniceAndPediment />

      {/* ── Facade decorations ── */}
      <SignBoard />
      <Awning />
      <WindowUnit cx={-WIN_X} side="left" />
      <WindowUnit cx={WIN_X}  side="right" />

      {/* ── Entrance details ── */}
      <WallSconce x={-(DOOR_W / 2 + 0.32)} />
      <WallSconce x={DOOR_W / 2 + 0.32} />
      <HangingBasket x={-(DOOR_W / 2 + 0.42)} />
      <HangingBasket x={DOOR_W / 2 + 0.42} />

      {/* Step stone */}
      <mesh position={[0, 0.03, FACADE_Z + 0.3]} receiveShadow>
        <boxGeometry args={[DOOR_W - 0.1, 0.06, 0.55]} />
        <meshStandardMaterial color="#D0C8BC" roughness={0.85} />
      </mesh>

      {/* ── Flower pots ── */}
      <FlowerPot x={-3.6} z={FACADE_Z + 0.45} flowerColor="#E890A8" size={1.0} />
      <FlowerPot x={-2.6} z={FACADE_Z + 0.42} flowerColor="#C84860" size={0.9} />
      <FlowerPot x={-1.4} z={FACADE_Z + 0.38} flowerColor="#F0D0D8" size={0.85} />
      <FlowerPot x={1.4}  z={FACADE_Z + 0.38} flowerColor="#D8A8C8" size={0.85} />
      <FlowerPot x={2.6}  z={FACADE_Z + 0.42} flowerColor="#F0C860" size={0.9} />
      <FlowerPot x={3.6}  z={FACADE_Z + 0.45} flowerColor="#E890A8" size={1.0} />

      {/* ── Bench ── */}
      <Bench />

      {/* ── Building shell (side walls, back wall, roof, chimneys) ── */}
      <BuildingShell />

      {/* ── Street side walls (outdoor corridor beside entrance) ── */}
      <mesh
        position={[-(FACADE_W / 2 + 0.02), H / 2, EXT_CZ]}
        rotation={[0, -Math.PI / 2, 0]}
      >
        <planeGeometry args={[EXT_DEPTH, H]} />
        <meshStandardMaterial color={MINT} side={THREE.DoubleSide} />
      </mesh>
      <mesh
        position={[FACADE_W / 2 + 0.02, H / 2, EXT_CZ]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <planeGeometry args={[EXT_DEPTH, H]} />
        <meshStandardMaterial color={MINT} side={THREE.DoubleSide} />
      </mesh>
      {/* Wainscoting for street walls */}
      <mesh
        position={[-(FACADE_W / 2 + 0.02), WAINSCOT_H / 2, EXT_CZ]}
        rotation={[0, -Math.PI / 2, 0]}
      >
        <planeGeometry args={[EXT_DEPTH, WAINSCOT_H]} />
        <meshStandardMaterial color={MINT_DARK} side={THREE.DoubleSide} />
      </mesh>
      <mesh
        position={[FACADE_W / 2 + 0.02, WAINSCOT_H / 2, EXT_CZ]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <planeGeometry args={[EXT_DEPTH, WAINSCOT_H]} />
        <meshStandardMaterial color={MINT_DARK} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}
