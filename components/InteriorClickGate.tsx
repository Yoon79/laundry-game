'use client'

import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import type { Intersection } from 'three'

/**
 * While the player stands OUTSIDE the building, interior objects (washing
 * machines, CD player, lost laundry) cannot be clicked or hovered — even
 * through the open doorway or wall planes that fail to occlude the ray.
 *
 * This hooks R3F's events.filter, so it covers the whole R3F pointer pipeline
 * (desktop mouse clicks + hover). Mobile taps go through MobileTapPick, which
 * applies the same FACADE_Z rule on its own raycast.
 *
 * Must live inside <Canvas>.
 */

// Building facade plane — matches FACADE_Z in FPSMovement / MobileTapPick.
const FACADE_Z = 5.5

export default function InteriorClickGate() {
  const events = useThree((s) => s.events)
  const camera = useThree((s) => s.camera)

  useEffect(() => {
    const prev = events.filter
    events.filter = (hits: Intersection[]) =>
      camera.position.z > FACADE_Z
        ? hits.filter((h) => h.point.z >= FACADE_Z)
        : hits
    return () => { events.filter = prev }
  }, [events, camera])

  return null
}
