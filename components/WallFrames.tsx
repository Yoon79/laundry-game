'use client'

import { useMemo, useState, useEffect } from 'react'
import * as THREE from 'three'

// ── Module-level texture cache ────────────────────────────────────────────────
// Textures are created once per artIndex and reused. Defined at module level so
// they survive re-renders and are never recreated unnecessarily.

const _cache = new Map<number, THREE.CanvasTexture>()

function getArtTexture(idx: number): THREE.CanvasTexture {
  const key = idx % 10
  if (_cache.has(key)) return _cache.get(key)!
  const tex = buildArt(key)
  _cache.set(key, tex)
  return tex
}

// Each artwork is intentionally lightweight: one gradient/fill + 1–3 simple shapes.
function buildArt(key: number): THREE.CanvasTexture {
  const W = 128, H = 160
  const c = document.createElement('canvas')
  c.width = W; c.height = H
  const ctx = c.getContext('2d')!

  const bgs = [
    '#1A2840','#FAF6F0','#FDF8F0','#E8D8B8','#0A1428',
    '#B8D4EC','#FFF8E8','#E8D4B8','#F8F0E4','#D4E0E8',
  ]
  const accents = [
    '#FFD878','#8AAA78','#3A2810','#8A5020','#FFFAE0',
    '#6A5040','#C04030','#A87848','#D890B0','#607880',
  ]
  ctx.fillStyle = bgs[key]; ctx.fillRect(0, 0, W, H)

  // thin inner border
  ctx.strokeStyle = accents[key]; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.45
  ctx.strokeRect(8, 8, W - 16, H - 16)
  ctx.globalAlpha = 1.0

  const a = accents[key]

  if (key === 0) { // night window glow
    ctx.fillStyle = '#FFD060'
    ctx.fillRect(W*0.28, H*0.38, W*0.44, H*0.30)
    ctx.fillStyle = bgs[key]
    ctx.fillRect(W*0.46, H*0.38, W*0.08, H*0.30)
    ctx.fillStyle = '#FFFAE0'; ctx.globalAlpha = 0.70
    ;[[22,18],[48,12],[88,22],[108,14]].forEach(([x,y]) => {
      ctx.beginPath(); ctx.arc(x,y,1.2,0,Math.PI*2); ctx.fill()
    })

  } else if (key === 1) { // botanical stems
    ctx.strokeStyle = a; ctx.lineWidth = 1.6; ctx.globalAlpha = 0.70
    ;[[-0.22,0.28],[ 0.12,-0.25],[-0.10,-0.05],[0.24,0.12]].forEach(([dx,dy],i) => {
      const cx = W*0.5+dx*W, cy = H*0.55+dy*H
      ctx.beginPath(); ctx.moveTo(W*0.5,H*0.82); ctx.quadraticCurveTo(W*0.5,cy+H*0.06,cx,cy); ctx.stroke()
      ctx.fillStyle = a; ctx.globalAlpha = 0.55
      ctx.beginPath(); ctx.ellipse(cx,cy,14+i*3,8+i*2,(i-1)*0.4,0,Math.PI*2); ctx.fill()
    })

  } else if (key === 2) { // sheet music
    ctx.strokeStyle = a; ctx.lineWidth = 0.9; ctx.globalAlpha = 0.45
    ;[0.34,0.42,0.50,0.58,0.66].forEach(y => {
      ctx.beginPath(); ctx.moveTo(W*0.10,H*y); ctx.lineTo(W*0.88,H*y); ctx.stroke()
    })
    ctx.fillStyle = a; ctx.globalAlpha = 0.80
    ;[[0.28,0.34],[0.44,0.42],[0.60,0.38],[0.76,0.50]].forEach(([x,y]) => {
      ctx.beginPath(); ctx.ellipse(W*x,H*y,4,3,-0.3,0,Math.PI*2); ctx.fill()
    })

  } else if (key === 3) { // typography
    ctx.fillStyle = a; ctx.textAlign = 'center'; ctx.globalAlpha = 0.85
    ctx.font = `bold ${W*0.13}px serif`; ctx.fillText('SWEDEN', W/2, H*0.38)
    ctx.fillText('LAUNDRY', W/2, H*0.52)
    ctx.font = `${W*0.08}px serif`; ctx.globalAlpha = 0.55
    ctx.fillText('EST. 2012', W/2, H*0.65)
    ctx.globalAlpha = 0.28; ctx.fillRect(W*0.18, H*0.565, W*0.64, 1.5)

  } else if (key === 4) { // night sky
    ctx.fillStyle = '#FFFAE0'; ctx.globalAlpha = 0.92
    ctx.beginPath(); ctx.arc(W*0.64,H*0.24,W*0.16,0,Math.PI*2); ctx.fill()
    ctx.fillStyle = bgs[key]; ctx.globalAlpha = 1
    ctx.beginPath(); ctx.arc(W*0.70,H*0.21,W*0.12,0,Math.PI*2); ctx.fill()
    ctx.fillStyle = '#FFFAE0'
    ;[[18,22],[42,14],[85,38],[112,20],[30,52]].forEach(([x,y]) => {
      ctx.globalAlpha = 0.45+(x%5)*0.08
      ctx.beginPath(); ctx.arc(x,y,1.1,0,Math.PI*2); ctx.fill()
    })
    ctx.fillStyle = '#06101C'; ctx.globalAlpha = 1
    ctx.beginPath(); ctx.moveTo(0,H*0.80); ctx.bezierCurveTo(W*0.3,H*0.68,W*0.65,H*0.72,W,H*0.76)
    ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.closePath(); ctx.fill()

  } else if (key === 5) { // clothes line
    ctx.strokeStyle = '#8A7060'; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.80
    ctx.beginPath(); ctx.moveTo(W*0.07,H*0.33); ctx.lineTo(W*0.93,H*0.35); ctx.stroke()
    const cols = ['#E8A0A8','#A8C8E8','#D8C8A0','#B8D8B8','#D0B8D8']
    ;[0.18,0.34,0.50,0.66,0.82].forEach((x,i) => {
      ctx.fillStyle = cols[i]; ctx.globalAlpha = 0.88
      ctx.fillRect(W*x-W*0.065,H*0.35,W*0.13,H*0.24)
      ctx.fillStyle = '#8A7060'; ctx.globalAlpha = 1
      ctx.fillRect(W*x-W*0.01,H*0.31,W*0.02,H*0.05)
    })

  } else if (key === 6) { // postcard
    ctx.fillStyle = a; ctx.textAlign = 'center'; ctx.globalAlpha = 0.78
    ctx.font = `italic ${W*0.12}px serif`; ctx.fillText('From.', W/2, H*0.44)
    ctx.font = `bold ${W*0.14}px serif`; ctx.fillText('Laundry', W/2, H*0.56)
    ctx.font = `${W*0.08}px serif`; ctx.globalAlpha = 0.50
    ctx.fillText('Seoul · 2012', W/2, H*0.68)
    ;['#E84030','#FDFAF5','#2050A8'].forEach((col,i) => {
      ctx.fillStyle = col; ctx.globalAlpha = 0.65
      ;[0,1,2,3].forEach(j => ctx.fillRect(i*10+j*32, 0, 10, 5))
    })

  } else if (key === 7) { // colour field
    const bands = ['#E8D0B8','#E8B0A8','#C8C0D8','#A8C0B8','#C8D8A8','#D8C0A0']
    bands.forEach((col,i) => {
      ctx.fillStyle = col; ctx.globalAlpha = 0.92
      ctx.fillRect(0, i*(H/bands.length), W, H/bands.length+1)
    })

  } else if (key === 8) { // floral
    ;[[W*0.35,H*0.38,14,'#E8A0B8'],[W*0.65,H*0.54,12,'#D8C0A8'],[W*0.22,H*0.60,11,'#C0C8E0'],[W*0.70,H*0.28,13,'#E8C8A0']].forEach(([cx,cy,r,col]) => {
      for (let p=0; p<5; p++) {
        const ang=(p/5)*Math.PI*2
        ctx.fillStyle = col as string; ctx.globalAlpha = 0.68
        ctx.beginPath()
        ctx.ellipse((cx as number)+Math.cos(ang)*(r as number)*0.9,(cy as number)+Math.sin(ang)*(r as number)*0.9,(r as number)*0.55,(r as number)*0.28,ang,0,Math.PI*2)
        ctx.fill()
      }
      ctx.fillStyle = '#E8D040'; ctx.globalAlpha = 0.88
      ctx.beginPath(); ctx.arc(cx as number,cy as number,(r as number)*0.26,0,Math.PI*2); ctx.fill()
    })

  } else { // mountain
    const sky = ctx.createLinearGradient(0,0,0,H)
    sky.addColorStop(0,'#C8D8E8'); sky.addColorStop(1,'#E8D8C0')
    ctx.fillStyle = sky; ctx.globalAlpha = 1; ctx.fillRect(0,0,W,H)
    ctx.fillStyle = 'rgba(160,180,200,0.55)'
    ctx.beginPath(); ctx.moveTo(0,H*0.74); ctx.lineTo(W*0.28,H*0.48); ctx.lineTo(W*0.58,H*0.65); ctx.lineTo(W,H*0.72); ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.closePath(); ctx.fill()
    ctx.fillStyle = '#5A6870'
    ctx.beginPath(); ctx.moveTo(0,H*0.83); ctx.lineTo(W*0.32,H*0.57); ctx.lineTo(W*0.58,H*0.72); ctx.lineTo(W*0.78,H*0.53); ctx.lineTo(W,H*0.76); ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.closePath(); ctx.fill()
  }

  ctx.globalAlpha = 1
  return new THREE.CanvasTexture(c)
}

