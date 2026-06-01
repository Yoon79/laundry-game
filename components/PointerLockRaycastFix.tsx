'use client'

import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'

/**
 * When pointer is locked the browser freezes clientX/clientY at the position
 * where lock was acquired.  R3F uses those values for raycasting, so hover and
 * click targets end up at the wrong place instead of the crosshair centre.
 *
 * This component overrides R3F's internal `events.compute` (called on every
 * pointermove / pointerdown) to force NDC (0, 0) = canvas centre when locked.
 * Must live inside <Canvas> so `useThree` gets the running store.
 */
export default function PointerLockRaycastFix() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const events  = useThree((s) => s.events as any)
  const camera  = useThree((s) => s.camera)
  const pointer = useThree((s) => s.pointer)
  const raycaster = useThree((s) => s.raycaster)
  const gl      = useThree((s) => s.gl)

  useEffect(() => {
    // Save whatever compute function R3F set up
    const orig = events.compute as ((e: Event, s: unknown, p: unknown) => void) | undefined

    events.compute = (event: Event, state: any, prev: unknown) => {
      if (document.pointerLockElement === gl.domElement) {
        // Pointer locked → always raycast from canvas centre = crosshair
        state.pointer.set(0, 0)
        state.raycaster.setFromCamera(state.pointer, state.camera)
      } else if (typeof orig === 'function') {
        // Normal mode → use default coordinate calculation
        orig(event, state, prev)
      }
    }

    return () => {
      events.compute = orig
    }
    // `events` object reference is stable; camera/pointer/raycaster/gl are refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, gl])

  return null
}
