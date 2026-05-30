'use client'

import { useRef, useState } from 'react'
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

// ── Clothing shape components ────────────────────────────────────────────────
// All local geometry lies mostly in the XZ plane (lying on the floor).
// Y-elevation = crumple height.

interface FabricProps { color: string; ei: number }

const FABRIC_MAT = (color: string, ei: number, dimmed = false) => (
  <meshStandardMaterial
    color={color}
    emissive={color}
    emissiveIntensity={dimmed ? ei * 0.55 : ei}
    roughness={0.90}
    side={THREE.DoubleSide}
  />
)

/** 구겨진 티셔츠 — 몸통 비틀림, 소매 펼쳐짐, 칼라 살짝 접힘 */
function CrumpledTshirt({ color, ei }: FabricProps) {
  return (
    <group>
      {/* 몸통 — 약간 뒤틀려 바닥에 누워있음 */}
      <mesh rotation={[-Math.PI / 2 + 0.10, 0.14, 0.20]}>
        <planeGeometry args={[0.20, 0.22]} />
        {FABRIC_MAT(color, ei)}
      </mesh>
      {/* 왼쪽 소매 — 위로 튀어 올라 펼쳐짐 */}
      <mesh position={[-0.15, 0.030, -0.03]} rotation={[-Math.PI / 2 + 0.45, -0.20, 0.55]}>
        <planeGeometry args={[0.13, 0.065]} />
        {FABRIC_MAT(color, ei)}
      </mesh>
      {/* 오른쪽 소매 — 바닥에 가깝게 눌린 각도 */}
      <mesh position={[0.13, 0.014, 0.05]} rotation={[-Math.PI / 2 + 0.16, 0.12, -0.45]}>
        <planeGeometry args={[0.12, 0.060]} />
        {FABRIC_MAT(color, ei)}
      </mesh>
      {/* 칼라 — 접혀 살짝 솟아오름 */}
      <mesh position={[0.02, 0.038, -0.11]} rotation={[-Math.PI / 2 + 0.65, 0.08, 0.06]}>
        <planeGeometry args={[0.10, 0.042]} />
        {FABRIC_MAT(color, ei, true)}
      </mesh>
      {/* 밑단 구김 */}
      <mesh position={[0.0, 0.022, 0.11]} rotation={[-Math.PI / 2 + 0.22, 0.18, 0.0]}>
        <planeGeometry args={[0.15, 0.028]} />
        {FABRIC_MAT(color, ei, true)}
      </mesh>
      {/* 가슴 주름선 */}
      <mesh position={[-0.04, 0.018, 0.02]} rotation={[-Math.PI / 2 + 0.12, -0.05, 0.30]}>
        <planeGeometry args={[0.12, 0.018]} />
        {FABRIC_MAT(color, ei, true)}
      </mesh>
    </group>
  )
}

/** 한쪽 다리 접힌 바지 — 오른다리 펼침, 왼다리 접혀 올라감 */
function FoldedPants({ color, ei }: FabricProps) {
  return (
    <group>
      {/* 허리 밴드 */}
      <mesh rotation={[-Math.PI / 2 + 0.06, 0, -0.12]}>
        <planeGeometry args={[0.24, 0.045]} />
        {FABRIC_MAT(color, ei)}
      </mesh>
      {/* 오른쪽 다리 — 아래로 쭉 뻗음 */}
      <mesh position={[0.07, 0.013, 0.16]} rotation={[-Math.PI / 2 + 0.07, 0, -0.06]}>
        <planeGeometry args={[0.105, 0.30]} />
        {FABRIC_MAT(color, ei)}
      </mesh>
      {/* 왼쪽 다리 — 위로 접혀 오른쪽 다리 위를 넘어감 */}
      <mesh position={[-0.05, 0.032, 0.06]} rotation={[-Math.PI / 2 + 0.28, 0.18, 0.85]}>
        <planeGeometry args={[0.105, 0.24]} />
        {FABRIC_MAT(color, ei, true)}
      </mesh>
      {/* 접힌 다리 끝부분 (발목 부분이 보임) */}
      <mesh position={[-0.08, 0.036, -0.05]} rotation={[-Math.PI / 2 + 0.32, -0.12, 0.62]}>
        <planeGeometry args={[0.095, 0.095]} />
        {FABRIC_MAT(color, ei)}
      </mesh>
      {/* 허리밴드 주름 */}
      <mesh position={[0, 0.024, -0.12]} rotation={[-Math.PI / 2 + 0.22, 0, -0.10]}>
        <planeGeometry args={[0.22, 0.030]} />
        {FABRIC_MAT(color, ei, true)}
      </mesh>
    </group>
  )
}

