import type { TerrainMask } from './TerrainMask';

type GroundProbe = {
  collided: boolean;
  grounded: boolean;
  correctedY: number;
};

function hasFootContact(terrain: TerrainMask, x: number, y: number, radius: number, offsetY: number): boolean {
  const footY = y + radius + offsetY;
  const offsets = [-0.65, -0.35, 0, 0.35, 0.65];
  for (const ratio of offsets) {
    if (terrain.isSolid(x + radius * ratio, footY)) return true;
  }
  return false;
}

export function resolveCircleTerrainCollision(
  terrain: TerrainMask,
  x: number,
  y: number,
  radius: number
): GroundProbe {
  let correctedY = y;
  let collided = false;

  const contactNow = () => hasFootContact(terrain, x, correctedY, radius, 0);
  const contactNear = () => hasFootContact(terrain, x, correctedY, radius, 1);

  // If the worm is embedded in terrain, lift it upward until its feet are clear.
  let liftBudget = Math.ceil(radius * 2) + 6;
  while (liftBudget > 0 && contactNow()) {
    correctedY -= 1;
    collided = true;
    liftBudget -= 1;
  }

  const grounded = contactNow() || contactNear();

  // Stabilize tiny gravity jitter when feet are within 1px of contact.
  if (!collided && grounded && contactNear() && !contactNow()) {
    correctedY = Math.floor(correctedY);
    collided = true;
  }

  return { collided, grounded, correctedY };
}

export function projectileHitsTerrain(terrain: TerrainMask, x: number, y: number): boolean {
  return terrain.isSolid(x, y);
}
