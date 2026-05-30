'use client'

import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ── Item definitions ─────────────────────────────────────────────────────────

export interface LostItem {
  id: number
  position: [number, number, number]
  albumId: number
  color: string
  albumTitle: string
  story: string
}

export const LOST_ITEMS: LostItem[] = [
  { id: 0, position: [-1.2, 0.06, -11.5], albumId: 27, color: '#C8D8B8', albumTitle: '마음',
    story: '레코딩 당일 이루마 씨가 스튜디오에 들어서던 순간, 피아노 선율이 처음 울려 퍼졌습니다. 그 고요한 아침의 공기를 사진 한 장에 담았습니다.' },
  { id: 1, position: [0.9, 0.06, -12.9], albumId: 36, color: '#B8D4E8', albumTitle: '잠들 때까지',
    story: '데뷔 앨범 발매 전날 밤, 멤버들이 홍대의 작은 카페에 모여 처음으로 전곡을 들었습니다. 누군가 "이거 진짜 좋다"고 했고, 모두 웃었습니다.' },
  { id: 2, position: [-0.7, 0.06, -14.3], albumId: 6, color: '#B8D4E8', albumTitle: '오렌지빛을 쥐고',
    story: '가사 속 "치과 충동 방문" 에피소드의 실제 현장. 커피를 사러 나갔다가 간판을 보고 그냥 들어가버린 최인영. 그게 한 곡이 됐습니다.' },
  { id: 3, position: [1.1, 0.06, -15.6], albumId: 12, color: '#C8D8B8', albumTitle: '꿈결',
    story: '"비스듬히" 녹음 세션. 멜로디를 처음 들은 왕세윤이 "그냥 비스듬히 기대는 느낌"이라고 했고, 그 한마디가 곡 이름이 됐습니다.' },
  { id: 4, position: [-1.0, 0.06, -16.9], albumId: 0, color: '#E8B4B8', albumTitle: '파도와 파랑',
    story: '"파랑" 데모는 핸드폰 메모장에서 시작됐습니다. 새벽 3시, 불 꺼진 거실에서 손전등 빛에 의지해 악보를 완성한 그 밤의 사진입니다.' },
]

// ── Fabric texture generators ────────────────────────────────────────────────

/** Jersey knit — fine horizontal ribs with subtle sheen */
function makeJerseyTex(base: string, scale = 1) {
  const c = document.createElement('canvas'); c.width = 128; c.height = 64
  const ctx = c.getContext('2d')!
  ctx.fillStyle = base; ctx.fillRect(0, 0, 128, 64)
  for (let y = 0; y < 64; y += 2) {
    ctx.fillStyle = y % 4 === 0 ? 'rgba(0,0,0,0.09)' : 'rgba(255,255,255,0.07)'
    ctx.fillRect(0, y, 128, 1)
  }
  // diagonal sheen
  const g = ctx.createLinearGradient(0, 0, 128, 64)
  g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.35, 'rgba(255,255,255,0.13)')
  g.addColorStop(1, 'rgba(0,0,0,0.10)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 64)
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(3 * scale, 2 * scale); return t
}

/** Denim twill — 45° diagonal weave lines */
function makeDenimTex(base: string) {
  const c = document.createElement('canvas'); c.width = 128; c.height = 128
  const ctx = c.getContext('2d')!
  ctx.fillStyle = base; ctx.fillRect(0, 0, 128, 128)
  ctx.strokeStyle = 'rgba(30,50,100,0.18)'; ctx.lineWidth = 1.5
  for (let i = -128; i < 256; i += 5) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + 128, 128); ctx.stroke()
  }
  // horizontal wash bands
  for (let y = 0; y < 128; y += 22) {
    ctx.fillStyle = 'rgba(255,255,255,0.04)'; ctx.fillRect(0, y, 128, 10)
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(3, 3); return t
}

