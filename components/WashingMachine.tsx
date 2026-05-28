import * as THREE from 'three'

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
}

export default function WashingMachine({ position, rotationY, colorIndex }: Props) {
  const bodyColor = BODY_COLORS[colorIndex % BODY_COLORS.length]

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Main body — front face is at local z = +0.34 */}
      <mesh position={[0, 0.46, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.9, 0.92, 0.68]} />
        <meshStandardMaterial color={bodyColor} roughness={0.38} metalness={0.06} />
      </mesh>

      {/* Chrome porthole ring */}
      <mesh position={[0, 0.46, 0.341]}>
        <torusGeometry args={[0.213, 0.03, 16, 48]} />
        <meshStandardMaterial color="#B0A090" metalness={0.88} roughness={0.12} />
      </mesh>

      {/* Porthole glass */}
      <mesh position={[0, 0.46, 0.345]}>
        <circleGeometry args={[0.183, 32]} />
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
      <mesh position={[0, 0.944, -0.04]} castShadow>
        <boxGeometry args={[0.88, 0.054, 0.6]} />
        <meshStandardMaterial color="#EDE5DC" roughness={0.5} />
      </mesh>

      {/* Selector knob */}
      <mesh position={[-0.24, 0.976, 0.14]}>
        <cylinderGeometry args={[0.036, 0.036, 0.036, 20]} />
        <meshStandardMaterial color="#8A6858" metalness={0.55} roughness={0.38} />
      </mesh>

      {/* Power knob */}
      <mesh position={[0.24, 0.976, 0.14]}>
        <cylinderGeometry args={[0.026, 0.026, 0.036, 20]} />
        <meshStandardMaterial color="#607090" metalness={0.55} roughness={0.38} />
      </mesh>

      {/* Bottom lip / trim */}
      <mesh position={[0, 0.028, 0.34]}>
        <boxGeometry args={[0.88, 0.055, 0.018]} />
        <meshStandardMaterial color="#C8B8A8" metalness={0.3} roughness={0.5} />
      </mesh>
    </group>
  )
}
