export class GameLoop {
  private running = false;
  private last = 0;

  start(step: (dt: number) => void): void {
    if (this.running) return;
    this.running = true;
    const tick = (ts: number) => {
      if (!this.running) return;
      if (!this.last) this.last = ts;
      const dt = Math.min(0.033, (ts - this.last) / 1000);
      this.last = ts;
      step(dt);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  stop(): void {
    this.running = false;
  }
}
