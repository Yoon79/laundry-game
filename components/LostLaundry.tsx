'use client'

import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ── Lost laundry item definitions ────────────────────────────────────────────

export interface LostItem {
  id: number
  position: [number, number, number]
  albumId: number
  color: string
  albumTitle: string
  story: string
}

export const LOST_ITEMS: LostItem[] = [
  {
    id: 0, position: [-1.2, 0.06, -11.5],
    albumId: 27, color: '#C8D8B8', albumTitle: '마음',
    story: '레코딩 당일 이루마 씨가 스튜디오에 들어서던 순간, 피아노 선율이 처음 울려 퍼졌습니다. 그 고요한 아침의 공기를 사진 한 장에 담았습니다.',
  },
  {
    id: 1, position: [0.9, 0.06, -12.9],
    albumId: 36, color: '#B8D4E8', albumTitle: '잠들 때까지',
    story: '데뷔 앨범 발매 전날 밤, 멤버들이 홍대의 작은 카페에 모여 처음으로 전곡을 들었습니다. 누군가 "이거 진짜 좋다"고 했고, 모두 웃었습니다.',
  },
  {
    id: 2, position: [-0.7, 0.06, -14.3],
    albumId: 6, color: '#B8D4E8', albumTitle: '오렌지빛을 쥐고',
    story: '가사 속 "치과 충동 방문" 에피소드의 실제 현장. 커피를 사러 나갔다가 간판을 보고 그냥 들어가버린 최인영. 그게 한 곡이 됐습니다.',
  },
  {
    id: 3, position: [1.1, 0.06, -15.6],
    albumId: 12, color: '#C8D8B8', albumTitle: '꿈결',
    story: '"비스듬히" 녹음 세션. 멜로디를 처음 들은 왕세윤이 "그냥 비스듬히 기대는 느낌"이라고 했고, 그 한마디가 곡 이름이 됐습니다.',
  },
  {
    id: 4, position: [-1.0, 0.06, -16.9],
    albumId: 0, color: '#E8B4B8', albumTitle: '파도와 파랑',
    story: '"파랑" 데모는 핸드폰 메모장에서 시작됐습니다. 새벽 3시, 불 꺼진 거실에서 손전등 빛에 의지해 악보를 완성한 그 밤의 사진입니다.',
  },
]

// ── Canvas texture helpers ────────────────────────────────────────────────────

function useStripeTex(baseColor: string, stripeColor: string, stripeH = 6) {
  return useMemo(() => {
    const c = document.createElement('canvas'); c.width = 64; c.height = 64
    const ctx = c.getContext('2d')!
    for (let y = 0; y < 64; y += stripeH * 2) {
      ctx.fillStyle = baseColor; ctx.fillRect(0, y, 64, stripeH)
      ctx.fillStyle = stripeColor; ctx.fillRect(0, y + stripeH, 64, stripeH)
    }
    const t = new THREE.CanvasTexture(c)
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    return t
  }, [baseColor, stripeColor, stripeH])
}

function useDotTex(baseColor: string, dotColor: string) {
  return useMemo(() => {
    const c = document.createElement('canvas'); c.width = 64; c.height = 64
    const ctx = c.getContext('2d')!
    ctx.fillStyle = baseColor; ctx.fillRect(0, 0, 64, 64)
    ctx.fillStyle = dotColor
    for (let x = 6; x < 64; x += 10) {
      for (let y = 6; y < 64; y += 10) {
        ctx.beginPath(); ctx.arc(x + (y % 20 === 6 ? 5 : 0), y, 1.8, 0, Math.PI * 2); ctx.fill()
      }
    }
    const t = new THREE.CanvasTexture(c)
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    return t
  }, [baseColor, dotColor])
}

function usePlaidTex(c1: string, c2: string, c3: string) {
  return useMemo(() => {
    const c = document.createElement('canvas'); c.width = 64; c.height = 64
    const ctx = c.getContext('2d')!
    ctx.fillStyle = c1; ctx.fillRect(0, 0, 64, 64)
    // Horizontal bands
    ;[8, 24, 40, 56].forEach(y => {
      ctx.fillStyle = c2; ctx.fillRect(0, y, 64, 4)
    })
    // Vertical bands
    ;[8, 24, 40, 56].forEach(x => {
      ctx.fillStyle = c3; ctx.globalAlpha = 0.55; ctx.fillRect(x, 0, 4, 64)
    })
    ctx.globalAlpha = 1
    const t = new THREE.CanvasTexture(c)
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    return t
  }, [c1, c2, c3])
}

