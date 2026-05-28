import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const WALK_SPEED = 3.0
const EYE_HEIGHT = 1.7

// Player corridor bounds
const BOUND_X = 0.9
const BOUND_Z_MIN = -12.2   // near the back of the clothes room (ROOM_FAR = -12.5)
const BOUND_Z_MAX = 11.5    // exterior space extends to z ≈ 12.5

interface Props {
  active: boolean
}

export default function FPSMovement({ active }: Props) {
  const { camera } = useThree()
  const keys = useRef({ w: false, a: false, s: false, d: false })
  const fwd = useRef(new THREE.Vector3())
  const right = useRef(new THREE.Vector3())
  const move = useRef(new THREE.Vector3())
  const UP = useRef(new THREE.Vector3(0, 1, 0))

  // Smooth y descent when entering FPS mode
  const prevActive = useRef(false)
  const descendingY = useRef(false)

  // Set initial view facing the laundry entrance from outside
  useEffect(() => {
    // Camera starts at [0, 3, 9] — look toward the front door at z=5.5
    camera.lookAt(0, 1.2, 5.5)
  }, [camera])

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp') keys.current.w = true
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.current.a = true
      if (e.code === 'KeyS' || e.code === 'ArrowDown') keys.current.s = true
      if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.current.d = true
    }
    const onUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp') keys.current.w = false
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.current.a = false
      if (e.code === 'KeyS' || e.code === 'ArrowDown') keys.current.s = false
      if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.current.d = false
    }
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
    }
  }, [])

  useFrame((_, delta) => {
    if (!active) {
      prevActive.current = false
      return
    }

    // Detect first frame of FPS activation — start smooth descent
    if (!prevActive.current) {
      prevActive.current = true
      descendingY.current = true
    }

    // WASD movement
    camera.getWorldDirection(fwd.current)
    fwd.current.y = 0
    fwd.current.normalize()
    right.current.crossVectors(fwd.current, UP.current).normalize()

    move.current.set(0, 0, 0)
    if (keys.current.w) move.current.addScaledVector(fwd.current, WALK_SPEED * delta)
    if (keys.current.s) move.current.addScaledVector(fwd.current, -WALK_SPEED * delta)
    if (keys.current.a) move.current.addScaledVector(right.current, -WALK_SPEED * delta)
    if (keys.current.d) move.current.addScaledVector(right.current, WALK_SPEED * delta)

    camera.position.add(move.current)
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -BOUND_X, BOUND_X)
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, BOUND_Z_MIN, BOUND_Z_MAX)

    // Smooth y descent from overview height to eye level
    if (descendingY.current) {
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, EYE_HEIGHT, delta * 3.5)
      if (Math.abs(camera.position.y - EYE_HEIGHT) < 0.015) {
        camera.position.y = EYE_HEIGHT
        descendingY.current = false
      }
    } else {
      camera.position.y = EYE_HEIGHT
    }
  })

  return null
}
