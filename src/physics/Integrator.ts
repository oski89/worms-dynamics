export function integrateBody(
  body: { x: number; y: number; vx: number; vy: number },
  dt: number,
  gravity: number
): void {
  body.vy += gravity * dt;
  body.x += body.vx * dt;
  body.y += body.vy * dt;
}