/** Floral print — dots + small petal rings */
function makeFloraTex(base: string) {
  const c = document.createElement('canvas'); c.width = 128; c.height = 128
  const ctx = c.getContext('2d')!
  ctx.fillStyle = base; ctx.fillRect(0, 0, 128, 128)
  const cols = ['rgba(255,255,255,0.55)', 'rgba(255,230,240,0.50)', 'rgba(200,240,255,0.45)']
  for (let i = 0; i < 14; i++) {
    const x = (i * 37) % 120 + 4, y = (i * 53 + 10) % 120 + 4, r = 3.5 + (i % 3)
    // petals
    for (let p = 0; p < 5; p++) {
      const a = (p / 5) * Math.PI * 2
      ctx.fillStyle = cols[i % 3]
      ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * r, y + Math.sin(a) * r, r * 0.7, r * 0.4, a, 0, Math.PI * 2); ctx.fill()
    }
    // center dot
    ctx.fillStyle = 'rgba(255,240,200,0.70)'
    ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill()
  }
  // fine grid texture overlay
  ctx.strokeStyle = 'rgba(0,0,0,0.04)'; ctx.lineWidth = 0.5
  for (let v = 0; v < 128; v += 4) {
    ctx.beginPath(); ctx.moveTo(v, 0); ctx.lineTo(v, 128); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(0, v); ctx.lineTo(128, v); ctx.stroke()
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(2.5, 2.5); return t
}

/** Herringbone wool — for coat */
function makeHerringTex(base: string, accent: string) {
  const c = document.createElement('canvas'); c.width = 128; c.height = 128
  const ctx = c.getContext('2d')!
  ctx.fillStyle = base; ctx.fillRect(0, 0, 128, 128)
  ctx.strokeStyle = accent; ctx.lineWidth = 1.5
  for (let row = 0; row < 24; row++) {
    const y0 = row * 11
    // left-leaning segment
    for (let x = -128; x < 256; x += 20) {
      ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x + 10, y0 + 5); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(x + 10, y0 + 5); ctx.lineTo(x + 20, y0); ctx.stroke()
    }
    // right-leaning segment (offset row)
    const y1 = y0 + 5
    for (let x = -128; x < 256; x += 20) {
      ctx.beginPath(); ctx.moveTo(x + 10, y1); ctx.lineTo(x + 20, y1 + 5); ctx.stroke()
    }
  }
  // colour wash
  ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(0, 0, 128, 128)
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(2, 2); return t
}

/** Ribbed knit — vertical ribs for socks */
function makeRibTex(base: string, stripe: string) {
  const c = document.createElement('canvas'); c.width = 32; c.height = 128
  const ctx = c.getContext('2d')!
  // Horizontal stripes
  const stripes = [base, stripe, base, 'rgba(255,255,255,0.6)', base, stripe]
  let y = 0
  stripes.forEach(col => {
    ctx.fillStyle = col; ctx.fillRect(0, y, 32, 20); y += 20
  })
  ctx.fillStyle = base; ctx.fillRect(0, y, 32, 128 - y)
  // Vertical rib lines
  ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = 1
  for (let x = 0; x < 32; x += 4) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 128); ctx.stroke() }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(4, 3); return t
}

// ── Shape geometry helpers ────────────────────────────────────────────────────

/** T-shirt outline shape in XY plane (scaled ~0.28 wide, 0.32 tall) */
function makeTshirtShape() {
  const s = new THREE.Shape()
  s.moveTo(-0.05, 0.02)                                    // left neck
  s.lineTo(-0.11, 0.02)                                    // left shoulder
  s.lineTo(-0.155, -0.015)                                 // sleeve top-outer
  s.lineTo(-0.155, -0.075)                                 // sleeve bottom
  s.lineTo(-0.09, -0.065)                                  // armhole
  s.lineTo(-0.09, -0.30)                                   // body bottom-left
  s.lineTo(0.09, -0.30)                                    // body bottom-right
  s.lineTo(0.09, -0.065)                                   // armhole
  s.lineTo(0.155, -0.075)                                  // sleeve bottom
  s.lineTo(0.155, -0.015)                                  // sleeve top-outer
  s.lineTo(0.11, 0.02)                                     // right shoulder
  s.lineTo(0.05, 0.02)                                     // right neck
  s.quadraticCurveTo(0, -0.055, -0.05, 0.02)              // neck curve
  // Neck hole punch-out
  const neck = new THREE.Path()
  neck.moveTo(-0.038, 0.015)
  neck.quadraticCurveTo(0, -0.042, 0.038, 0.015)
  neck.quadraticCurveTo(0.026, 0.025, 0, 0.028)
  neck.quadraticCurveTo(-0.026, 0.025, -0.038, 0.015)
  s.holes.push(neck)
  return s
}

