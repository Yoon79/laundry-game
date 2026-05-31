'use client'

import { useState, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { PointerLockControls } from '@react-three/drei'
import * as THREE from 'three'
import FPSMovement from './FPSMovement'
import LaundryRoom from './LaundryRoom'
import ClothesRoom from './ClothesRoom'
import Exterior from './Exterior'
import LostLaundry, { LOST_ITEMS } from './LostLaundry'
import type { LostItem } from './LostLaundry'
import Splash from './Splash'
import HUD from './HUD'
import AlbumPanel from './AlbumPanel'
import { LaundryRoomFrames, ClothesRoomFrames } from './WallFrames'
import BehindPhoto from './BehindPhoto'
import ALBUMS from '@/lib/albums'

export default function GameClient() {
  const [entered, setEntered] = useState(false)
  const [locked, setLocked] = useState(false)
  const [muted, setMuted]   = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // ── Background music — starts on enter, fades in ──────────────────
  useEffect(() => {
    if (!entered) return

    const audio = new Audio('/music/bgm.mp3')
    audio.loop   = true
    audio.volume = 0
    audioRef.current = audio

    audio.play().catch(() => {
      // File not present or autoplay blocked — fail silently
    })

    // Fade in over ~3 seconds
    let vol = 0
    const timer = setInterval(() => {
      vol = Math.min(0.55, vol + 0.01)
      if (audioRef.current) audioRef.current.volume = vol
      if (vol >= 0.55) clearInterval(timer)
    }, 55)

    return () => {
      clearInterval(timer)
      audio.pause()
      audio.src = ''
    }
  }, [entered])

  // Sync mute state to audio element
  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted
  }, [muted])

  // ── Album panel ───────────────────────────────────────────────────
  const [selectedAlbumId, setSelectedAlbumId] = useState<number | null>(null)

  // ── Lost laundry game ─────────────────────────────────────────────
  const [carriedItem, setCarriedItem]   = useState<LostItem | null>(null)
  const [pickedUpIds, setPickedUpIds]   = useState<Set<number>>(new Set())
  const [behindItem,  setBehindItem]    = useState<LostItem | null>(null)

  // Exit pointer lock when UI panels open
  useEffect(() => {
    if (selectedAlbumId !== null || behindItem !== null) {
      document.exitPointerLock()
    }
  }, [selectedAlbumId, behindItem])

  const handleSelectAlbum = (id: number) => {
    if (carriedItem) return   // can't open album panel while carrying laundry
    setSelectedAlbumId(id)
  }

  // Pickup a lost laundry item
  const handlePickup = (item: LostItem) => {
    setCarriedItem(item)
    setPickedUpIds(prev => new Set(prev).add(item.id))
  }

  // Deliver to the correct machine
  const handleDeliver = (albumId: number) => {
    if (!carriedItem || carriedItem.albumId !== albumId) return
    setBehindItem(carriedItem)
    setCarriedItem(null)
  }

  const closeBehindPhoto = () => setBehindItem(null)
  const closeAlbumPanel  = () => setSelectedAlbumId(null)

  const selectedAlbum = selectedAlbumId !== null ? (ALBUMS[selectedAlbumId] ?? null) : null
  const totalFound = pickedUpIds.size

  return (
    <div className="relative w-full h-full">
      {/* ── Splash ── */}
      {!entered && <Splash onEnter={() => setEntered(true)} />}

      {/* ── HUD ── */}
      {entered && !selectedAlbum && !behindItem && <HUD locked={locked} />}

      {/* ── Hint bar ── */}
      {entered && !locked && !selectedAlbum && !behindItem && !carriedItem && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-10 text-center text-[10px] tracking-[0.18em] uppercase"
          style={{ color: 'rgba(255,255,255,0.50)', fontFamily: 'var(--font-space-mono)' }}
        >
          세탁기 클릭 → 앨범 보기 &nbsp;·&nbsp; 옷방 바닥의 빛나는 세탁물을 찾아보세요
        </div>
      )}

      {/* ── Carrying indicator (HUD) ── */}
      {entered && carriedItem && (
        <div
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none"
          style={{ fontFamily: 'var(--font-space-mono)' }}
        >
          {/* Crosshair + carried item glow */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-4 h-4 rounded-full border-2"
            style={{ borderColor: carriedItem.color, boxShadow: `0 0 8px ${carriedItem.color}` }}
          />
        </div>
      )}

      {/* Carrying laundry — floating badge bottom-center */}
      {entered && carriedItem && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-4 py-2"
          style={{
            background: 'rgba(20,12,6,0.75)',
            border: `1px solid ${carriedItem.color}`,
            fontFamily: 'var(--font-space-mono)',
            color: carriedItem.color,
            fontSize: 11,
            letterSpacing: '0.14em',
            backdropFilter: 'blur(4px)',
          }}
        >
          <span
            className="w-3 h-3 rounded-full inline-block animate-pulse"
            style={{ background: carriedItem.color }}
          />
          &nbsp;세탁물을 들고 있어요&nbsp;·&nbsp;
          <span style={{ color: '#F0E8DC' }}>같은 색 세탁기</span>를 찾으세요
        </div>
      )}

      {/* ── Music toggle (top-left) ── */}
      {entered && (
        <button
          onClick={() => setMuted(m => !m)}
          className="fixed top-4 left-4 z-10 w-8 h-8 flex items-center justify-center rounded-full"
          style={{
            background: 'rgba(20,12,6,0.50)',
            border: '1px solid rgba(255,255,255,0.20)',
            color: muted ? 'rgba(255,255,255,0.30)' : 'rgba(255,255,255,0.75)',
            fontSize: 14,
            backdropFilter: 'blur(4px)',
            fontFamily: 'sans-serif',
            lineHeight: 1,
          }}
          title={muted ? '음악 켜기' : '음악 끄기'}
          aria-label={muted ? '음악 켜기' : '음악 끄기'}
        >
          {muted ? '🔇' : '♪'}
        </button>
      )}

      {/* ── Found counter (top-right) ── */}
      {entered && totalFound > 0 && !behindItem && (
        <div
          className="fixed top-4 right-4 z-10 text-[10px] tracking-widest uppercase"
          style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-space-mono)' }}
        >
          🧺 {totalFound} / {LOST_ITEMS.length}
        </div>
      )}

      {/* ── Album panel ── */}
      {selectedAlbum && <AlbumPanel album={selectedAlbum} onClose={closeAlbumPanel} />}

      {/* ── Behind-the-scenes photo ── */}
      {behindItem && <BehindPhoto item={behindItem} onClose={closeBehindPhoto} />}

      {/* ── 3D Canvas ── */}
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
        <LaundryRoom
          onSelectAlbum={handleSelectAlbum}
          deliveryTargetAlbumId={carriedItem?.albumId ?? null}
          onDeliverLaundry={handleDeliver}
        />
        <ClothesRoom />
        <LostLaundry pickedUpIds={pickedUpIds} onPickup={handlePickup} />
        <LaundryRoomFrames />
        <ClothesRoomFrames />

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
