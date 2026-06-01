'use client'

import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'

/**
 * Fixes two separate raycasting problems:
 *
 * 1. POINTER LOCKED (desktop FPS mode):
 *    Browser freezes clientX/clientY at the position where lock was acquired.
 *    R3F uses those frozen values → hover and click activate at the wrong mesh
 *    instead of the crosshair centre.
 *    Fix: force NDC (0, 0) = canvas centre when locked.
 *
 * 2. POINTER NOT LOCKED (mobile / cursor mode):
 *    If R3F's default events.compute was never set (or was undefined when we
 *    captured it as `orig`), calling orig() is a no-op → state.pointer is
 *    never updated → raycaster aims at a stale / wrong position.
 *    Fix: always recompute NDC directly from the raw event clientX/clientY,
 *    independent of whatever orig contained.
 *
 * Must live inside <Canvas> so useThree() gets the running store.
 */
export default function PointerLockRaycastFix() {
  const events = useThree((s) => s.events as any)
  const gl     = useThree((s) => s.gl)

  useEffect(() => {
    const orig = events.compute as ((e: Event, s: unknown, p: unknown) => void) | undefined

    events.compute = (event: Event, state: any, prev: unknown) => {
      if (document.pointerLockElement === gl.domElement) {
        // ── Pointer locked (desktop FPS) ────────────────────────────────
        // Force raycast from canvas centre = where the crosshair sits.
        state.pointer.set(0, 0)
        state.raycaster.setFromCamera(state.pointer, state.camera)
      } else {
        // ── Normal / mobile mode ─────────────────────────────────────────
        // Compute NDC directly from the event so we don't depend on orig
        // being defined. This is the reliable path for touch events too.
        const e   = event as PointerEvent
        const rect = gl.domElement.getBoundingClientRect()

        if (rect.width > 0 && rect.height > 0) {
          const x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1
          const y = -((e.clientY - rect.top)  / rect.height) * 2 + 1
          state.pointer.set(x, y)
          state.raycaster.setFromCamera(state.pointer, state.camera)
        } else if (typeof orig === 'function') {
          // rect not available yet — fall back to whatever R3F set up
          orig(event, state, prev)
        }
      }
    }

    return () => { events.compute = orig }
    // events and gl refs are stable for the lifetime of the Canvas
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, gl])

  return null
}
