// Shared mutable object — written by MobileControls (UI layer),
// read by FPSMovement (R3F useFrame). Plain object avoids React
// setState overhead in the animation hot-path.

export const touchState = {
  joystick: { x: 0, y: 0 },   // normalised −1 … 1 per axis
  lookDelta: { x: 0, y: 0 },  // accumulated pixel delta, consumed each frame
  dragging: false,             // true while camera look-drag is in progress

  // Where the joystick actually sits on screen, in viewport px, measured from
  // its rendered element. Written by MobileControls, read by MobileTapPick so
  // both agree on what counts as "on the joystick" — guessing from
  // window.innerHeight drifts on mobile browsers whose toolbars resize.
  // r === 0 means "not measured yet".
  joystickZone: { x: 0, y: 0, r: 0 },
}
