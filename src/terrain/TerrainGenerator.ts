import { TerrainMask } from './TerrainMask';

export function generateTerrain(width: number, height: number): TerrainMask {
  const terrain = new TerrainMask(width, height);
  const amp = height * 0.12;
  const base = height * 0.58;
  terrain.fillSolidFromY((x) => {
    const n = Math.sin(x * 0.012) * 0.6 + Math.sin(x * 0.027 + 2) * 0.4;
    return base + n * amp;
  });
  return terrain;
}
