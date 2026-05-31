'use client'

import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface CDPlayerProps {
  position: [number, number, number]
  rotationY: number
  playing: boolean
  onToggle: () => void
}

export default function CDPlayer({ position, rotationY, playing, onToggle }: CDPlayerProps) {
  const discRef    = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((_, delta) => {
    if (discRef.current && playing) {
      discRef.current.rotation.z -= delta * 4.0
    }
  })

  // ── Colours ───────────────────────────────────────────────────────
  const bodyColor   = '#EDE4CE'   // cream (WA palette)
  const trimColor   = '#98B890'   // mint (matches building walls)
  const windowColor = '#2A3040'
  const btnOn       = '#70C878'
  const btnOff      = '#808888'
  const ledOn       = '#50FF80'

  const D = 0.068   // depth from wall

  return (
    <group
      position={position}
      rotation={[0, rotationY, 0]}
      onClick={(e) => { e.stopPropagation(); onToggle() }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true) }}
      onPointerOut={() => setHovered(false)}
    >
      {/* ── Body ── */}
      <mesh>
        <boxGeometry args={[0.28, 0.19, D]} />
        <meshStandardMaterial
          color={bodyColor}
          roughness={0.55}
          emissive={bodyColor}
          emissiveIntensity={hovered ? 0.12 : 0}
        />
      </mesh>

      {/* Top + bottom trim rails (mint) */}
      <mesh position={[0,  0.095, 0]}>
        <boxGeometry args={[0.28, 0.012, D + 0.004]} />
        <meshStandardMaterial color={trimColor} roughness={0.50} />
      </mesh>
      <mesh position={[0, -0.095, 0]}>
        <boxGeometry args={[0.28, 0.012, D + 0.004]} />
        <meshStandardMaterial color={trimColor} roughness={0.50} />
      </mesh>

      {/* ── CD window (dark recessed cover) ── */}
      <mesh position={[-0.055, 0.01, D / 2 + 0.002]}>
        <planeGeometry args={[0.115, 0.115]} />
        <meshStandardMaterial
          color={windowColor}
          roughness={0.08}
          transparent
          opacity={0.82}
        />
      </mesh>

      {/* ── CD disc (spinning when playing) ── */}
      <mesh ref={discRef} position={[-0.055, 0.01, D / 2 + 0.004]}>
        <circleGeometry args={[0.050, 36]} />
        <meshStandardMaterial
          color={playing ? '#BDD4E8' : '#708090'}
          metalness={0.85}
          roughness={0.08}
        />
      </mesh>
      {/* CD centre hole */}
      <mesh position={[-0.055, 0.01, D / 2 + 0.006]}>
        <circleGeometry args={[0.009, 20]} />
        <meshStandardMaterial color="#1A2030" roughness={0.4} />
      </mesh>
      {/* CD rainbow sheen ring */}
      {playing && (
        <mesh position={[-0.055, 0.01, D / 2 + 0.005]}>
          <ringGeometry args={[0.020, 0.048, 36]} />
          <meshStandardMaterial
            color="#D4E8FF"
            metalness={1.0}
            roughness={0.0}
            transparent
            opacity={0.35}
          />
        </mesh>
      )}

      {/* ── Power button ── */}
      <mesh position={[0.095, 0.04, D / 2 + 0.003]}>
        <cylinderGeometry args={[0.016, 0.016, 0.008, 20]} />
        <meshStandardMaterial
          color={playing ? btnOn : btnOff}
          roughness={0.40}
          emissive={playing ? btnOn : '#000'}
          emissiveIntensity={playing ? 0.25 : 0}
        />
      </mesh>
      {/* Power symbol ring */}
      <mesh position={[0.095, 0.04, D / 2 + 0.009]}>
        <torusGeometry args={[0.009, 0.0025, 6, 20, Math.PI * 1.6]} />
        <meshStandardMaterial color={playing ? '#206030' : '#444'} roughness={0.5} />
      </mesh>

      {/* ── LED indicator ── */}
      <mesh position={[0.095, -0.005, D / 2 + 0.004]}>
        <sphereGeometry args={[0.006, 10, 8]} />
        <meshStandardMaterial
          color={playing ? ledOn : '#303030'}
          emissive={playing ? ledOn : '#000'}
          emissiveIntensity={playing ? 3.5 : 0}
          roughness={0.2}
        />
      </mesh>

      {/* ── Speaker grille (right side) ── */}
      {[-0.035, -0.018, -0.001, 0.016, 0.033].map((y, i) => (
        <mesh key={i} position={[0.085, y, D / 2 + 0.002]}>
          <boxGeometry args={[0.048, 0.005, 0.003]} />
          <meshStandardMaterial color="#C8B89A" roughness={0.85} />
        </mesh>
      ))}

      {/* ── Label plate ── */}
      <mesh position={[-0.055, -0.060, D / 2 + 0.002]}>
        <planeGeometry args={[0.110, 0.018]} />
        <meshStandardMaterial color="#B8A880" roughness={0.60} />
      </mesh>

      {/* ── Ambient glow when playing ── */}
      {playing && (
        <pointLight
          position={[0, 0, D / 2 + 0.15]}
          color="#80FFB0"
          intensity={0.5}
          distance={1.4}
        />
      )}

      {/* ── Wall mount plate (behind body) ── */}
      <mesh position={[0, 0, -D / 2 - 0.005]}>
        <boxGeometry args={[0.32, 0.22, 0.012]} />
        <meshStandardMaterial color={trimColor} roughness={0.60} />
      </mesh>
    </group>
  )
}