/** 뭉쳐진 원피스 — 스커트 부분이 부풀어 있고 몸통이 한쪽으로 쏠림 */
function CrumpledDress({ color, ei }: FabricProps) {
  return (
    <group>
      {/* 스커트 — 넓게 퍼져있음 (바닥에 납작) */}
      <mesh rotation={[-Math.PI / 2 + 0.06, 0, 0.25]}>
        <planeGeometry args={[0.30, 0.24]} />
        {FABRIC_MAT(color, ei)}
      </mesh>
      {/* 스커트 접힌 주름 1 */}
      <mesh position={[0.12, 0.022, 0.08]} rotation={[-Math.PI / 2 + 0.30, 0.10, 0.40]}>
        <planeGeometry args={[0.14, 0.10]} />
        {FABRIC_MAT(color, ei, true)}
      </mesh>
      {/* 스커트 접힌 주름 2 */}
      <mesh position={[-0.13, 0.018, -0.05]} rotation={[-Math.PI / 2 + 0.20, -0.12, -0.35]}>
        <planeGeometry args={[0.12, 0.09]} />
        {FABRIC_MAT(color, ei, true)}
      </mesh>
      {/* 몸통 — 구겨져 한쪽에 뭉쳐있음 */}
      <mesh position={[-0.04, 0.038, -0.11]} rotation={[-Math.PI / 2 + 0.55, 0.15, -0.20]}>
        <planeGeometry args={[0.15, 0.12]} />
        {FABRIC_MAT(color, ei)}
      </mesh>
      {/* 칼라/어깨 부분 — 위로 접혀 솟아있음 */}
      <mesh position={[0.02, 0.050, -0.14]} rotation={[-Math.PI / 2 + 0.70, 0.05, -0.10]}>
        <planeGeometry args={[0.10, 0.06]} />
        {FABRIC_MAT(color, ei, true)}
      </mesh>
      {/* 소매 stub */}
      <mesh position={[-0.14, 0.025, -0.12]} rotation={[-Math.PI / 2 + 0.40, -0.20, -0.60]}>
        <planeGeometry args={[0.07, 0.05]} />
        {FABRIC_MAT(color, ei)}
      </mesh>
    </group>
  )
}

/** 구겨진 코트 — 길고 두꺼운 소재, 양 소매 엇갈려 퍼짐 */
function CrumpledCoat({ color, ei }: FabricProps) {
  return (
    <group>
      {/* 코트 몸통 — 길게 누워있음 */}
      <mesh rotation={[-Math.PI / 2 + 0.07, 0, 0.15]}>
        <planeGeometry args={[0.22, 0.38]} />
        {FABRIC_MAT(color, ei)}
      </mesh>
      {/* 왼쪽 소매 — 위로 꺾여 올라감 */}
      <mesh position={[-0.18, 0.040, -0.06]} rotation={[-Math.PI / 2 + 0.50, -0.15, 0.65]}>
        <planeGeometry args={[0.10, 0.22]} />
        {FABRIC_MAT(color, ei)}
      </mesh>
      {/* 오른쪽 소매 — 반대방향으로 벌어짐 */}
      <mesh position={[0.17, 0.022, 0.04]} rotation={[-Math.PI / 2 + 0.20, 0.12, -0.55]}>
        <planeGeometry args={[0.10, 0.20]} />
        {FABRIC_MAT(color, ei)}
      </mesh>
      {/* 라펠(옷깃) — 접혀 살짝 올라옴 */}
      <mesh position={[0.04, 0.045, -0.17]} rotation={[-Math.PI / 2 + 0.62, 0.08, 0.12]}>
        <planeGeometry args={[0.14, 0.07]} />
        {FABRIC_MAT(color, ei, true)}
      </mesh>
      {/* 하단 단추 부분 구김 */}
      <mesh position={[0.02, 0.024, 0.17]} rotation={[-Math.PI / 2 + 0.18, -0.10, 0.06]}>
        <planeGeometry args={[0.16, 0.040]} />
        {FABRIC_MAT(color, ei, true)}
      </mesh>
      {/* 안감이 살짝 보이는 접힌 부분 */}
      <mesh position={[-0.09, 0.030, 0.10]} rotation={[-Math.PI / 2 + 0.35, 0.20, 0.18]}>
        <planeGeometry args={[0.10, 0.06]} />
        {FABRIC_MAT(color, ei, true)}
      </mesh>
    </group>
  )
}

