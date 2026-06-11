'use client'

import { useRef } from 'react'
import type { MouseEvent, PointerEvent } from 'react'

/**
 * Dismisses a full-screen modal when the user genuinely taps/clicks the
 * backdrop — while ignoring the two false-dismiss traps on touch devices.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Verified behaviour (Playwright + CDP touch, React 19 / Next 16):
 *
 *  1. The tap that OPENS the modal (pointerdown on a 3D mesh in the canvas)
 *     does NOT re-dispatch a pointerdown onto the freshly-mounted backdrop.
 *     → The backdrop is never "armed" by the opening gesture, so it stays open.
 *
 *  2. A real backdrop tap fires pointerdown→click both on the backdrop.
 *     → armed === true on the click ⇒ dismiss. ✓
 *
 *  3. iOS Safari synthesises ghost MOUSE events (~300 ms after touchend) at
 *     the original touch point — which now sits over the backdrop. Those would
 *     otherwise arm + click the backdrop and close the modal instantly.
 *     → We ignore a `pointerType==='mouse'` pointerdown that lands within
 *       GHOST_WINDOW_MS of the last real touch, so the ghost never arms it.
 *
 * The mechanism is timing-free for the cases that matter (it tracks the actual
 * pointerdown target, not elapsed time); the only time check is the narrow
 * mouse-ghost filter, which cannot misfire from real input.
 *
 * Usage:
 *   const dismiss = useBackdropDismiss(onClose)
 *   <div className="fixed inset-0 …" {...dismiss}> … </div>
 */

// ── Module-level touch recency tracker (shared by all backdrops) ──────────────
const GHOST_WINDOW_MS = 700
let lastTouchAt = 0
if (typeof window !== 'undefined') {
  const mark = () => { lastTouchAt = Date.now() }
  // capture phase so we record the touch even if something stops propagation
  window.addEventListener('touchstart', mark, { capture: true, passive: true })
  window.addEventListener('touchend', mark, { capture: true, passive: true })
}

export function useBackdropDismiss(onClose: () => void) {
  // Armed only by a genuine pointerdown that begins on the backdrop itself.
  const armed = useRef(false)

  const dbg = (m: string) =>
    (globalThis as unknown as { __dbg?: (m: string) => void }).__dbg?.(m)

  return {
    onPointerDown(e: PointerEvent) {
      if (e.target !== e.currentTarget) return        // began on the card, ignore
      const ghost = e.pointerType === 'mouse' && Date.now() - lastTouchAt < GHOST_WINDOW_MS
      dbg(`bd.down type=${e.pointerType} dt=${Date.now() - lastTouchAt}ms ghost=${ghost}`)
      // Ignore ghost mouse pointerdown synthesised right after a touch.
      if (ghost) return
      armed.current = true
    },
    onClick(e: MouseEvent) {
      const self = e.target === e.currentTarget
      dbg(`bd.click self=${self} armed=${armed.current}`)
      if (self && armed.current) { dbg('bd → onClose()'); onClose() }
      armed.current = false
    },
  }
}
