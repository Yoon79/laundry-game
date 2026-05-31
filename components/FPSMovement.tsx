import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { touchState } from '@/lib/touchState'

const WALK_SPEED = 3.0
const EYE_HEIGHT = 1.7

// Player bounds — wide outside, narrow inside building
const BOUND_X_INDOOR  = 0.9
const BOUND_X_OUTDOOR = 6.0
const BOUND_Z_MIN = -17.5
const BOUND_Z_MAX = 22.0
const FACADE_Z    = 5.5

interface Props {
  active: boolean
  isMobile?: boolean
}

export default function FPSMovement({ active, isMobile = false }: Props) {
  const { camera } = useThree()
  const keys  = useRef({ w: false, a: false, s: false, d: false })
  const fwd   = useRef(new THREE.Vector3())
  const right = useRef(new THREE.Vector3())
  const move  = useRef(new THREE.Vector3())
  const UP    = useRef(new THREE.Vector3(0, 1, 0))

  const prevActive   = useRef(false)
  const descendingY  = useRef(false)

  // Set initial camera direction + correct rotation order for FPS
  useEffect(() => {
    camera.rotation.order = 'YXZ'   // prevents gimbal lock for FPS look
    camera.lookAt(0, 1.5, 5.5)
  }, [camera])

  // Desktop keyboard
  useEffect(() => {
    if (isMobile) return
    const onDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp')    keys.current.w = true
      if (e.code === 'KeyA' || e.code === 'ArrowLeft')  keys.current.a = true
      if (e.code === 'KeyS' || e.code === 'ArrowDown')  keys.current.s = true
      if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.current.d = true
    }
    const onUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp')    keys.current.w = false
      if (e.code === 'KeyA' || e.code === 'ArrowLeft')  keys.current.a = false
      if (e.code === 'KeyS' || e.code === 'ArrowDown')  keys.current.s = false
      if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.current.d = false
    }
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup',   onUp)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup',   onUp)
    }
  }, [isMobile])

  useFrame((_, delta) => {
    if (!active) {
      prevActive.current = false
      return
    }

    // First frame of activation → start descent
    if (!prevActive.current) {
      prevActive.current  = true
      descendingY.current = true
    }

    // ── Mobile: apply touch camera look ──────────────────────────────
    if (isMobile) {
      if (touchState.lookDelta.x !== 0 || touchState.lookDelta.y !== 0) {
        camera.rotation.y -= touchState.lookDelta.x
        camera.rotation.x  = THREE.MathUtils.clamp(
          camera.rotation.x - touchState.lookDelta.y,
          -Math.PI / 2.1,
           Math.PI / 2.1,
        )
        touchState.lookDelta.x = 0
        touchState.lookDelta.y = 0
      }
    }

    // ── Movement ──────────────────────────────────────────────────────
    camera.getWorldDirection(fwd.current)
    fwd.current.y = 0
    fwd.current.normalize()
    right.current.crossVectors(fwd.current, UP.current).normalize()
    move.current.set(0, 0, 0)

    if (isMobile) {
      // Joystick: x = strafe, y = forward/back (positive y = push down = backward)
      const jx = touchState.joystick.x
      const jy = touchState.joystick.y
      if (Math.abs(jx) > 0.08 || Math.abs(jy) > 0.08) {
        move.current.addScaledVector(fwd.current,  -jy * WALK_SPEED * delta)
        move.current.addScaledVector(right.current, jx * WALK_SPEED * delta)
      }
    } else {
      // WASD
      if (keys.current.w) move.current.addScaledVector(fwd.current,  WALK_SPEED * delta)
      if (keys.current.s) move.current.addScaledVector(fwd.current, -WALK_SPEED * delta)
      if (keys.current.a) move.current.addScaledVector(right.current, -WALK_SPEED * delta)
      if (keys.current.d) move.current.addScaledVector(right.current,  WALK_SPEED * delta)
    }

    camera.position.add(move.current)
    const boundX = camera.position.z > FACADE_Z - 0.3 ? BOUND_X_OUTDOOR : BOUND_X_INDOOR
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -boundX, boundX)
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, BOUND_Z_MIN, BOUND_Z_MAX)

    // ── Smooth Y descent ──────────────────────────────────────────────
    if (descendingY.current) {
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, EYE_HEIGHT, delta * 3.5)
      if (Math.abs(camera.position.y - EYE_HEIGHT) < 0.015) {
        camera.position.y  = EYE_HEIGHT
        descendingY.current = false
      }
    } else {
      camera.position.y = EYE_HEIGHT
    }
  })

  return null
}
