import type { TerrainMask } from './TerrainMask';

export function resolveCircleTerrainCollision(
  terrain: TerrainMask,
  x: number,
  y: number,
  radius: number
): { collided: boolean; correctedY: number } {
  let correctedY = y;
  let collided = false;
  for (let step = 0; step < radius + 3; step += 1) {
    const probeY = y + step;
    if (terrain.isSolid(x, probeY + radius)) {
      correctedY = probeY - 0.1;
      collided = true;
      break;
    }
  }
  return { collided, correctedY };
}

export function projectileHitsTerrain(terrain: TerrainMask, x: number, y: number): boolean {
  return terrain.isSolid(x, y);
}