/** Pants outline — two legs, Y goes downward */
function makePantsShape() {
  const s = new THREE.Shape()
  s.moveTo(-0.12, 0.025)   // left waist
  s.lineTo(0.12, 0.025)    // right waist
  s.lineTo(0.12, -0.10)    // right hip
  s.lineTo(0.13, -0.38)    // right outer leg bottom
  s.lineTo(0.045, -0.38)   // right inner leg bottom
  s.quadraticCurveTo(0.028, -0.17, 0, -0.15)   // crotch right curve
  s.quadraticCurveTo(-0.028, -0.17, -0.045, -0.38) // crotch left
  s.lineTo(-0.13, -0.38)   // left inner leg bottom
  s.lineTo(-0.14, -0.10)   // left outer leg bottom
  s.lineTo(-0.12, 0.025)   // back to left waist
  return s
}

/** Dress shape — fitted bodice + flared skirt */
function makeDressShape() {
  const s = new THREE.Shape()
  s.moveTo(-0.04, 0.02)           // neck left
  s.lineTo(-0.10, 0.02)           // shoulder left
  s.lineTo(-0.13, -0.01)          // cap sleeve outer
  s.lineTo(-0.12, -0.055)         // armhole top
  s.lineTo(-0.08, -0.05)          // armhole bottom
  s.lineTo(-0.075, -0.16)         // waist left (narrow)
  s.lineTo(-0.18, -0.42)          // skirt hem left (wide flare)
  s.lineTo(0.18, -0.42)           // skirt hem right
  s.lineTo(0.075, -0.16)          // waist right
  s.lineTo(0.08, -0.05)           // armhole bottom
  s.lineTo(0.12, -0.055)          // armhole top
  s.lineTo(0.13, -0.01)           // cap sleeve
  s.lineTo(0.10, 0.02)            // shoulder right
  s.lineTo(0.04, 0.02)            // neck right
  s.quadraticCurveTo(0, -0.04, -0.04, 0.02) // neck curve
  const neck = new THREE.Path()
  neck.moveTo(-0.028, 0.015)
  neck.quadraticCurveTo(0, -0.03, 0.028, 0.015)
  neck.quadraticCurveTo(0, 0.025, -0.028, 0.015)
  s.holes.push(neck)
  return s
}

/** Coat shape — long, with lapel V notch */
function makeCoatShape() {
  const s = new THREE.Shape()
  s.moveTo(-0.04, 0.02)            // left neck
  s.lineTo(-0.11, 0.02)            // left shoulder
  s.lineTo(-0.165, -0.04)          // left sleeve outer top
  s.lineTo(-0.165, -0.175)         // left sleeve bottom
  s.lineTo(-0.095, -0.155)         // left armhole
  s.lineTo(-0.09, -0.46)           // left hem
  s.lineTo(0.09, -0.46)            // right hem
  s.lineTo(0.095, -0.155)          // right armhole
  s.lineTo(0.165, -0.175)          // right sleeve bottom
  s.lineTo(0.165, -0.04)           // right sleeve outer top
  s.lineTo(0.11, 0.02)             // right shoulder
  s.lineTo(0.055, 0.02)            // right lapel top
  s.lineTo(0.07, -0.10)            // right lapel point
  s.lineTo(0.01, -0.18)            // centre collar V bottom
  s.lineTo(-0.07, -0.10)           // left lapel point
  s.lineTo(-0.055, 0.02)           // left lapel top
  s.lineTo(-0.04, 0.02)
  return s
}

// ── Clothing components ───────────────────────────────────────────────────────

