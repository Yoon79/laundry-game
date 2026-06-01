'use client'

import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ── CD disc canvas texture ────────────────────────────────────────────────────
// Drawn once: label area with off-centre marking makes rotation clearly visible.

function makeCDTexture(): THREE.CanvasTexture {
  const S = 256, cx = S / 2, cy = S / 2
  const c = document.createElement('canvas'); c.width = S; c.height = S
  const ctx = c.getContext('2d')!

  // Metallic silver-rainbow base
  const base = ctx.createRadialGradient(cx, cy, 8, cx, cy, S / 2 - 2)
  base.addColorStop(0.00, '#C0D0E0')
  base.addColorStop(0.16, '#E0EEF0')
  base.addColorStop(0.28, '#D0E8C8')
  base.addColorStop(0.42, '#EED0D8')
  base.addColorStop(0.58, '#C8C8F0')
  base.addColorStop(0.74, '#E8F0D0')
  base.addColorStop(0.90, '#D8C8E0')
  base.addColorStop(1.00, '#C0C8D0')
  ctx.fillStyle = base
  ctx.beginPath(); ctx.arc(cx, cy, S / 2 - 2, 0, Math.PI * 2); ctx.fill()

  // Fine concentric tracks
  for (let r = 22; r < S / 2 - 4; r += 3.5) {
    const alpha = 0.04 + 0.04 * Math.sin(r * 0.4)
    ctx.strokeStyle = `rgba(60,80,100,${alpha.toFixed(3)})`
    ctx.lineWidth = 0.8
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke()
  }

  // Coloured label disc (makes rotation obvious)
  const labelGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 21)
  labelGrad.addColorStop(0, '#6880A8')
  labelGrad.addColorStop(1, '#4A6090')
  ctx.fillStyle = labelGrad
  ctx.beginPath(); ctx.arc(cx, cy, 21, 0, Math.PI * 2); ctx.fill()

  // Label markings — asymmetric so spin is unmistakeable
  ctx.fillStyle = 'rgba(255,255,255,0.45)'
  ctx.fillRect(cx - 11, cy - 1.5, 22, 3)       // horizontal bar
  ctx.fillStyle = 'rgba(255,255,255,0.60)'
  ctx.beginPath(); ctx.arc(cx + 9, cy + 9, 3.5, 0, Math.PI * 2); ctx.fill()  // dot

  // Centre hole (punch out)
  ctx.globalCompositeOperation = 'destination-out'
  ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill()
  ctx.globalCompositeOperation = 'source-over'

  return new THREE.CanvasTexture(c)
}

// ── Component ─────────────────────────────────────────────────────────────────

interface CDPlayerProps {
  position: [number, number, number]
  rotationY: number
  playing: boolean
  onToggle: () => void
}

export default function CDPlayer({ position, rotationY, playing, onToggle }: CDPlayerProps) {
  const discRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const cdTex = useMemo(() => makeCDTexture(), [])

  useFrame((_, delta) => {
    if (discRef.current && playing) {
      discRef.current.rotation.z -= delta * 5.0   // ~5 rad/s ≈ 0.8 rev/s
    }
  })

  const D       = 0.068
  const bodyCol = '#EDE4CE'
  const trimCol = '#98B890'
  const btnOn   = '#70C878'
  const btnOff  = '#808888'

  return (
    <group
      position={position}
      rotation={[0, rotationY, 0]}
      onClick={(e) => { e.stopPropagation(); onToggle() }}
      onPointerOver={(e) => { e.stopPropagation(); if (document.pointerLockElement) setHovered(true) }}
      onPointerOut={() => setHovered(false)}
    >
      {/* Body */}
      <mesh>
        <boxGeometry args={[0.28, 0.19, D]} />
        <meshStandardMaterial
          color={bodyCol}
          roughness={0.55}
          emissive={bodyCol}
          emissiveIntensity={hovered ? 0.12 : 0}
        />
      </mesh>

      {/* Trim rails */}
      {([0.095, -0.095] as number[]).map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <boxGeometry args={[0.28, 0.012, D + 0.004]} />
          <meshStandardMaterial color={trimCol} roughness={0.50} />
        </mesh>
      ))}

      {/* CD window (dark cover glass) */}
      <mesh position={[-0.055, 0.01, D / 2 + 0.002]}>
        <planeGeometry args={[0.115, 0.115]} />
        <meshStandardMaterial color="#1E2830" roughness={0.06} transparent opacity={0.80} />
      </mesh>

      {/* Spinning disc group */}
      <group ref={discRef} position={[-0.055, 0.01, D / 2 + 0.005]}>
        <mesh>
          <circleGeometry args={[0.051, 48]} />
          <meshStandardMaterial
            map={cdTex}
            metalness={0.90}
            roughness={0.05}
          />
        </mesh>
      </group>

      {/* Power button */}
      <mesh position={[0.095, 0.04, D / 2 + 0.003]}>
        <cylinderGeometry args={[0.016, 0.016, 0.008, 20]} />
        <meshStandardMaterial
          color={playing ? btnOn : btnOff}
          roughness={0.40}
          emissive={playing ? btnOn : '#000'}
          emissiveIntensity={playing ? 0.25 : 0}
        />
      </mesh>

      {/* LED */}
      <mesh position={[0.095, -0.005, D / 2 + 0.004]}>
        <sphereGeometry args={[0.006, 10, 8]} />
        <meshStandardMaterial
          color={playing ? '#50FF80' : '#303030'}
          emissive={playing ? '#50FF80' : '#000'}
          emissiveIntensity={playing ? 3.5 : 0}
          roughness={0.2}
        />
      </mesh>

      {/* Speaker grille */}
      {[-0.035, -0.018, -0.001, 0.016, 0.033].map((y, i) => (
        <mesh key={i} position={[0.085, y, D / 2 + 0.002]}>
          <boxGeometry args={[0.048, 0.005, 0.003]} />
          <meshStandardMaterial color="#C8B89A" roughness={0.85} />
        </mesh>
      ))}

      {/* Label plate */}
      <mesh position={[-0.055, -0.060, D / 2 + 0.002]}>
        <planeGeometry args={[0.110, 0.018]} />
        <meshStandardMaterial color="#B8A880" roughness={0.60} />
      </mesh>

      {/* Ambient glow — half the original intensity */}
      {playing && (
        <pointLight position={[0, 0, D / 2 + 0.15]} color="#80FFB0" intensity={0.1} distance={1.4} />
      )}

      {/* Wall mount plate */}
      <mesh position={[0, 0, -D / 2 - 0.005]}>
        <boxGeometry args={[0.32, 0.22, 0.012]} />
        <meshStandardMaterial color={trimCol} roughness={0.60} />
      </mesh>
    </group>
  )
}
