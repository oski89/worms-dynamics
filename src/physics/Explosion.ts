import type { Worm } from '../entities/Worm';
import type { TerrainMask } from '../terrain/TerrainMask';
import { applyKnockback } from './Knockback';

export function applyExplosion(
  terrain: TerrainMask,
  worms: Worm[],
  x: number,
  y: number,
  radius: number,
  damage: number,
  carveRadius: number,
  knockback: number,
  ridiculousScale: number
): void {
  if (carveRadius > 0) terrain.carveCircle(x, y, carveRadius);
  const shockwaveRadius = radius + 36;
  worms.forEach((worm) => {
    if (!worm.alive) return;
    const d = Math.hypot(worm.x - x, worm.y - y);
    if (d <= radius) {
      const t = 1 - d / Math.max(radius, 1);
      worm.hp -= damage * (0.45 + t * 0.55);
      const force = knockback * (0.2 + t * 0.8);
      applyKnockback(worm, x, y, force, ridiculousScale * 0.0042);
    } else if (d <= shockwaveRadius) {
      const t = 1 - (d - radius) / Math.max(shockwaveRadius - radius, 1);
      applyKnockback(worm, x, y, knockback * 0.18 * t, ridiculousScale * 0.0032);
    }
    if (worm.hp <= 0) worm.alive = false;
  });
}
