'use client'

import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Widens the vertical FOV in portrait orientation so the horizontal view
 * doesn't collapse into a tunnel. three.js `fov` is VERTICAL: at the design
 * value of 75° the horizontal FOV is ~97° in landscape, but only ~40° in a
 * phone-portrait aspect (~0.46). We keep the horizontal FOV roughly constant
 * by raising the vertical FOV when aspect < 1.
 *
 * Must live inside <Canvas>.
 */

const LANDSCAPE_FOV = 75
const PORTRAIT_FOV  = 100   // capped — beyond this fisheye distortion kicks in

export default function AdaptiveFov() {
  const camera = useThree((s) => s.camera)
  const size   = useThree((s) => s.size)

  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return
    const aspect = size.width / size.height
    const fov = aspect < 1 ? PORTRAIT_FOV : LANDSCAPE_FOV
    if (camera.fov !== fov) {
      camera.fov = fov
      camera.updateProjectionMatrix()
    }
  }, [camera, size])

  return null
}
