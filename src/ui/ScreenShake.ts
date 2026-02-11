export class ScreenShake {
  private timeMs = 0;
  private durationMs = 0;
  private intensity = 0;
  private offsetX = 0;
  private offsetY = 0;

  kick(intensity: number, durationMs: number): void {
    if (this.timeMs >= this.durationMs) {
      this.timeMs = 0;
      this.durationMs = 0;
      this.intensity = 0;
    }
    this.intensity = Math.min(18, this.intensity + intensity * 0.6);
    this.durationMs = Math.max(this.durationMs, this.timeMs + durationMs);
  }

  tick(dtMs: number, rand01: () => number): { x: number; y: number } {
    if (this.timeMs >= this.durationMs || this.durationMs <= 0) {
      this.offsetX *= 0.65;
      this.offsetY *= 0.65;
      return { x: this.offsetX, y: this.offsetY };
    }
    this.timeMs += dtMs;
    const t = 1 - this.timeMs / this.durationMs;
    const amp = this.intensity * t;
    const targetX = (rand01() * 2 - 1) * amp;
    const targetY = (rand01() * 2 - 1) * amp;
    this.offsetX += (targetX - this.offsetX) * 0.6;
    this.offsetY += (targetY - this.offsetY) * 0.6;
    return {
      x: this.offsetX,
      y: this.offsetY
    };
  }
}