// ── Frame sizes ───────────────────────────────────────────────────────────────

type FrameSize = 'portrait' | 'landscape' | 'square' | 'small'
const SIZES: Record<FrameSize, [number, number]> = {
  portrait:  [0.30, 0.40],
  landscape: [0.42, 0.28],
  square:    [0.30, 0.30],
  small:     [0.22, 0.28],
}

// ── WallFrame ─────────────────────────────────────────────────────────────────

interface FrameProps {
  position: [number, number, number]
  rotationY: number
  artIndex: number
  photoIndex?: number   // 1-based index into /public/photos/photo{n}.png
  size?: FrameSize
  tilt?: number
}

function WallFrame({ position, rotationY, artIndex, photoIndex, size = 'portrait', tilt = 0 }: FrameProps) {
  const [fw, fh] = SIZES[size]
  const pw = fw - 0.076; const ph = fh - 0.076

  // Start with canvas fallback; upgrade to real photo when loaded
  const [photoTex, setPhotoTex] = useState<THREE.Texture>(() => getArtTexture(artIndex))

  useEffect(() => {
    if (!photoIndex) return
    const loader = new THREE.TextureLoader()
    let cancelled = false
    loader.load(
      `/photos/photo${photoIndex}.png`,
      (tex) => { if (!cancelled) setPhotoTex(tex) },
      undefined,
      () => { /* file not found — keep canvas art */ }
    )
    return () => { cancelled = true }
  }, [photoIndex, artIndex])

  return (
    <group position={position} rotation={[0, rotationY, tilt * Math.PI / 180]}>
      {/* Outer frame */}
      <mesh>
        <boxGeometry args={[fw, fh, 0.036]} />
        <meshStandardMaterial color="#C0985A" roughness={0.55} metalness={0.06} />
      </mesh>
      {/* Shadow bevel */}
      <mesh position={[0, 0, 0.010]}>
        <boxGeometry args={[fw - 0.013, fh - 0.013, 0.016]} />
        <meshStandardMaterial color="#8A6830" roughness={0.65} />
      </mesh>
      {/* Mat */}
      <mesh position={[0, 0, 0.019]}>
        <boxGeometry args={[fw - 0.017, fh - 0.017, 0.014]} />
        <meshStandardMaterial color="#FAF4EC" roughness={0.78} />
      </mesh>
      {/* Photo */}
      <mesh position={[0, 0, 0.028]}>
        <planeGeometry args={[pw, ph]} />
        <meshStandardMaterial map={photoTex} roughness={0.52} />
      </mesh>
      {/* Glass sheen */}
      <mesh position={[0, 0, 0.030]}>
        <planeGeometry args={[fw - 0.015, fh - 0.015]} />
        <meshStandardMaterial color="#FFFFFF" transparent opacity={0.036} roughness={0.04} metalness={0.12} />
      </mesh>
      {/* Nail */}
      <mesh position={[0, fh / 2 + 0.009, -0.009]}>
        <cylinderGeometry args={[0.004, 0.004, 0.012, 8]} />
        <meshStandardMaterial color="#888070" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  )
}

