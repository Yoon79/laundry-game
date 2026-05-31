'use client'

import { useEffect, useRef } from 'react'
import { touchState } from '@/lib/touchState'

// Joystick geometry (px)
const BASE_R = 56   // base circle radius
const KNOB_R = 24   // inner knob radius

interface Props { active: boolean }

export default function MobileControls({ active }: Props) {
  const knobRef  = useRef<HTMLDivElement>(null)
  const baseRef  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!active) return

    let joystickTouchId = -1
    let lookTouchId     = -1
    let lastLookX = 0
    let lastLookY = 0

    const getBaseCenter = () => {
      const r = baseRef.current?.getBoundingClientRect()
      return r
        ? { x: r.left + r.width / 2, y: r.top + r.height / 2 }
        : { x: BASE_R + 24, y: window.innerHeight - BASE_R - 36 }
    }

    const handleStart = (e: TouchEvent) => {
      // Do NOT call preventDefault here — browser must be allowed to generate
      // pointer events so R3F can raycast 3D mesh clicks (washing machines,
      // CD player, bench, guestbook board, etc.)
      for (const t of Array.from(e.changedTouches)) {
        const isLeft = t.clientX < window.innerWidth * 0.45
        if (isLeft && joystickTouchId === -1) {
          joystickTouchId = t.identifier
        } else if (!isLeft && lookTouchId === -1) {
          lookTouchId = t.identifier
          lastLookX   = t.clientX
          lastLookY   = t.clientY
        }
      }
    }

    const handleMove = (e: TouchEvent) => {
      e.preventDefault()
      const center = getBaseCenter()

      for (const t of Array.from(e.changedTouches)) {
        // ── Joystick ──
        if (t.identifier === joystickTouchId) {
          const dx   = t.clientX - center.x
          const dy   = t.clientY - center.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const clamped = Math.min(dist, BASE_R)
          const angle   = Math.atan2(dy, dx)
          const nx = (Math.cos(angle) * clamped) / BASE_R
          const ny = (Math.sin(angle) * clamped) / BASE_R

          touchState.joystick.x = nx
          touchState.joystick.y = ny

          if (knobRef.current) {
            knobRef.current.style.transform =
              `translate(${nx * BASE_R}px, ${ny * BASE_R}px)`
          }
        }

        // ── Camera look ──
        if (t.identifier === lookTouchId) {
          touchState.lookDelta.x += (t.clientX - lastLookX) * 0.0045
          touchState.lookDelta.y += (t.clientY - lastLookY) * 0.0045
          lastLookX = t.clientX
          lastLookY = t.clientY
        }
      }
    }

    const handleEnd = (e: TouchEvent) => {
      for (const t of Array.from(e.changedTouches)) {
        if (t.identifier === joystickTouchId) {
          joystickTouchId      = -1
          touchState.joystick.x = 0
          touchState.joystick.y = 0
          if (knobRef.current) {
            knobRef.current.style.transform = 'translate(0px, 0px)'
          }
        }
        if (t.identifier === lookTouchId) {
          lookTouchId = -1
        }
      }
    }

    // touchstart/end: passive=true (no preventDefault, so pointer events fire)
    // touchmove:      passive=false (need preventDefault to block scroll)
    document.addEventListener('touchstart',  handleStart, { passive: true })
    document.addEventListener('touchmove',   handleMove,  { passive: false })
    document.addEventListener('touchend',    handleEnd,   { passive: true })
    document.addEventListener('touchcancel', handleEnd,   { passive: true })

    return () => {
      document.removeEventListener('touchstart',  handleStart)
      document.removeEventListener('touchmove',   handleMove)
      document.removeEventListener('touchend',    handleEnd)
      document.removeEventListener('touchcancel', handleEnd)
      touchState.joystick.x = 0
      touchState.joystick.y = 0
    }
  }, [active])

  if (!active) return null

  const base: React.CSSProperties = {
    position: 'fixed',
    left: 24,
    bottom: 36,
    width:  BASE_R * 2,
    height: BASE_R * 2,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.10)',
    border: '1.5px solid rgba(255,255,255,0.28)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    pointerEvents: 'none',
    touchAction: 'none',
  }
  const knob: React.CSSProperties = {
    width:  KNOB_R * 2,
    height: KNOB_R * 2,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.38)',
    border: '1px solid rgba(255,255,255,0.55)',
    willChange: 'transform',
    transition: 'transform 0.04s',
  }

  return (
    <>
      {/* Left joystick */}
      <div ref={baseRef} style={base}>
        <div ref={knobRef} style={knob} />
      </div>

      {/* Right drag-zone hint */}
      <div
        style={{
          position: 'fixed',
          right: 20,
          bottom: 40,
          fontSize: 9,
          letterSpacing: '0.16em',
          color: 'rgba(255,255,255,0.22)',
          fontFamily: "'Mona12', sans-serif",
          pointerEvents: 'none',
          zIndex: 20,
          textTransform: 'uppercase',
        }}
      >
        drag to look
      </div>
    </>
  )
}
