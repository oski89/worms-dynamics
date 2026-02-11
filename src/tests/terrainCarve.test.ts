import { describe, expect, it } from 'vitest';
import { TerrainMask } from '../terrain/TerrainMask';

describe('terrain carve', () => {
  it('clears pixels in carve radius', () => {
    const mask = new TerrainMask(40, 40);
    mask.fillSolidFromY(() => 0);

    expect(mask.isSolid(20, 20)).toBe(true);
    mask.carveCircle(20, 20, 6);

    expect(mask.isSolid(20, 20)).toBe(false);
    expect(mask.isSolid(5, 5)).toBe(true);
  });

  it('is stable on repeated carve near bounds', () => {
    const mask = new TerrainMask(20, 20);
    mask.fillSolidFromY(() => 0);
    for (let i = 0; i < 10; i += 1) {
      mask.carveCircle(0, 0, 5);
    }
    expect(mask.isSolid(0, 0)).toBe(false);
  });
});
