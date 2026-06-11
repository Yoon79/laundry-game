'use client'

import { useEffect, useState } from 'react'

/**
 * True on touch / small-screen devices. Detected after mount (so SSR markup
 * stays stable). Used to scale full-screen modals down so they fit an iPhone.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    setIsMobile(touch && window.innerWidth < 768)
  }, [])
  return isMobile
}
