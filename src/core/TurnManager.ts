import type { Worm } from '../entities/Worm';

export class TurnManager {
  private order: Worm[] = [];
  private index = -1;

  setWorms(worms: Worm[]): void {
    this.order = worms;
    this.index = -1;
  }

  nextLiving(): Worm | undefined {
    if (this.order.length === 0) return undefined;
    for (let i = 0; i < this.order.length; i += 1) {
      this.index = (this.index + 1) % this.order.length;
      const candidate = this.order[this.index];
      if (candidate.alive) return candidate;
    }
    return undefined;
  }
}
