import type { Projectile } from '../entities/Projectile';
import type { TerrainMask } from '../terrain/TerrainMask';
import { projectileHitsTerrain } from '../terrain/TerrainCollision';

export type ProjectileCollision = {
  hit: boolean;
  x: number;
  y: number;
};

export function testProjectileCollision(projectile: Projectile, terrain: TerrainMask): ProjectileCollision {
  if (projectileHitsTerrain(terrain, projectile.x, projectile.y)) {
    return { hit: true, x: projectile.x, y: projectile.y };
  }
  return { hit: false, x: projectile.x, y: projectile.y };
}
