import { describe, expect, it } from 'vitest';
import { integrateBody } from '../physics/Integrator';
import { TerrainMask } from '../terrain/TerrainMask';
import { resolveCircleTerrainCollision } from '../terrain/TerrainCollision';

describe('worm grounding', () => {
  it('stays grounded on flat terrain without sinking drift', () => {
    const terrain = new TerrainMask(200, 120);
    terrain.fillSolidFromY(() => 80);

    const worm = {
      x: 90,
      y: 40,
      vx: 0,
      vy: 0,
      radius: 12,
      grounded: false
    };

    const dt = 1 / 60;
    const ys: number[] = [];

    for (let i = 0; i < 240; i += 1) {
      integrateBody(worm, dt, 900);
      const collision = resolveCircleTerrainCollision(terrain, worm.x, worm.y, worm.radius);
      if (collision.collided) worm.y = collision.correctedY;
      worm.grounded = collision.grounded;
      if (worm.grounded && worm.vy > 0) worm.vy = 0;
      if (worm.grounded) worm.vx *= 0.86;
      ys.push(worm.y);
    }

    const tail = ys.slice(-40);
    const minTail = Math.min(...tail);
    const maxTail = Math.max(...tail);

    // No visible sinking drift once grounded.
    expect(maxTail - minTail).toBeLessThan(0.2);
    expect(worm.grounded).toBe(true);
    expect(worm.y + worm.radius).toBeLessThanOrEqual(81);
  });
});