// ── Clothing components ───────────────────────────────────────────────────────

/** 0 — 구겨진 줄무늬 티셔츠 */
function CrumpledTshirt() {
  // sage green + white horizontal stripes
  const stripeTex  = useStripeTex('#C8D8B8', 'rgba(255,255,255,0.55)', 5)
  const bodyMat    = <meshStandardMaterial map={stripeTex} roughness={0.88} side={THREE.DoubleSide} />
  const collarMat  = <meshStandardMaterial color="#F8F4EE" roughness={0.75} side={THREE.DoubleSide} />
  const shadowMat  = <meshStandardMaterial color="#A0B090" roughness={0.92} side={THREE.DoubleSide} />
  return (
    <group>
      {/* 몸통 — 살짝 비틀림 */}
      <mesh rotation={[-Math.PI / 2 + 0.10, 0.14, 0.20]}>
        <planeGeometry args={[0.20, 0.22]} />{bodyMat}
      </mesh>
      {/* 왼쪽 소매 — 위로 들림 */}
      <mesh position={[-0.15, 0.030, -0.03]} rotation={[-Math.PI / 2 + 0.45, -0.20, 0.55]}>
        <planeGeometry args={[0.13, 0.065]} />{bodyMat}
      </mesh>
      {/* 오른쪽 소매 — 납작하게 눌림 */}
      <mesh position={[0.13, 0.014, 0.05]} rotation={[-Math.PI / 2 + 0.16, 0.12, -0.45]}>
        <planeGeometry args={[0.12, 0.060]} />{bodyMat}
      </mesh>
      {/* 흰 칼라 — 접혀 올라옴 */}
      <mesh position={[0.02, 0.038, -0.11]} rotation={[-Math.PI / 2 + 0.65, 0.08, 0.06]}>
        <planeGeometry args={[0.10, 0.042]} />{collarMat}
      </mesh>
      {/* 소매 커프스 (흰 줄) */}
      <mesh position={[-0.20, 0.026, -0.06]} rotation={[-Math.PI / 2 + 0.48, -0.18, 0.52]}>
        <planeGeometry args={[0.04, 0.065]} />{collarMat}
      </mesh>
      {/* 구김 그림자 */}
      <mesh position={[-0.04, 0.018, 0.02]} rotation={[-Math.PI / 2 + 0.12, -0.05, 0.30]}>
        <planeGeometry args={[0.12, 0.018]} />{shadowMat}
      </mesh>
      <mesh position={[0.0, 0.022, 0.11]} rotation={[-Math.PI / 2 + 0.22, 0.18, 0.0]}>
        <planeGeometry args={[0.15, 0.028]} />{shadowMat}
      </mesh>
    </group>
  )
}

