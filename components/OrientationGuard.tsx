'use client'

import { useState, useEffect } from 'react'

interface Props { children: React.ReactNode }

export default function OrientationGuard({ children }: Props) {
  const [showGuard, setShowGuard] = useState(false)

  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    const check = () => {
      setShowGuard(isTouchDevice && window.innerHeight > window.innerWidth)
    }
    check()
    window.addEventListener('resize', check)
    window.addEventListener('orientationchange', check)
    return () => {
      window.removeEventListener('resize', check)
      window.removeEventListener('orientationchange', check)
    }
  }, [])

  if (showGuard) {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center"
        style={{ background: '#FAF0E6', fontFamily: 'var(--font-space-mono)' }}
      >
        {/* Rotating phone icon */}
        <div
          className="text-6xl mb-6"
          style={{ animation: 'spin-cw 2.5s ease-in-out infinite' }}
        >
          📱
        </div>
        <p
          className="text-[13px] tracking-[0.18em] uppercase text-center"
          style={{ color: '#5A3A20' }}
        >
          화면을 가로로 돌려주세요
        </p>
        <p
          className="text-[10px] tracking-widest mt-2 text-center"
          style={{ color: '#A08060' }}
        >
          Please rotate to landscape
        </p>
        {/* Decorative border */}
        <div
          className="absolute inset-4 border pointer-events-none"
          style={{ borderColor: 'rgba(160,120,60,0.20)' }}
        />
        <style>{`
          @keyframes spin-cw {
            0%   { transform: rotate(0deg);   }
            40%  { transform: rotate(90deg);  }
            60%  { transform: rotate(90deg);  }
            100% { transform: rotate(0deg);   }
          }
        `}</style>
      </div>
    )
  }

  return <>{children}</>
}
