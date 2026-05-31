'use client'
import dynamic from 'next/dynamic'
import OrientationGuard from './OrientationGuard'

const GameClient = dynamic(() => import('./GameClient'), { ssr: false })

export default function ClientLoader() {
  return (
    <OrientationGuard>
      <GameClient />
    </OrientationGuard>
  )
}