/** 1 — 한쪽 다리 접힌 인디고 바지 */
function FoldedPants() {
  // indigo-tinted blue with seam highlight
  const denim      = useMemo(() => {
    const c = document.createElement('canvas'); c.width = 64; c.height = 64
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#7890B8'; ctx.fillRect(0, 0, 64, 64)
    // warp threads — subtle vertical lines
    ctx.strokeStyle = 'rgba(60,80,130,0.22)'; ctx.lineWidth = 1
    for (let x = 0; x < 64; x += 3) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 64); ctx.stroke() }
    // weft threads
    ctx.strokeStyle = 'rgba(180,200,240,0.12)'; ctx.lineWidth = 1
    for (let y = 0; y < 64; y += 4) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(64, y); ctx.stroke() }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t
  }, [])
  const dMat       = <meshStandardMaterial map={denim} roughness={0.86} side={THREE.DoubleSide} />
  const waistMat   = <meshStandardMaterial color="#4A5878" roughness={0.82} side={THREE.DoubleSide} />
  const seamMat    = <meshStandardMaterial color="#B0C4DC" roughness={0.70} side={THREE.DoubleSide} />
  const foldShadow = <meshStandardMaterial color="#5A7090" roughness={0.90} side={THREE.DoubleSide} />
  return (
    <group>
      {/* 허리밴드 — 진한 인디고 */}
      <mesh rotation={[-Math.PI / 2 + 0.06, 0, -0.12]}>
        <planeGeometry args={[0.24, 0.045]} />{waistMat}
      </mesh>
      {/* 오른쪽 다리 — 쭉 뻗음 */}
      <mesh position={[0.07, 0.013, 0.16]} rotation={[-Math.PI / 2 + 0.07, 0, -0.06]}>
        <planeGeometry args={[0.105, 0.30]} />{dMat}
      </mesh>
      {/* 솔기 하이라이트 */}
      <mesh position={[0.07, 0.015, 0.16]} rotation={[-Math.PI / 2 + 0.07, 0, -0.055]}>
        <planeGeometry args={[0.008, 0.28]} />{seamMat}
      </mesh>
      {/* 왼쪽 다리 — 접혀 포개짐 */}
      <mesh position={[-0.05, 0.032, 0.06]} rotation={[-Math.PI / 2 + 0.28, 0.18, 0.85]}>
        <planeGeometry args={[0.105, 0.24]} />{foldShadow}
      </mesh>
      {/* 접힌 다리 끝 (발목) */}
      <mesh position={[-0.08, 0.036, -0.05]} rotation={[-Math.PI / 2 + 0.32, -0.12, 0.62]}>
        <planeGeometry args={[0.095, 0.095]} />{dMat}
      </mesh>
      {/* 바짓단 커프 */}
      <mesh position={[0.07, 0.014, 0.30]} rotation={[-Math.PI / 2 + 0.07, 0, -0.08]}>
        <planeGeometry args={[0.105, 0.025]} />{waistMat}
      </mesh>
    </group>
  )
}

/** 2 — 꽃무늬 원피스 뭉침 */
function CrumpledDress() {
  // powder blue with white polka dots → floral vibe
  const floral     = useDotTex('#B8D4E8', 'rgba(255,255,255,0.60)')
  const bodice     = useMemo(() => {
    const c = document.createElement('canvas'); c.width = 32; c.height = 32
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#C8E0F0'; ctx.fillRect(0, 0, 32, 32)
    // Tiny hearts (simplified as rounded rects)
    ctx.fillStyle = 'rgba(255,255,255,0.40)'
    ;[[8,8],[24,16],[10,24]].forEach(([x,y]) => {
      ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2); ctx.fill()
    })
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t
  }, [])
  const flMat      = <meshStandardMaterial map={floral}  roughness={0.87} side={THREE.DoubleSide} />
  const bdMat      = <meshStandardMaterial map={bodice}  roughness={0.84} side={THREE.DoubleSide} />
  const collarMat  = <meshStandardMaterial color="#FDFAF5" roughness={0.75} side={THREE.DoubleSide} />
  const foldMat    = <meshStandardMaterial color="#90B0CC" roughness={0.92} side={THREE.DoubleSide} />
  return (
    <group>
      {/* 스커트 — 넓게 퍼짐 */}
      <mesh rotation={[-Math.PI / 2 + 0.06, 0, 0.25]}>
        <planeGeometry args={[0.30, 0.24]} />{flMat}
      </mesh>
      {/* 스커트 주름 겹 1 */}
      <mesh position={[0.12, 0.022, 0.08]} rotation={[-Math.PI / 2 + 0.30, 0.10, 0.40]}>
        <planeGeometry args={[0.14, 0.10]} />{foldMat}
      </mesh>
      {/* 스커트 주름 겹 2 */}
      <mesh position={[-0.13, 0.018, -0.05]} rotation={[-Math.PI / 2 + 0.20, -0.12, -0.35]}>
        <planeGeometry args={[0.12, 0.09]} />{foldMat}
      </mesh>
      {/* 몸통 (bodice) */}
      <mesh position={[-0.04, 0.038, -0.11]} rotation={[-Math.PI / 2 + 0.55, 0.15, -0.20]}>
        <planeGeometry args={[0.15, 0.12]} />{bdMat}
      </mesh>
      {/* 흰 칼라 */}
      <mesh position={[0.02, 0.050, -0.14]} rotation={[-Math.PI / 2 + 0.70, 0.05, -0.10]}>
        <planeGeometry args={[0.10, 0.06]} />{collarMat}
      </mesh>
      {/* 소매 스텁 */}
      <mesh position={[-0.14, 0.025, -0.12]} rotation={[-Math.PI / 2 + 0.40, -0.20, -0.60]}>
        <planeGeometry args={[0.07, 0.05]} />{bdMat}
      </mesh>
    </group>
  )
}

