import type { Projectile } from '../entities/Projectile';
import type { Worm } from '../entities/Worm';
import type { WeaponConfig } from './schema';
import { RNG } from '../core/RNG';

let projectileCounter = 0;

export function spawnProjectiles(
  weapon: WeaponConfig,
  shooter: Worm,
  power01: number,
  nowMs: number,
  rng: RNG,
  ridiculousnessOn: boolean
): Projectile[] {
  const list: Projectile[] = [];
  for (let i = 0; i < weapon.projectileCount; i += 1) {
    const spread = (weapon.spreadDeg * (i - (weapon.projectileCount - 1) / 2)) / Math.max(1, weapon.projectileCount - 1);
    const angleDeg = shooter.aimAngleDeg + spread * shooter.facing;
    const angle = (angleDeg * Math.PI) / 180;
    const speed = weapon.muzzleVelocity * (0.35 + 0.65 * power01);
    const isChicken =
      weapon.id === 'slingshot' &&
      ridiculousnessOn &&
      !!weapon.comedy?.rareChance &&
      rng.chance(weapon.comedy.rareChance);
    list.push({
      id: `p-${projectileCounter++}`,
      ownerWormId: shooter.id,
      weaponId: weapon.id,
      kind: weapon.id === 'at4' ? 'at4' : 'slingshot',
      x: shooter.x + shooter.facing * (shooter.radius + 8),
      y: shooter.y - shooter.radius,
      vx: Math.cos(angle) * speed * shooter.facing,
      vy: -Math.sin(angle) * speed,
      radius: weapon.id === 'at4' ? 6 : 4,
      bornAtMs: nowMs,
      fuseTimeMs: weapon.fuseTimeMs,
      gravityScale: weapon.gravityScale,
      bounciness: weapon.bounciness,
      canBounceOnce: !!weapon.comedy?.bounceAtLowSpeed,
      bounced: false,
      transformedChicken: isChicken,
      active: true
    });
  }
  return list;
}
