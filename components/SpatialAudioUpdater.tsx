'use client'

import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { getAudioCtx } from '@/lib/spatialAudio'

const _fwd = new THREE.Vector3()
const _up  = new THREE.Vector3()

// Lives inside the R3F Canvas — updates Web Audio listener every frame
// so volume + panning reflect the player's current position and facing.
export default function SpatialAudioUpdater() {
  const { camera } = useThree()

  useFrame(() => {
    const ctx = getAudioCtx()
    if (!ctx || ctx.state !== 'running') return

    const { listener } = ctx
    const t = ctx.currentTime

    // Position
    listener.positionX.setValueAtTime(camera.position.x, t)
    listener.positionY.setValueAtTime(camera.position.y, t)
    listener.positionZ.setValueAtTime(camera.position.z, t)

    // Forward direction (camera looks in −Z locally)
    camera.getWorldDirection(_fwd)
    listener.forwardX.setValueAtTime(_fwd.x, t)
    listener.forwardY.setValueAtTime(_fwd.y, t)
    listener.forwardZ.setValueAtTime(_fwd.z, t)

    // Up direction
    _up.set(0, 1, 0).applyQuaternion(camera.quaternion)
    listener.upX.setValueAtTime(_up.x, t)
    listener.upY.setValueAtTime(_up.y, t)
    listener.upZ.setValueAtTime(_up.z, t)
  })

  return null
}
