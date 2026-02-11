import type { TerrainMask } from './TerrainMask';

export class TerrainRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private dirty = true;

  constructor(private terrain: TerrainMask) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = terrain.width;
    this.canvas.height = terrain.height;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('2D context unavailable');
    this.ctx = ctx;
  }

  markDirty(): void {
    this.dirty = true;
  }

  renderTo(ctx: CanvasRenderingContext2D): void {
    if (this.dirty) {
      const img = this.ctx.createImageData(this.terrain.width, this.terrain.height);
      const raw = this.terrain.getRaw();
      for (let i = 0; i < raw.length; i += 1) {
        if (raw[i] === 0) continue;
        const px = i * 4;
        img.data[px] = 80;
        img.data[px + 1] = 145;
        img.data[px + 2] = 72;
        img.data[px + 3] = 255;
      }
      this.ctx.putImageData(img, 0, 0);
      this.dirty = false;
    }
    ctx.drawImage(this.canvas, 0, 0);
  }
}
