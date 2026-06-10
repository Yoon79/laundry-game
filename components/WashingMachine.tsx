import { useRef, useState } from 'react'
import * as THREE from 'three'
import { touchState } from '@/lib/touchState'

// Wes Anderson pastel palette — each machine gets its own color
const BODY_COLORS = [
  '#E8B4B8', // Dusty Rose
  '#B8D4E8', // Powder Blue
  '#C8D8B8', // Sage Green
  '#F0E8C0', // Butter Yellow
  '#D8C8E8', // Lavender
]

interface Props {
  position: [number, number, number]
  rotationY: number
  colorIndex: number
  onSelect?: () => void
  isDeliveryTarget?: boolean   // glows golden when player is carrying matching laundry
  onDeliver?: () => void       // called when clicked while isDeliveryTarget
}

export default function WashingMachine({
  position, rotationY, colorIndex,
  onSelect, isDeliveryTarget, onDeliver,
}: Props) {
  const [hovered, setHovered] = useState(false)
  const bodyColor = BODY_COLORS[colorIndex % BODY_COLORS.length]
  // Prevent double-trigger when both onClick and onPointerDown fire
  const firedRef = useRef(false)

  const trigger = (e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    if (firedRef.current) return
    firedRef.current = true
    setTimeout(() => { firedRef.current = false }, 400)
    if (isDeliveryTarget && onDeliver) onDeliver()
    else onSelect?.()
  }

  return (
    <group
      position={position}
      rotation={[0, rotationY, 0]}
      onClick={trigger}
      // onPointerDown fires on touchstart — before the DOM 'click' event, and
      // before any drag threshold trips — so a tap reliably opens the modal on
      // iOS Safari even when the trailing click is suppressed by touch handling.
      // Guard: skip if a camera-drag gesture is already in progress.
      onPointerDown={(e) => { if (!touchState.dragging) trigger(e) }}
      onPointerOver={(e) => { e.stopPropagation(); if (document.pointerLockElement) setHovered(true) }}
      onPointerOut={() => setHovered(false)}
    >
      {/* Golden delivery-target glow ring */}
      {isDeliveryTarget && (
        <mesh position={[0, 0.23, 0]}>
          <boxGeometry args={[0.52, 0.52, 0.40]} />
          <meshStandardMaterial
            color="#FFD080"
            emissive="#FFD080"
            emissiveIntensity={1.2}
            transparent
            opacity={0.18}
            wireframe
          />
        </mesh>
      )}
      {isDeliveryTarget && (
        <pointLight position={[0, 0.3, 0.2]} color="#FFD080" intensity={1.0} distance={1.5} />
      )}
      {/* Main body — front face is at local z = +0.17 */}
      <mesh position={[0, 0.23, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.45, 0.46, 0.34]} />
        <meshStandardMaterial
          color={bodyColor}
          emissive={isDeliveryTarget ? '#FFD080' : bodyColor}
          emissiveIntensity={isDeliveryTarget ? 0.4 : hovered ? 0.22 : 0}
          roughness={0.38}
          metalness={0.06}
        />
      </mesh>

      {/* Chrome porthole ring */}
      <mesh position={[0, 0.23, 0.170]}>
        <torusGeometry args={[0.106, 0.015, 16, 48]} />
        <meshStandardMaterial color="#B0A090" metalness={0.88} roughness={0.12} />
      </mesh>

      {/* Porthole glass */}
      <mesh position={[0, 0.23, 0.172]}>
        <circleGeometry args={[0.091, 32]} />
        <meshStandardMaterial
          color="#A8C8D8"
          transparent
          opacity={0.5}
          roughness={0.04}
          metalness={0.1}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* Top control panel (slight overhang) */}
      <mesh position={[0, 0.472, -0.02]} castShadow>
        <boxGeometry args={[0.44, 0.027, 0.3]} />
        <meshStandardMaterial color="#EDE5DC" roughness={0.5} />
      </mesh>

      {/* Selector knob */}
      <mesh position={[-0.12, 0.488, 0.07]}>
        <cylinderGeometry args={[0.018, 0.018, 0.018, 20]} />
        <meshStandardMaterial color="#8A6858" metalness={0.55} roughness={0.38} />
      </mesh>

      {/* Power knob */}
      <mesh position={[0.12, 0.488, 0.07]}>
        <cylinderGeometry args={[0.013, 0.013, 0.018, 20]} />
        <meshStandardMaterial color="#607090" metalness={0.55} roughness={0.38} />
      </mesh>

      {/* Bottom lip / trim */}
      <mesh position={[0, 0.014, 0.17]}>
        <boxGeometry args={[0.44, 0.027, 0.009]} />
        <meshStandardMaterial color="#C8B8A8" metalness={0.3} roughness={0.5} />
      </mesh>
    </group>
  )
}