/** 3 — 구겨진 체크무늬 코트 */
function CrumpledCoat() {
  // sage green plaid outer + warm cream lining
  const plaid      = usePlaidTex('#A8C0A0', '#88A888', '#C0D8B8')
  const liningTex  = useMemo(() => {
    const c = document.createElement('canvas'); c.width = 32; c.height = 32
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#F0E8D8'; ctx.fillRect(0, 0, 32, 32)
    ctx.strokeStyle = 'rgba(200,170,130,0.30)'; ctx.lineWidth = 1
    for (let y = 0; y < 32; y += 4) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(32,y); ctx.stroke() }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t
  }, [])
  const outerMat   = <meshStandardMaterial map={plaid}      roughness={0.88} side={THREE.DoubleSide} />
  const liningMat  = <meshStandardMaterial map={liningTex}  roughness={0.82} side={THREE.DoubleSide} />
  const buttonMat  = <meshStandardMaterial color="#5A4030"  roughness={0.60} metalness={0.20} />
  const shadowMat  = <meshStandardMaterial color="#789070"  roughness={0.93} side={THREE.DoubleSide} />
  return (
    <group>
      {/* 몸통 */}
      <mesh rotation={[-Math.PI / 2 + 0.07, 0, 0.15]}>
        <planeGeometry args={[0.22, 0.38]} />{outerMat}
      </mesh>
      {/* 왼쪽 소매 — 위로 꺾임 */}
      <mesh position={[-0.18, 0.040, -0.06]} rotation={[-Math.PI / 2 + 0.50, -0.15, 0.65]}>
        <planeGeometry args={[0.10, 0.22]} />{outerMat}
      </mesh>
      {/* 오른쪽 소매 — 반대방향 */}
      <mesh position={[0.17, 0.022, 0.04]} rotation={[-Math.PI / 2 + 0.20, 0.12, -0.55]}>
        <planeGeometry args={[0.10, 0.20]} />{outerMat}
      </mesh>
      {/* 라펠 안감 — 크림색 보임 */}
      <mesh position={[0.04, 0.045, -0.17]} rotation={[-Math.PI / 2 + 0.62, 0.08, 0.12]}>
        <planeGeometry args={[0.14, 0.07]} />{liningMat}
      </mesh>
      {/* 하단 안감 */}
      <mesh position={[0.02, 0.024, 0.17]} rotation={[-Math.PI / 2 + 0.18, -0.10, 0.06]}>
        <planeGeometry args={[0.16, 0.040]} />{liningMat}
      </mesh>
      {/* 단추 3개 */}
      {[-0.06, 0.02, 0.10].map((z, i) => (
        <mesh key={i} position={[0.01, 0.020, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.012, 12]} />{buttonMat}
        </mesh>
      ))}
      {/* 구김 그림자 */}
      <mesh position={[-0.09, 0.030, 0.10]} rotation={[-Math.PI / 2 + 0.35, 0.20, 0.18]}>
        <planeGeometry args={[0.10, 0.06]} />{shadowMat}
      </mesh>
    </group>
  )
}

