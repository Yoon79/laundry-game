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
import MobileControls from './MobileControls'
import OrientationGuard from './OrientationGuard'
import ALBUMS from '@/lib/albums'
import type { GuestbookEntry } from '@/lib/guestbook'
import GuestbookModal from './GuestbookModal'
import GuestbookWall from './GuestbookWall'
import ShareModal from './ShareModal'
import CDPlayer from './CDPlayer'
import SpatialAudioUpdater from './SpatialAudioUpdater'
import { initSpatialAudio } from '@/lib/spatialAudio'

export default function GameClient() {
  const [entered, setEntered] = useState(false)
  const [locked, setLocked]   = useState(false)
  const [muted, setMuted]     = useState(false)
  const [isMobile, setIsMobile]   = useState(false)
  const [cdPlaying, setCdPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Detect mobile once on mount
  useEffect(() => {
    setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

  // On mobile, FPS is always active after entering (no pointer lock step)
  const fpsActive = isMobile ? entered : locked

  // ── Create audio element once on entry (no auto-play) ────────────
  useEffect(() => {
    if (!entered) return
    const audio = new Audio('/music/bgm.mp3')
    audio.loop = true
    audio.volume = 1.0   // volume handled by Web Audio panner
    audioRef.current = audio
    return () => { audio.pause(); audio.src = '' }
  }, [entered])

  // Sync mute state
  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted
  }, [muted])

  // ── CD player toggle — instant play/stop, spatial audio ──────────
  const handleCDToggle = () => {
    const audio = audioRef.current
    if (!audio) return
    if (!cdPlaying) {
      // Initialise Web Audio panner (safe to call multiple times)
      initSpatialAudio(audio)
      audio.play().catch(() => {})
    } else {
      audio.pause()
    }
    setCdPlaying(p => !p)
  }

  // ── Album panel ───────────────────────────────────────────────────
  const [selectedAlbumId, setSelectedAlbumId] = useState<number | null>(null)

  // ── Guestbook ─────────────────────────────────────────────────────
  const [sittingMode, setSittingMode]           = useState(false)
  const [showGuestbookInput, setShowGuestbookInput] = useState(false)
  const [guestbookEntries, setGuestbookEntries] = useState<GuestbookEntry[]>(() => {
    if (typeof window === 'undefined') return []
    try { return JSON.parse(localStorage.getItem('sweden-laundry-guestbook') ?? '[]') } catch { return [] }
  })
  const [shareEntry, setShareEntry]             = useState<GuestbookEntry | null>(null)

  // Persist entries to localStorage
  useEffect(() => {
    localStorage.setItem('sweden-laundry-guestbook', JSON.stringify(guestbookEntries))
  }, [guestbookEntries])

  // Bench click → immediately sit; keep pointer lock so user can look around
  const handleBenchClick = () => {
    setSittingMode(true)
  }
  const handleStandUp = () => {
    setSittingMode(false)
  }

  // 'E' key stands up while sitting
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'KeyE' && sittingMode) handleStandUp()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sittingMode])

  // Board (easel cork) click → open guestbook input
  const handleBoardClick = () => {
    document.exitPointerLock()
    setShowGuestbookInput(true)
  }

  const handleGuestbookSubmit = (text: string) => {
    const entry: GuestbookEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      text,
      timestamp: Date.now(),
    }
    setGuestbookEntries(prev => [entry, ...prev])
    setShowGuestbookInput(false)
  }

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

      {/* ── Mobile controls ── */}
      <MobileControls active={isMobile && entered && !selectedAlbum && !behindItem} />

      {/* ── Hint bar (desktop only) ── */}
      {entered && !isMobile && !locked && !selectedAlbum && !behindItem && !carriedItem && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-10 text-center text-[10px] tracking-[0.18em] uppercase"
          style={{ color: 'rgba(255,255,255,0.50)', fontFamily: "'Mona12', sans-serif" }}
        >
          세탁기 클릭 → 앨범 보기 &nbsp;·&nbsp; 옷방 바닥의 빛나는 세탁물을 찾아보세요
        </div>
      )}
      {/* ── Hint bar (mobile) ── */}
      {entered && isMobile && !selectedAlbum && !behindItem && !carriedItem && (
        <div
          className="fixed bottom-[130px] left-1/2 -translate-x-1/2 z-10 text-center text-[10px] tracking-[0.16em] uppercase"
          style={{ color: 'rgba(255,255,255,0.45)', fontFamily: "'Mona12', sans-serif" }}
        >
          세탁기 탭 → 앨범 보기
        </div>
      )}

      {/* ── Carrying indicator (HUD) ── */}
      {entered && carriedItem && (
        <div
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none"
          style={{ fontFamily: "'Mona12', sans-serif" }}
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
            fontFamily: "'Mona12', sans-serif",
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

      {/* ── Music toggle (top-left, only when CD is on) ── */}
      {entered && cdPlaying && (
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
          style={{ color: 'rgba(255,255,255,0.45)', fontFamily: "'Mona12', sans-serif" }}
        >
          🧺 {totalFound} / {LOST_ITEMS.length}
        </div>
      )}

      {/* ── 앉아있을 때: 일어나기 버튼 + E 키 힌트 ── */}
      {sittingMode && !selectedAlbum && !behindItem && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
          <button
            onClick={handleStandUp}
            className="px-8 py-3 text-[12px] tracking-[0.18em] uppercase"
            style={{
              background: '#FAF0E6',
              color: '#3A1808',
              fontFamily: "'Mona12', sans-serif",
              border: 'none',
              boxShadow: '0 6px 24px rgba(0,0,0,0.45)',
            }}
          >
            🚶 일어나기
          </button>
          {locked && (
            <p
              className="text-[9px] tracking-[0.20em] uppercase"
              style={{ color: 'rgba(255,255,255,0.42)', fontFamily: "'Mona12', sans-serif" }}
            >
              E 키로 일어나기 · ESC 후 버튼 클릭
            </p>
          )}
        </div>
      )}

      {/* ── Guestbook input modal ── */}
      {showGuestbookInput && (
        <GuestbookModal
          onSubmit={handleGuestbookSubmit}
          onClose={() => setShowGuestbookInput(false)}
        />
      )}

      {/* ── Share modal ── */}
      {shareEntry && (
        <ShareModal entry={shareEntry} onClose={() => setShareEntry(null)} />
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
        style={{ background: '#68A8D8', touchAction: 'none' }}
      >
        <FPSMovement active={fpsActive} isMobile={isMobile} sitting={sittingMode} />
        <SpatialAudioUpdater />
        <Exterior onBenchClick={handleBenchClick} />
        <GuestbookWall
          entries={guestbookEntries}
          onSelectEntry={setShareEntry}
          onClickBoard={handleBoardClick}
        />
        <LaundryRoom
          onSelectAlbum={handleSelectAlbum}
          deliveryTargetAlbumId={carriedItem?.albumId ?? null}
          onDeliverLaundry={handleDeliver}
        />
        <ClothesRoom />
        <LostLaundry pickedUpIds={pickedUpIds} onPickup={handlePickup} />

        {/* CD player — right wall of laundry room, at eye level */}
        <CDPlayer
          position={[1.97, 1.78, 2.2]}
          rotationY={-Math.PI / 2}
          playing={cdPlaying}
          onToggle={handleCDToggle}
        />
        <LaundryRoomFrames />
        <ClothesRoomFrames />

        {/* PointerLockControls — desktop only */}
        {entered && !isMobile && (
          <PointerLockControls
            onLock={() => setLocked(true)}
            onUnlock={() => setLocked(false)}
          />
        )}
      </Canvas>
    </div>
  )
}
