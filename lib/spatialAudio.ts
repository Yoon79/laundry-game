// ── Spatial Audio Singleton ───────────────────────────────────────────────────
// Web Audio API panner fixed at the CD player's world position.
// SpatialAudioUpdater (R3F component) updates listener each frame.

// CD player world coordinates — must match CDPlayer position in GameClient
export const CD_POS = { x: 1.97, y: 1.78, z: 2.2 }

let _ctx:    AudioContext | null = null
let _panner: PannerNode   | null = null
let _ready               = false  // true once createMediaElementSource called

export function initSpatialAudio(audioEl: HTMLAudioElement): void {
  if (_ready) {
    // Already initialised — just resume suspended context
    _ctx?.resume()
    return
  }

  _ctx = new (window.AudioContext ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).webkitAudioContext)()

  const source  = _ctx.createMediaElementSource(audioEl)
  _panner       = _ctx.createPanner()

  // 3D panning model
  _panner.panningModel   = 'HRTF'
  _panner.distanceModel  = 'inverse'
  _panner.refDistance    = 2.0   // full volume within 2 m
  _panner.rolloffFactor  = 2.5   // gets quieter fairly quickly
  _panner.maxDistance    = 25

  // Fix panner at CD player position
  _panner.positionX.value = CD_POS.x
  _panner.positionY.value = CD_POS.y
  _panner.positionZ.value = CD_POS.z

  source.connect(_panner)
  _panner.connect(_ctx.destination)
  _ready = true
}

export function getAudioCtx(): AudioContext | null {
  return _ctx
}
