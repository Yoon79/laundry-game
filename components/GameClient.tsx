'use client'

import { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { PointerLockControls } from '@react-three/drei'
import * as THREE from 'three'
import FPSMovement from './FPSMovement'
import LaundryRoom from './LaundryRoom'
import ClothesRoom from './ClothesRoom'
import Exterior from './Exterior'
import Splash from './Splash'
import HUD from './HUD'
import AlbumPanel from './AlbumPanel'
import ALBUMS from '@/lib/albums'

export default function GameClient() {
  const [entered, setEntered] = useState(false)
  const [locked, setLocked] = useState(false)
  const [selectedAlbumId, setSelectedAlbumId] = useState<number | null>(null)

  // Exit pointer lock when an album is selected
  useEffect(() => {
    if (selectedAlbumId !== null) {
      document.exitPointerLock()
    }
  }, [selectedAlbumId])

  const handleSelectAlbum = (id: number) => {
    setSelectedAlbumId(id)
  }

  const handleCloseAlbum = () => {
    setSelectedAlbumId(null)
  }

  const selectedAlbum = selectedAlbumId !== null ? ALBUMS[selectedAlbumId] ?? null : null

  return (
    <div className="relative w-full h-full">
      {!entered && <Splash onEnter={() => setEntered(true)} />}
      {entered && !selectedAlbum && <HUD locked={locked} />}
      {entered && !locked && !selectedAlbum && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-10 text-center text-[10px] tracking-[0.18em] uppercase"
          style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--font-space-mono)' }}
        >
          세탁기를 클릭하면 앨범을 볼 수 있어요
        </div>
      )}

      {selectedAlbum && (
        <AlbumPanel album={selectedAlbum} onClose={handleCloseAlbum} />
      )}

      <Canvas
        camera={{ position: [0, 4.5, 12], fov: 75, near: 0.05, far: 70 }}
        shadows
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
        style={{ background: '#68A8D8' }}
      >
        <FPSMovement active={locked} />
        <Exterior />
        <LaundryRoom onSelectAlbum={handleSelectAlbum} />
        <ClothesRoom />

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
