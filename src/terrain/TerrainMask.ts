export class TerrainMask {
  readonly width: number;
  readonly height: number;
  private data: Uint8Array;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.data = new Uint8Array(width * height);
  }

  fillSolidFromY(surfaceYByX: (x: number) => number): void {
    for (let x = 0; x < this.width; x += 1) {
      const surface = Math.floor(surfaceYByX(x));
      for (let y = Math.max(0, surface); y < this.height; y += 1) {
        this.data[y * this.width + x] = 1;
      }
    }
  }

  isSolid(x: number, y: number): boolean {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    if (ix < 0 || iy < 0 || ix >= this.width || iy >= this.height) return false;
    return this.data[iy * this.width + ix] === 1;
  }

  carveCircle(cx: number, cy: number, radius: number): void {
    const r2 = radius * radius;
    const minX = Math.max(0, Math.floor(cx - radius));
    const maxX = Math.min(this.width - 1, Math.ceil(cx + radius));
    const minY = Math.max(0, Math.floor(cy - radius));
    const maxY = Math.min(this.height - 1, Math.ceil(cy + radius));
    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        const dx = x - cx;
        const dy = y - cy;
        if (dx * dx + dy * dy <= r2) {
          this.data[y * this.width + x] = 0;
        }
      }
    }
  }

  getRaw(): Uint8Array {
    return this.data;
  }
}
