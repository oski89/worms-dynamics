export class InputRouter {
  private keys = new Set<string>();
  private justPressed = new Set<string>();
  private justReleased = new Set<string>();
  private spaceHeld = false;
  private pointerHeld = false;

  constructor(private target: HTMLElement) {
    window.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();
      const wasDown = this.keys.has(key);
      this.keys.add(key);
      if (!wasDown) this.justPressed.add(key);
      if (e.key === ' ') {
        e.preventDefault();
        this.spaceHeld = true;
      }
    });

    window.addEventListener('keyup', (e) => {
      const key = e.key.toLowerCase();
      this.keys.delete(key);
      this.justReleased.add(key);
      if (e.key === ' ') {
        e.preventDefault();
        this.spaceHeld = false;
      }
    });

    target.addEventListener('pointerdown', (e) => {
      if (e.button === 0) this.pointerHeld = true;
    });
    target.addEventListener('pointerup', () => {
      this.pointerHeld = false;
    });
    target.addEventListener('pointercancel', () => {
      this.pointerHeld = false;
    });
  }

  isDown(key: string): boolean {
    return this.keys.has(key.toLowerCase());
  }

  consumePressed(key: string): boolean {
    const k = key.toLowerCase();
    const had = this.justPressed.has(k);
    this.justPressed.delete(k);
    return had;
  }

  consumeReleased(key: string): boolean {
    const k = key.toLowerCase();
    const had = this.justReleased.has(k);
    this.justReleased.delete(k);
    return had;
  }

  isSpaceHeld(): boolean {
    return this.spaceHeld;
  }

  isPointerHeld(): boolean {
    return this.pointerHeld;
  }

  isChargeHeld(): boolean {
    return this.spaceHeld || this.pointerHeld;
  }
}
