// Shared mutable object — written by MobileControls (UI layer),
// read by FPSMovement (R3F useFrame). Plain object avoids React
// setState overhead in the animation hot-path.

export const touchState = {
  joystick: { x: 0, y: 0 },   // normalised −1 … 1 per axis
  lookDelta: { x: 0, y: 0 },  // accumulated pixel delta, consumed each frame
  dragging: false,             // true while camera look-drag is in progress
}