// ── Room layouts ──────────────────────────────────────────────────────────────

export function LaundryRoomFrames() {
  type F = { z: number; art: number; photo: number; size: FrameSize; tilt: number }
  // Left wall: photo1–5  /  Right wall: photo6–10
  const L: F[] = [
    { z:  3.8, art: 0, photo:  1, size: 'portrait',  tilt: -1.0 },
    { z:  1.2, art: 1, photo:  2, size: 'square',    tilt:  0.8 },
    { z: -1.5, art: 2, photo:  3, size: 'landscape', tilt: -0.5 },
    { z: -4.2, art: 3, photo:  4, size: 'portrait',  tilt:  1.2 },
    { z: -7.0, art: 4, photo:  5, size: 'small',     tilt: -0.7 },
  ]
  const R: F[] = [
    { z:  4.0, art: 5, photo:  6, size: 'small',     tilt:  0.9 },
    { z:  1.4, art: 6, photo:  7, size: 'landscape', tilt: -0.6 },
    { z: -1.2, art: 7, photo:  8, size: 'portrait',  tilt:  0.5 },
    { z: -4.0, art: 8, photo:  9, size: 'square',    tilt: -1.1 },
    { z: -7.2, art: 9, photo: 10, size: 'portrait',  tilt:  0.8 },
  ]
  return (
    <group>
      {L.map((f,i) => <WallFrame key={`lf${i}`} position={[-1.97,2.08,f.z]} rotationY={Math.PI/2} artIndex={f.art} photoIndex={f.photo} size={f.size} tilt={f.tilt} />)}
      {R.map((f,i) => <WallFrame key={`rf${i}`} position={[ 1.97,2.08,f.z]} rotationY={-Math.PI/2} artIndex={f.art} photoIndex={f.photo} size={f.size} tilt={f.tilt} />)}
    </group>
  )
}

