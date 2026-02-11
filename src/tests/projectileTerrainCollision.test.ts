import { describe, expect, it } from 'vitest';
import { TerrainMask } from '../terrain/TerrainMask';
import { testProjectileCollision } from '../physics/CollisionWorld';

describe('projectile terrain collision', () => {
  it('detects collision with terrain', () => {
    const terrain = new TerrainMask(100, 100);
    terrain.fillSolidFromY((x) => (x > 20 ? 60 : 80));

    const result = testProjectileCollision(
      {
        id: 'p',
        ownerWormId: 'w',
        weaponId: 'at4',
        kind: 'at4',
        x: 50,
        y: 70,
        vx: 0,
        vy: 0,
        radius: 4,
        bornAtMs: 0,
        fuseTimeMs: 0,
        gravityScale: 1,
        bounciness: 0,
        canBounceOnce: false,
        bounced: false,
        transformedChicken: false,
        active: true
      },
      terrain
    );

    expect(result.hit).toBe(true);
  });
});
