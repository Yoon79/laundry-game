'use client'

import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ── Lost laundry items definition ────────────────────────────────────────────
// Each item's color matches the target washing machine's body color.
// Player matches color to find the right machine.

export interface LostItem {
  id: number
  position: [number, number, number]
  albumId: number    // which washing machine to deliver to
  color: string      // must match target machine's body color
  albumTitle: string
  story: string
}

export const LOST_ITEMS: LostItem[] = [
  {
    id: 0,
    position: [-1.2, 0.06, -11.5],
    albumId: 27,        // 마음 (정규 2016) — colorIndex 27%5=2 → Sage Green
    color: '#C8D8B8',
    albumTitle: '마음',
    story: '레코딩 당일 이루마 씨가 스튜디오에 들어서던 순간, 피아노 선율이 처음 울려 퍼졌습니다. 그 고요한 아침의 공기를 사진 한 장에 담았습니다.',
  },
  {
    id: 1,
    position: [0.9, 0.06, -12.9],
    albumId: 36,        // 잠들 때까지 (정규 2013) — colorIndex 36%5=1 → Powder Blue
    color: '#B8D4E8',
    albumTitle: '잠들 때까지',
    story: '데뷔 앨범 발매 전날 밤, 멤버들이 홍대의 작은 카페에 모여 처음으로 전곡을 들었습니다. 누군가 "이거 진짜 좋다"고 했고, 모두 웃었습니다.',
  },
  {
    id: 2,
    position: [-0.7, 0.06, -14.3],
    albumId: 6,         // 오렌지빛을 쥐고 (EP 2024) — colorIndex 6%5=1 → Powder Blue
    color: '#B8D4E8',
    albumTitle: '오렌지빛을 쥐고',
    story: '가사 속 "치과 충동 방문" 에피소드의 실제 현장. 커피를 사러 나갔다가 간판을 보고 그냥 들어가버린 최인영. 그게 한 곡이 됐습니다.',
  },
  {
    id: 3,
    position: [1.1, 0.06, -15.6],
    albumId: 12,        // 꿈결 (EP 2022) — colorIndex 12%5=2 → Sage Green
    color: '#C8D8B8',
    albumTitle: '꿈결',
    story: '"비스듬히" 녹음 세션. 멜로디를 처음 들은 왕세윤이 "그냥 비스듬히 기대는 느낌"이라고 했고, 그 한마디가 곡 이름이 됐습니다.',
  },
  {
    id: 4,
    position: [-1.0, 0.06, -16.9],
    albumId: 0,         // 파도와 파랑 (싱글 2026) — colorIndex 0%5=0 → Dusty Rose
    color: '#E8B4B8',
    albumTitle: '파도와 파랑',
    story: '"파랑" 데모는 핸드폰 메모장에서 시작됐습니다. 새벽 3시, 불 꺼진 거실에서 손전등 빛에 의지해 악보를 완성한 그 밤의 사진입니다.',
  },
]

// ── Single floating item ──────────────────────────────────────────────────────

interface ItemProps {
  item: LostItem
  isPickedUp: boolean
  onPickup: (item: LostItem) => void
}

function FloatingItem({ item, isPickedUp, onPickup }: ItemProps) {
  const groupRef = useRef<THREE.Group>(null)
  const glowRef  = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame(({ clock }) => {
    if (!groupRef.current || isPickedUp) return
    const t = clock.getElapsedTime()
    groupRef.current.position.y = item.position[1] + Math.sin(t * 1.8 + item.id) * 0.06
    groupRef.current.rotation.y = t * 0.6 + item.id
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.55 + Math.sin(t * 2.5) * 0.25 + (hovered ? 0.3 : 0)
    }
  })

  if (isPickedUp) return null

  return (
    <group
      ref={groupRef}
      position={item.position}
      onClick={(e) => { e.stopPropagation(); onPickup(item) }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true) }}
      onPointerOut={() => setHovered(false)}
    >
      {/* Clothing shape — small flat plane */}
      <mesh ref={glowRef} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.28, 0.28]} />
        <meshStandardMaterial
          color={item.color}
          emissive={item.color}
          emissiveIntensity={0.6}
          side={THREE.DoubleSide}
          roughness={0.7}
        />
      </mesh>

      {/* Outer glow ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.16, 0.22, 24]} />
        <meshStandardMaterial
          color={item.color}
          emissive={item.color}
          emissiveIntensity={hovered ? 1.2 : 0.5}
          transparent
          opacity={0.45}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Point light so it illuminates the floor */}
      <pointLight color={item.color} intensity={0.6} distance={1.2} />

      {/* Hover label — simple sprite-like mesh above item */}
      {hovered && (
        <mesh position={[0, 0.35, 0]}>
          <planeGeometry args={[0.55, 0.14]} />
          <meshStandardMaterial color="#FAF0E6" roughness={0.5} />
        </mesh>
      )}
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