function CrumpledTshirt() {
  const jerseyTex = useMemo(() => makeJerseyTex('#B8CC9C'), [])
  const collarTex = useMemo(() => makeJerseyTex('#F0ECE4', 1.5), [])
  const tshirtGeo = useMemo(() => new THREE.ShapeGeometry(makeTshirtShape(), 12), [])
  const m = (tex: THREE.Texture, col?: string, rough = 0.88) => (
    <meshStandardMaterial map={col ? undefined : tex} color={col} roughness={rough} side={THREE.DoubleSide} />
  )
  return (
    <group>
      {/* Main body silhouette — slightly twisted on floor */}
      <mesh geometry={tshirtGeo} rotation={[-Math.PI / 2 + 0.08, 0.14, 0.18]} position={[0, 0.003, 0]}>
        {m(jerseyTex)}
      </mesh>
      {/* Collar band */}
      <mesh rotation={[-Math.PI / 2 + 0.65, 0.07, 0.05]} position={[0.01, 0.038, -0.11]}>
        <planeGeometry args={[0.11, 0.045]} />{m(collarTex)}
      </mesh>
      {/* Left sleeve crumple fold */}
      <mesh rotation={[-Math.PI / 2 + 0.42, -0.18, 0.50]} position={[-0.162, 0.028, -0.025]}>
        <planeGeometry args={[0.13, 0.065]} />{m(jerseyTex)}
      </mesh>
      {/* Left sleeve cuff (white) */}
      <mesh rotation={[-Math.PI / 2 + 0.44, -0.15, 0.50]} position={[-0.21, 0.030, -0.06]}>
        <planeGeometry args={[0.042, 0.065]} />{m(collarTex)}
      </mesh>
      {/* Right sleeve — pressed flatter */}
      <mesh rotation={[-Math.PI / 2 + 0.14, 0.10, -0.42]} position={[0.14, 0.012, 0.05]}>
        <planeGeometry args={[0.12, 0.062]} />{m(jerseyTex)}
      </mesh>
      {/* Chest crumple peak */}
      <mesh rotation={[-Math.PI / 2 + 0.32, 0.05, 0.10]} position={[0.0, 0.022, -0.04]}>
        <planeGeometry args={[0.14, 0.024]} />
        <meshStandardMaterial color="#98B088" roughness={0.90} side={THREE.DoubleSide} />
      </mesh>
      {/* Hem crumple */}
      <mesh rotation={[-Math.PI / 2 + 0.24, 0.16, 0.0]} position={[0.0, 0.020, 0.12]}>
        <planeGeometry args={[0.15, 0.028]} />
        <meshStandardMaterial color="#98B088" roughness={0.90} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function FoldedPants() {
  const denimTex  = useMemo(() => makeDenimTex('#7090BE'), [])
  const darkDenim = useMemo(() => makeDenimTex('#4A6090'), [])
  const pantsGeo  = useMemo(() => new THREE.ShapeGeometry(makePantsShape(), 12), [])
  const m = (tex: THREE.Texture, rough = 0.86) => (
    <meshStandardMaterial map={tex} roughness={rough} side={THREE.DoubleSide} />
  )
  return (
    <group>
      {/* Main pants silhouette — right leg straight */}
      <mesh geometry={pantsGeo} rotation={[-Math.PI / 2 + 0.06, 0, -0.10]} position={[0, 0.003, 0.10]}>
        {m(denimTex)}
      </mesh>
      {/* Waistband (darker denim) */}
      <mesh rotation={[-Math.PI / 2 + 0.06, 0, -0.10]} position={[0, 0.010, -0.10]}>
        <planeGeometry args={[0.26, 0.048]} />{m(darkDenim)}
      </mesh>
      {/* Belt loop accents */}
      {[-0.08, 0, 0.08].map((x, i) => (
        <mesh key={i} rotation={[-Math.PI / 2 + 0.06, 0, -0.10]} position={[x, 0.016, -0.09]}>
          <planeGeometry args={[0.018, 0.048]} />
          <meshStandardMaterial color="#3A5070" roughness={0.82} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {/* Seam highlight on right leg */}
      <mesh rotation={[-Math.PI / 2 + 0.06, 0, -0.09]} position={[0.08, 0.013, 0.10]}>
        <planeGeometry args={[0.007, 0.34]} />
        <meshStandardMaterial color="#98B4CC" roughness={0.70} side={THREE.DoubleSide} />
      </mesh>
      {/* Left leg — folded over, darker shadow face */}
      <mesh rotation={[-Math.PI / 2 + 0.26, 0.18, 0.86]} position={[-0.055, 0.032, 0.04]}>
        <planeGeometry args={[0.116, 0.24]} />{m(darkDenim)}
      </mesh>
      {/* Folded leg ankle end visible */}
      <mesh rotation={[-Math.PI / 2 + 0.30, -0.12, 0.64]} position={[-0.09, 0.036, -0.04]}>
        <planeGeometry args={[0.10, 0.095]} />{m(denimTex)}
      </mesh>
      {/* Crotch area shadow */}
      <mesh rotation={[-Math.PI / 2 + 0.15, 0.06, 0.0]} position={[0.0, 0.018, -0.06]}>
        <planeGeometry args={[0.10, 0.032]} />
        <meshStandardMaterial color="#3A5070" roughness={0.90} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function CrumpledDress() {
  const floraTex   = useMemo(() => makeFloraTex('#A8C8E0'), [])
  const bodTex     = useMemo(() => makeJerseyTex('#B8D4EC', 1.5), [])
  const dressGeo   = useMemo(() => new THREE.ShapeGeometry(makeDressShape(), 14), [])
  const shadowTex  = useMemo(() => makeJerseyTex('#8AACCF', 1), [])
  const m = (tex: THREE.Texture, rough = 0.87) => (
    <meshStandardMaterial map={tex} roughness={rough} side={THREE.DoubleSide} />
  )
  return (
    <group>
      {/* Main dress silhouette — slightly tilted */}
      <mesh geometry={dressGeo} rotation={[-Math.PI / 2 + 0.06, 0, 0.22]} position={[0, 0.003, 0.04]}>
        {m(floraTex)}
      </mesh>
      {/* Skirt inner fold 1 */}
      <mesh rotation={[-Math.PI / 2 + 0.28, 0.08, 0.38]} position={[0.13, 0.020, 0.09]}>
        <planeGeometry args={[0.15, 0.11]} />{m(shadowTex)}
      </mesh>
      {/* Skirt fold 2 */}
      <mesh rotation={[-Math.PI / 2 + 0.19, -0.10, -0.32]} position={[-0.14, 0.016, -0.04]}>
        <planeGeometry args={[0.13, 0.10]} />{m(shadowTex)}
      </mesh>
      {/* Bodice — crumpled toward back */}
      <mesh rotation={[-Math.PI / 2 + 0.52, 0.14, -0.18]} position={[-0.03, 0.042, -0.12]}>
        <planeGeometry args={[0.165, 0.13]} />{m(bodTex)}
      </mesh>
      {/* Collar — white, sticking up */}
      <mesh rotation={[-Math.PI / 2 + 0.70, 0.05, -0.08]} position={[0.02, 0.052, -0.145]}>
        <planeGeometry args={[0.11, 0.055]} />
        <meshStandardMaterial color="#F8F4F0" roughness={0.72} side={THREE.DoubleSide} />
      </mesh>
      {/* Waist seam — darker stripe */}
      <mesh rotation={[-Math.PI / 2 + 0.06, 0, 0.24]} position={[0, 0.013, -0.08]}>
        <planeGeometry args={[0.17, 0.022]} />
        <meshStandardMaterial color="#8AACCF" roughness={0.90} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function CrumpledCoat() {
  const woolTex    = useMemo(() => makeHerringTex('#7A9C7A', 'rgba(180,220,180,0.55)'), [])
  const liningTex  = useMemo(() => {
    const c = document.createElement('canvas'); c.width = 64; c.height = 64
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#EEE0CC'; ctx.fillRect(0, 0, 64, 64)
    ctx.strokeStyle = 'rgba(160,130,90,0.20)'; ctx.lineWidth = 1
    for (let y = 0; y < 64; y += 5) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(64, y); ctx.stroke() }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(3, 3); return t
  }, [])
  const coatGeo    = useMemo(() => new THREE.ShapeGeometry(makeCoatShape(), 14), [])
  const m = (tex: THREE.Texture, rough = 0.88) => (
    <meshStandardMaterial map={tex} roughness={rough} side={THREE.DoubleSide} />
  )
  return (
    <group>
      {/* Main coat silhouette */}
      <mesh geometry={coatGeo} rotation={[-Math.PI / 2 + 0.07, 0, 0.14]} position={[0, 0.003, 0.06]}>
        {m(woolTex)}
      </mesh>
      {/* Left sleeve raised high */}
      <mesh rotation={[-Math.PI / 2 + 0.48, -0.14, 0.62]} position={[-0.185, 0.042, -0.055]}>
        <planeGeometry args={[0.11, 0.22]} />{m(woolTex)}
      </mesh>
      {/* Left sleeve lining visible on inside */}
      <mesh rotation={[-Math.PI / 2 + 0.50, -0.12, 0.60]} position={[-0.178, 0.038, -0.045]}>
        <planeGeometry args={[0.06, 0.10]} />{m(liningTex)}
      </mesh>
      {/* Right sleeve — splayed other direction */}
      <mesh rotation={[-Math.PI / 2 + 0.18, 0.12, -0.52]} position={[0.18, 0.020, 0.06]}>
        <planeGeometry args={[0.11, 0.20]} />{m(woolTex)}
      </mesh>
      {/* Lapel lining — cream showing */}
      <mesh rotation={[-Math.PI / 2 + 0.60, 0.07, 0.10]} position={[0.05, 0.048, -0.17]}>
        <planeGeometry args={[0.15, 0.075]} />{m(liningTex)}
      </mesh>
      {/* Hem lining peek */}
      <mesh rotation={[-Math.PI / 2 + 0.16, -0.08, 0.05]} position={[0.0, 0.022, 0.18]}>
        <planeGeometry args={[0.18, 0.042]} />{m(liningTex)}
      </mesh>
      {/* Buttons */}
      {[-0.06, 0.02, 0.10].map((z, i) => (
        <mesh key={i} rotation={[-Math.PI / 2 + 0.07, 0, 0.14]} position={[0.005, 0.015 + i * 0.001, z + 0.06]}>
          <circleGeometry args={[0.013, 16]} />
          <meshStandardMaterial color="#4A3828" roughness={0.55} metalness={0.15} />
        </mesh>
      ))}
      {/* Shadow crease on body */}
      <mesh rotation={[-Math.PI / 2 + 0.18, 0.20, 0.18]} position={[-0.08, 0.028, 0.10]}>
        <planeGeometry args={[0.11, 0.065]} />
        <meshStandardMaterial color="#5A8060" roughness={0.93} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function RolledSocks() {
  const ribTex  = useMemo(() => makeRibTex('#E8B4B8', '#C888A0'), [])
  const rimMat  = <meshStandardMaterial color="#C07090" roughness={0.68} metalness={0.05} side={THREE.DoubleSide} />
  const m = (rough = 0.84) => <meshStandardMaterial map={ribTex} roughness={rough} side={THREE.DoubleSide} />
  return (
    <group>
      {/* ── Rolled sock — stacked ring pile ── */}
      <group position={[-0.075, 0.0, -0.045]}>
        {[0, 1, 2, 3].map(i => {
          const r1 = 0.038 - i * 0.004, r2 = 0.062 - i * 0.004
          return (
            <mesh key={i} position={[0, 0.010 + i * 0.011, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[r1, r2, 24]} />{m(0.84 + i * 0.02)}
            </mesh>
          )
        })}
        {/* Top cap */}
        <mesh position={[0, 0.046, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.036, 24]} />{m()}
        </mesh>
        {/* Elastic band */}
        <mesh position={[0, 0.050, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.033, 0.050, 24]} />{rimMat}
        </mesh>
      </group>

      {/* ── Flat sock — laid out, ankle folded back ── */}
      {/* Foot tube */}
      <mesh position={[0.08, 0.010, 0.055]} rotation={[-Math.PI / 2 + 0.11, 0, 0.28]}>
        <planeGeometry args={[0.075, 0.175]} />{m()}
      </mesh>
      {/* Ankle cuff folded back */}
      <mesh position={[0.09, 0.022, -0.038]} rotation={[-Math.PI / 2 + 0.38, 0.09, 0.26]}>
        <planeGeometry args={[0.075, 0.058]} />{m(0.80)}
      </mesh>
      {/* Elastic top band */}
      <mesh position={[0.09, 0.030, -0.058]} rotation={[-Math.PI / 2 + 0.40, 0.09, 0.25]}>
        <planeGeometry args={[0.075, 0.018]} />{rimMat}
      </mesh>
      {/* Heel pocket */}
      <mesh position={[0.082, 0.016, 0.105]} rotation={[-Math.PI / 2 + 0.20, -0.07, 0.26]}>
        <planeGeometry args={[0.065, 0.035]} />
        <meshStandardMaterial color="#D898A4" roughness={0.88} side={THREE.DoubleSide} />
      </mesh>
      {/* Toe seam */}
      <mesh position={[0.08, 0.012, 0.155]} rotation={[-Math.PI / 2 + 0.14, 0, 0.28]}>
        <planeGeometry args={[0.075, 0.012]} />
        <meshStandardMaterial color="#C07090" roughness={0.80} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

const CLOTHING_SHAPES = [CrumpledTshirt, FoldedPants, CrumpledDress, CrumpledCoat, RolledSocks]

// ── Floating item ─────────────────────────────────────────────────────────────

interface ItemProps { item: LostItem; isPickedUp: boolean; onPickup: (item: LostItem) => void }

function FloatingItem({ item, isPickedUp, onPickup }: ItemProps) {
  const groupRef = useRef<THREE.Group>(null)
  const ringRef  = useRef<THREE.Mesh>(null)
  const lightRef = useRef<THREE.PointLight>(null)
  const [hovered, setHovered] = useState(false)

  useFrame(({ clock }) => {
    if (!groupRef.current || isPickedUp) return
    const t = clock.getElapsedTime()
    groupRef.current.position.y = item.position[1] + Math.sin(t * 1.4 + item.id) * 0.035
    groupRef.current.rotation.y = Math.sin(t * 0.38 + item.id * 1.3) * 0.20
    const pulse = 0.28 + Math.sin(t * 2.0 + item.id) * 0.10
    if (ringRef.current) {
      const m = ringRef.current.material as THREE.MeshStandardMaterial
      m.emissiveIntensity = pulse + (hovered ? 0.28 : 0)
      m.opacity = 0.20 + pulse * 0.14 + (hovered ? 0.10 : 0)
    }
    if (lightRef.current) lightRef.current.intensity = pulse + (hovered ? 0.4 : 0)
  })

  if (isPickedUp) return null
  const ClothingShape = CLOTHING_SHAPES[item.id]

  return (
    <group ref={groupRef} position={item.position}
      onClick={(e) => { e.stopPropagation(); onPickup(item) }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true) }}
      onPointerOut={() => setHovered(false)}
    >
      <ClothingShape />
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.045, 0]}>
        <ringGeometry args={[0.17, 0.28, 32]} />
        <meshStandardMaterial color={item.color} emissive={item.color}
          emissiveIntensity={0.35} transparent opacity={0.22}
          side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <pointLight ref={lightRef} position={[0, 0.14, 0]}
        color={item.color} intensity={0.4} distance={0.85} />
    </group>
  )
}

// ── Export ────────────────────────────────────────────────────────────────────

interface LostLaundryProps { pickedUpIds: Set<number>; onPickup: (item: LostItem) => void }

export default function LostLaundry({ pickedUpIds, onPickup }: LostLaundryProps) {
  return (
    <group>
      {LOST_ITEMS.map(item => (
        <FloatingItem key={item.id} item={item}
          isPickedUp={pickedUpIds.has(item.id)} onPickup={onPickup} />
      ))}
    </group>
  )
}
