'use client'

import { useRef } from 'react'
import type { MouseEvent, PointerEvent } from 'react'

/**
 * Prevents the "ghost click" that closes a modal on the very same tap that
 * opened it.
 *
 * On touch devices, opening a modal from a 3D object works like this:
 *   pointerdown (on canvas) → modal mounts → pointerup → click
 * The trailing `click` is dispatched to whatever element now sits under the
 * finger — which is the freshly-mounted modal backdrop. A naive
 * `onClick={onClose}` therefore closes the modal immediately, so the tap
 * appears to do nothing.
 *
 * Fix: only treat a backdrop click as a dismiss when the pointer press also
 * STARTED on the backdrop. The opening tap's pointerdown happened on the
 * canvas (the backdrop did not even exist yet), so its trailing click is
 * ignored. A deliberate tap on the backdrop — press and release both on the
 * backdrop — still dismisses normally.
 *
 * Spread the returned handlers onto the backdrop element:
 *   const dismiss = useBackdropDismiss(onClose)
 *   <div className="backdrop" {...dismiss}> ... </div>
 */
export function useBackdropDismiss(onClose: () => void) {
  const startedOnBackdrop = useRef(false)

  return {
    onPointerDown: (e: PointerEvent) => {
      // Only flag presses that begin on the backdrop itself, not on its
      // children (the modal card stops propagation anyway).
      startedOnBackdrop.current = e.target === e.currentTarget
    },
    onClick: (e: MouseEvent) => {
      if (e.target === e.currentTarget && startedOnBackdrop.current) {
        onClose()
      }
      startedOnBackdrop.current = false
    },
  }
}
