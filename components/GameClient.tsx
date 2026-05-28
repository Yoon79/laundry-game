'use client'

import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PointerLockControls } from '@react-three/drei'
import * as THREE from 'three'
import FPSMovement from './FPSMovement'
import LaundryRoom from './LaundryRoom'
import ClothesRoom from './ClothesRoom'
import Exterior from './Exterior'
import Splash from './Splash'
import HUD from './HUD'

export default function GameClient() {
  const [entered, setEntered] = useState(false)
  const [locked, setLocked] = useState(false)

  return (
    <div className="relative w-full h-full">
      {!entered && <Splash onEnter={() => setEntered(true)} />}
      {entered && <HUD locked={locked} />}

      <Canvas
        camera={{ position: [0, 3, 9], fov: 80, near: 0.05, far: 70 }}
        shadows
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
        style={{ background: '#FAF0E6' }}
      >
        <FPSMovement active={locked} />
        <Exterior />
        <LaundryRoom />
        <ClothesRoom />

        {/* Mount PointerLockControls only after the user enters */}
        {entered && (
          <PointerLockControls
            onLock={() => setLocked(true)}
            onUnlock={() => setLocked(false)}
          />
        )}
      </Canvas>
    </div>
  )
}
