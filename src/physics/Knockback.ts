export function applyKnockback(
  target: { vx: number; vy: number; x: number; y: number },
  originX: number,
  originY: number,
  force: number,
  multiplier: number
): void {
  const dx = target.x - originX;
  const dy = target.y - originY;
  const len = Math.hypot(dx, dy) || 1;
  const nx = dx / len;
  const ny = dy / len;
  const impulse = force * multiplier;
  target.vx += nx * impulse;
  target.vy += ny * impulse;
  // Bias upward for cartoony launch arcs so hits read as impactful.
  target.vy -= impulse * 0.32;
}