/** 4 — 스트라이프 양말 한 쌍 */
function RolledSocks() {
  // dusty rose + cream + mauve stripes
  const stripeTex  = useStripeTex('#E8B4B8', '#FAF0EE', 4)
  const darkStripe = useStripeTex('#E8B4B8', '#C888A0', 4)
  const sMat       = <meshStandardMaterial map={stripeTex}  roughness={0.85} side={THREE.DoubleSide} />
  const dMat       = <meshStandardMaterial map={darkStripe} roughness={0.85} side={THREE.DoubleSide} />
  return (
    <group>
      {/* 말린 양말 — 여러 겹 링 쌓임 */}
      <group position={[-0.07, 0.0, -0.04]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[0, 0.012 + i * 0.010, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.035 - i * 0.004, 0.058 - i * 0.004, 20]} />
            {i % 2 === 0 ? sMat : dMat}
          </mesh>
        ))}
        {/* 상단 뚜껑 */}
        <mesh position={[0, 0.034, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.035, 20]} />{dMat}
        </mesh>
        {/* 고무줄 링 */}
        <mesh position={[0, 0.040, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.034, 0.048, 20]} />
          <meshStandardMaterial color="#C07090" roughness={0.70} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* 펼쳐진 양말 */}
      <mesh position={[0.08, 0.010, 0.04]} rotation={[-Math.PI / 2 + 0.12, 0, 0.30]}>
        <planeGeometry args={[0.07, 0.18]} />{sMat}
      </mesh>
      {/* 접힌 발목 커프 */}
      <mesh position={[0.09, 0.022, -0.04]} rotation={[-Math.PI / 2 + 0.40, 0.10, 0.28]}>
        <planeGeometry args={[0.07, 0.055]} />{dMat}
      </mesh>
      {/* 발뒤꿈치 주름 */}
      <mesh position={[0.08, 0.015, 0.10]} rotation={[-Math.PI / 2 + 0.22, -0.08, 0.25]}>
        <planeGeometry args={[0.065, 0.030]} />
        <meshStandardMaterial color="#D8989C" roughness={0.88} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

const CLOTHING_SHAPES = [CrumpledTshirt, FoldedPants, CrumpledDress, CrumpledCoat, RolledSocks]

// ── Floating interactive item ─────────────────────────────────────────────────

interface ItemProps {
  item: LostItem
  isPickedUp: boolean
  onPickup: (item: LostItem) => void
}

function FloatingItem({ item, isPickedUp, onPickup }: ItemProps) {
  const groupRef   = useRef<THREE.Group>(null)
  const ringRef    = useRef<THREE.Mesh>(null)
  const lightRef   = useRef<THREE.PointLight>(null)
  const [hovered, setHovered] = useState(false)

  useFrame(({ clock }) => {
    if (!groupRef.current || isPickedUp) return
    const t = clock.getElapsedTime()
    groupRef.current.position.y = item.position[1] + Math.sin(t * 1.5 + item.id) * 0.04
    groupRef.current.rotation.y = Math.sin(t * 0.4 + item.id * 1.2) * 0.22

    const pulse = 0.30 + Math.sin(t * 2.2 + item.id) * 0.12
    if (ringRef.current) {
      const m = ringRef.current.material as THREE.MeshStandardMaterial
      m.emissiveIntensity = pulse + (hovered ? 0.30 : 0)
      m.opacity = 0.22 + pulse * 0.15 + (hovered ? 0.12 : 0)
    }
    if (lightRef.current) {
      lightRef.current.intensity = pulse * 1.2 + (hovered ? 0.5 : 0)
    }
  })

  if (isPickedUp) return null

  const ClothingShape = CLOTHING_SHAPES[item.id]

  return (
    <group
      ref={groupRef}
      position={item.position}
      onClick={(e) => { e.stopPropagation(); onPickup(item) }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true) }}
      onPointerOut={() => setHovered(false)}
    >
      <ClothingShape />

      {/* Floor glow ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]}>
        <ringGeometry args={[0.16, 0.26, 30]} />
        <meshStandardMaterial
          color={item.color}
          emissive={item.color}
          emissiveIntensity={0.4}
          transparent opacity={0.25}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Colored point light illuminating the fabric */}
      <pointLight ref={lightRef} position={[0, 0.12, 0]} color={item.color} intensity={0.5} distance={0.9} />
    </group>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

interface LostLaundryProps {
  pickedUpIds: Set<number>
  onPickup: (item: LostItem) => void
}

export default function LostLaundry({ pickedUpIds, onPickup }: LostLaundryProps) {
  return (
    <group>
      {LOST_ITEMS.map((item) => (
        <FloatingItem
          key={item.id}
          item={item}
          isPickedUp={pickedUpIds.has(item.id)}
          onPickup={onPickup}
        />
      ))}
    </group>
  )
}
