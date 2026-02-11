export class InputRouter {
  private keys = new Set<string>();
  chargeHeld = false;

  constructor(private target: HTMLElement) {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.key.toLowerCase());
      if (e.key === ' ') {
        e.preventDefault();
        this.chargeHeld = true;
      }
    });
    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.key.toLowerCase());
      if (e.key === ' ') {
        e.preventDefault();
        this.chargeHeld = false;
      }
    });

    target.addEventListener('pointerdown', (e) => {
      if (e.button === 0) this.chargeHeld = true;
    });
    target.addEventListener('pointerup', () => {
      this.chargeHeld = false;
    });
  }

  isDown(key: string): boolean {
    return this.keys.has(key.toLowerCase());
  }
}
