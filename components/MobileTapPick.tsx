'use client'

import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Reliable 3D object tapping for touch devices.
 *
 * On iOS WebKit (every iPhone browser), R3F's pointer/click pipeline does not
 * reliably deliver taps to 3D meshes (MobileControls' preventDefault on
 * touchmove suppresses the synthesized click R3F listens for). So we detect a
 * clean tap on the canvas ourselves and raycast directly.
 *
 * Occlusion: we raycast the WHOLE scene and only act on the CLOSEST hit. If the
 * nearest surface is a wall/floor (no event handler), the tap is ignored — this
 * stops taps from "passing through" walls to machines behind them. Only when the
 * frontmost surface is an interactive object do we invoke its onClick.
 *
 * Must live INSIDE <Canvas> so useThree() returns the running store.
 */

const TAP_MAX_MOVE_PX = 12     // finger may jitter this much and still be a tap
const TAP_MAX_MS      = 500    // longer press = not a tap
const DEDUPE_MS       = 450    // ignore a second pick fired within this window
const JOYSTICK_ZONE_PX = 150   // bottom-left square reserved for the move joystick

// Building facade plane (matches FACADE_Z in FPSMovement / ROOM_FRONT in
// LaundryRoom). Interior objects live at z < FACADE_Z, exterior ones beyond.
// The exterior walls are FrontSide planes facing inward, so rays cast from
// OUTSIDE pass through their back faces and would otherwise reach the
// machines inside — we gate on position instead of relying on wall occlusion.
const FACADE_Z = 5.5

interface Props {
  enabled: boolean
}

interface R3FInstance {
  eventCount?: number
  handlers?: {
    onClick?: (event: { stopPropagation: () => void; object: THREE.Object3D }) => void
  }
}

export default function MobileTapPick({ enabled }: Props) {
  const camera    = useThree((s) => s.camera)
  const gl        = useThree((s) => s.gl)
  const raycaster = useThree((s) => s.raycaster)
  const scene     = useThree((s) => s.scene)

  useEffect(() => {
    if (!enabled) return
    const el = gl.domElement

    let startX = 0
    let startY = 0
    let startT = 0
    let moved  = false
    let multi  = false
    let lastPickAt = 0

    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) { multi = true; return }
      multi = false
      moved = false
      const t = e.touches[0]
      startX = t.clientX
      startY = t.clientY
      startT = Date.now()
    }

    const onMove = (e: TouchEvent) => {
      if (multi) return
      const t = e.touches[0]
      if (!t) return
      if (Math.hypot(t.clientX - startX, t.clientY - startY) > TAP_MAX_MOVE_PX) moved = true
    }

    const onEnd = (e: TouchEvent) => {
      if (multi || moved) return
      if (Date.now() - startT > TAP_MAX_MS) return

      const t = e.changedTouches[0]
      const px = t ? t.clientX : startX
      const py = t ? t.clientY : startY

      const now = Date.now()
      if (now - lastPickAt < DEDUPE_MS) return

      // Ignore taps over the on-screen movement joystick (bottom-left corner).
      if (px < JOYSTICK_ZONE_PX && py > window.innerHeight - JOYSTICK_ZONE_PX) return

      const rect = el.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return

      const ndc = new THREE.Vector2(
        ((px - rect.left) / rect.width) * 2 - 1,
        -((py - rect.top) / rect.height) * 2 + 1,
      )
      raycaster.setFromCamera(ndc, camera)

      // Raycast the whole scene so opaque geometry (walls, floor) occludes
      // interactive objects behind it. The nearest hit is what the user sees.
      const hits = raycaster.intersectObjects(scene.children, true)
      if (!hits.length) return

      // Outside the building, interior objects are untouchable — even where a
      // FrontSide wall plane fails to occlude the ray from its back face.
      if (camera.position.z > FACADE_Z && hits[0].point.z < FACADE_Z) return

      // Only fire if the frontmost surface is (or belongs to) an interactive
      // object. If it is a plain wall/decor mesh, the tap is blocked.
      let obj: THREE.Object3D | null = hits[0].object
      while (obj) {
        const r3f = (obj as THREE.Object3D & { __r3f?: R3FInstance }).__r3f
        if (r3f?.eventCount && r3f.handlers?.onClick) {
          lastPickAt = now
          r3f.handlers.onClick({ stopPropagation() {}, object: hits[0].object })
          return
        }
        obj = obj.parent
      }
      // Frontmost surface has no handler → occluded, ignore the tap.
    }

    el.addEventListener('touchstart', onStart, { passive: true })
    el.addEventListener('touchmove',  onMove,  { passive: true })
    el.addEventListener('touchend',   onEnd,   { passive: true })

    return () => {
      el.removeEventListener('touchstart', onStart)
      el.removeEventListener('touchmove',  onMove)
      el.removeEventListener('touchend',   onEnd)
    }
  }, [enabled, camera, gl, raycaster, scene])

  return null
}