/** 돌돌 말린 양말 한 쌍 — 하나는 동그랗게 말리고, 하나는 펼쳐짐 */
function RolledSocks({ color, ei }: FabricProps) {
  return (
    <group>
      {/* 말린 양말 — 여러 링이 쌓인 것처럼 */}
      <group position={[-0.07, 0.0, -0.05]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[0, 0.012 + i * 0.010, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.038 - i * 0.005, 0.060 - i * 0.005, 18]} />
            {FABRIC_MAT(color, ei, i > 0)}
          </mesh>
        ))}
        {/* 말린 양말 상단 원형 */}
        <mesh position={[0, 0.036, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.038, 18]} />
          {FABRIC_MAT(color, ei, true)}
        </mesh>
      </group>

      {/* 펼쳐진 양말 — 바닥에 길게 누워있고 발목이 살짝 접힘 */}
      <mesh position={[0.08, 0.010, 0.04]} rotation={[-Math.PI / 2 + 0.12, 0, 0.30]}>
        <planeGeometry args={[0.07, 0.18]} />
        {FABRIC_MAT(color, ei)}
      </mesh>
      {/* 발목 부분 — 뒤집어 접힌 부분 */}
      <mesh position={[0.09, 0.022, -0.04]} rotation={[-Math.PI / 2 + 0.40, 0.10, 0.28]}>
        <planeGeometry args={[0.07, 0.055]} />
        {FABRIC_MAT(color, ei, true)}
      </mesh>
      {/* 발뒤꿈치 주름 */}
      <mesh position={[0.08, 0.015, 0.10]} rotation={[-Math.PI / 2 + 0.22, -0.08, 0.25]}>
        <planeGeometry args={[0.065, 0.030]} />
        {FABRIC_MAT(color, ei, true)}
      </mesh>
    </group>
  )
}

// ── Clothing shape selector ───────────────────────────────────────────────────

const CLOTHING_SHAPES = [CrumpledTshirt, FoldedPants, CrumpledDress, CrumpledCoat, RolledSocks]

// ── Floating interactive item ─────────────────────────────────────────────────

interface ItemProps {
  item: LostItem
  isPickedUp: boolean
  onPickup: (item: LostItem) => void
}

function FloatingItem({ item, isPickedUp, onPickup }: ItemProps) {
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const eiRef = useRef(0.55)

  useFrame(({ clock }) => {
    if (!groupRef.current || isPickedUp) return
    const t = clock.getElapsedTime()
    // Gentle float — small Y oscillation and slow rotation
    groupRef.current.position.y = item.position[1] + Math.sin(t * 1.5 + item.id) * 0.04
    groupRef.current.rotation.y = Math.sin(t * 0.4 + item.id * 1.2) * 0.25

    // Pulse emissive intensity
    eiRef.current = 0.45 + Math.sin(t * 2.2 + item.id) * 0.18 + (hovered ? 0.28 : 0)
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
      {/* Clothing shape */}
      <ClothingShape color={item.color} ei={eiRef.current} />

      {/* Subtle glow ring on the floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]}>
        <ringGeometry args={[0.18, 0.28, 28]} />
        <meshStandardMaterial
          color={item.color}
          emissive={item.color}
          emissiveIntensity={hovered ? 1.0 : 0.4}
          transparent
          opacity={0.30}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Point light — illuminates floor around item */}
      <pointLight
        position={[0, 0.1, 0]}
        color={item.color}
        intensity={hovered ? 1.0 : 0.5}
        distance={1.0}
      />
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
