'use client'

import { useCallback, useRef } from 'react'

/**
 * Guards a 3D interaction against firing twice for a single tap.
 *
 * On touch devices an interaction can arrive through two paths at once:
 * MobileTapPick's own raycast (canvas touchend) and the browser's synthesized
 * DOM click reaching R3F. For idempotent actions (open this album panel) the
 * duplicate is invisible, but for a TOGGLE — the CD player — the second call
 * immediately undoes the first, so the music appeared not to start at all.
 */
export function useFireOnce(windowMs = 400) {
  const firedRef = useRef(false)

  return useCallback((fn: () => void) => {
    if (firedRef.current) return
    firedRef.current = true
    setTimeout(() => { firedRef.current = false }, windowMs)
    fn()
  }, [windowMs])
}
