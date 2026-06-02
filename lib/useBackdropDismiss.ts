'use client'

import { useRef } from 'react'
import type { MouseEvent } from 'react'

/**
 * Returns an onClick prop to spread on a full-screen backdrop div so that:
 *   • Clicks that land on a child card (e.target !== e.currentTarget) are ignored.
 *   • The ghost-click that arrives from the *same tap* that opened the modal is
 *     ignored via a 500 ms time gate from mount.
 *   • Deliberate taps on the backdrop background (> 500 ms after mount) close
 *     the modal normally.
 *
 * Why time-based instead of tracking startedOnBackdrop?
 * -------------------------------------------------------
 * React 18 can synchronously flush a state update that was triggered by
 * onPointerDown on a 3D mesh, mounting the backdrop DURING the same DOM event
 * dispatch.  The backdrop then receives that very same pointerdown event (because
 * React re-dispatches it through the newly mounted subtree), setting
 * startedOnBackdrop = true.  The trailing ghost click therefore passes the old
 * check and closes the modal immediately.
 *
 * A simple time gate avoids all of this: ghost-clicks arrive within ~50 ms of
 * mount; intentional "close" taps happen after the user consciously decides to
 * dismiss — always well above 500 ms.
 *
 * Usage:
 *   const dismiss = useBackdropDismiss(onClose)
 *   <div className="fixed inset-0 ..." {...dismiss}> … </div>
 */
export function useBackdropDismiss(onClose: () => void) {
  // Date.now() evaluated at render time ≈ mount time.
  // useRef guarantees this is only computed once per component instance.
  const mountedAt = useRef(Date.now())

  return {
    onClick(e: MouseEvent) {
      if (e.target !== e.currentTarget) return          // click was on the card
      if (Date.now() - mountedAt.current < 500) return  // ghost-click from opening tap
      onClose()
    },
  }
}
