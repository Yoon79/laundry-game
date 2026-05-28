import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const WALK_SPEED = 4.5
const EYE_HEIGHT = 1.7
// Player stays in the central corridor
const BOUND_X = 2.0
const BOUND_Z_MIN = -24.5   // reaches back of clothes room
const BOUND_Z_MAX = 10.5

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
    if (!active) return

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
    camera.position.y = EYE_HEIGHT
  })

  return null
}
