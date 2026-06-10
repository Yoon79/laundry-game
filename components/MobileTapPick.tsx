'use client'

import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Reliable 3D object tapping for touch devices.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Why this exists
 *
 * On iOS WebKit (every iPhone browser, including "Chrome"), R3F's pointer/
 * click pipeline does NOT reliably deliver taps to 3D meshes:
 *   - The document-level touch handlers in MobileControls call preventDefault
 *     on touchmove, which suppresses the synthesized DOM `click` that R3F
 *     listens for.
 *   - R3F gates onClick behind a matching pointerdown raycast; if anything
 *     interferes with that pairing the click silently never dispatches.
 * Net effect: tapping a washing machine / guestbook does nothing.
 *
 * The fix: bypass the DOM event pipeline entirely. We listen to `touchend`
 * on the canvas, and on a clean tap we raycast ourselves (the exact same math
 * R3F uses) against the objects that carry event handlers, then invoke their
 * onClick directly. This depends only on the camera + raycaster — which
 * already work on desktop — so it is immune to the iOS event quirks above.
 *
 * Must live INSIDE <Canvas> so useThree() returns the running store.
 */

const TAP_MAX_MOVE_PX = 12     // finger may jitter this much and still be a tap
const TAP_MAX_MS      = 500    // longer press = not a tap
const DEDUPE_MS       = 450    // ignore a second pick fired within this window

interface Props {
  enabled: boolean
  onDebug?: (msg: string) => void
}

// Minimal R3F-handler shape we read off picked objects.
interface R3FInstance {
  eventCount?: number
  handlers?: {
    onClick?: (event: { stopPropagation: () => void; object: THREE.Object3D }) => void
  }
}

export default function MobileTapPick({ enabled, onDebug }: Props) {
  const camera    = useThree((s) => s.camera)
  const gl        = useThree((s) => s.gl)
  const raycaster = useThree((s) => s.raycaster)
  const scene     = useThree((s) => s.scene)
  const internal  = useThree((s) => s.internal as unknown as { interaction?: THREE.Object3D[] })

  useEffect(() => {
    const dbg = (m: string) => onDebug?.(m)
    if (!enabled) { dbg('disabled (not mobile / overlay open)'); return }
    const el = gl.domElement
    dbg('ready — tap a machine')

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
      const dt = Date.now() - startT
      if (multi || moved) { dbg(`end: skip (multi=${multi} moved=${moved})`); return }
      if (dt > TAP_MAX_MS) { dbg(`end: skip (too long ${dt}ms)`); return }
      const t = e.changedTouches[0]
      const px = t ? t.clientX : startX
      const py = t ? t.clientY : startY

      const now = Date.now()
      if (now - lastPickAt < DEDUPE_MS) { dbg('end: skip (dedupe)'); return }

      const rect = el.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) { dbg('end: skip (rect 0)'); return }

      const ndc = new THREE.Vector2(
        ((px - rect.left) / rect.width) * 2 - 1,
        -((py - rect.top) / rect.height) * 2 + 1,
      )
      raycaster.setFromCamera(ndc, camera)

      const interLen = internal?.interaction?.length ?? -1
      const targets = internal?.interaction?.length ? internal.interaction : scene.children
      const hits = raycaster.intersectObjects(targets, true)

      for (const hit of hits) {
        let obj: THREE.Object3D | null = hit.object
        while (obj) {
          const r3f = (obj as THREE.Object3D & { __r3f?: R3FInstance }).__r3f
          if (r3f?.eventCount && r3f.handlers?.onClick) {
            lastPickAt = now
            const target = obj
            dbg(`HIT ✓ inter=${interLen} hits=${hits.length} -> ${target.name || target.type} CALLED`)
            r3f.handlers.onClick({ stopPropagation() {}, object: target })
            return
          }
          obj = obj.parent
        }
      }
      dbg(`tap@(${px | 0},${py | 0}) ndc(${ndc.x.toFixed(2)},${ndc.y.toFixed(2)}) inter=${interLen} hits=${hits.length} -> NO handler`)
    }

    el.addEventListener('touchstart', onStart, { passive: true })
    el.addEventListener('touchmove',  onMove,  { passive: true })
    el.addEventListener('touchend',   onEnd,   { passive: true })

    return () => {
      el.removeEventListener('touchstart', onStart)
      el.removeEventListener('touchmove',  onMove)
      el.removeEventListener('touchend',   onEnd)
    }
  }, [enabled, camera, gl, raycaster, scene, internal, onDebug])

  return null
}