export function ClothesRoomFrames() {
  type F = { z: number; art: number; photo?: number; size: FrameSize; tilt: number }
  type B = { x: number; art: number; photo?: number; size: FrameSize; tilt: number }
  // Left: photo11–13 / Right: photo14–16 / Back: photo17 (last 2 → canvas fallback)
  const L: F[] = [
    { z:-11.2, art:0, photo:11, size:'portrait',  tilt: 1.0 },
    { z:-13.8, art:2, photo:12, size:'landscape', tilt:-0.8 },
    { z:-16.5, art:4, photo:13, size:'small',     tilt: 0.5 },
  ]
  const R: F[] = [
    { z:-11.0, art:7, photo:14, size:'small',     tilt:-1.2 },
    { z:-13.6, art:8, photo:15, size:'portrait',  tilt: 0.7 },
    { z:-16.8, art:9, photo:16, size:'landscape', tilt:-0.5 },
  ]
  const Back: B[] = [
    { x:-1.0, art:5, photo:17, size:'portrait',  tilt:-0.9 },
    { x: 0.0, art:6,           size:'landscape', tilt: 0.4 },
    { x: 1.0, art:3,           size:'portrait',  tilt: 1.0 },
  ]
  return (
    <group>
      {L.map((f,i)    => <WallFrame key={`cl${i}`} position={[-1.97,1.74,f.z]}   rotationY={Math.PI/2}  artIndex={f.art} photoIndex={f.photo} size={f.size} tilt={f.tilt} />)}
      {R.map((f,i)    => <WallFrame key={`cr${i}`} position={[ 1.97,1.74,f.z]}   rotationY={-Math.PI/2} artIndex={f.art} photoIndex={f.photo} size={f.size} tilt={f.tilt} />)}
      {Back.map((f,i) => <WallFrame key={`cb${i}`} position={[f.x, 1.82,-17.96]} rotationY={0}          artIndex={f.art} photoIndex={f.photo} size={f.size} tilt={f.tilt} />)}
    </group>
  )
}
