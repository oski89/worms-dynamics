export class TextSfx {
  private current = '';
  private untilMs = 0;

  trigger(text: string, nowMs: number, durationMs = 1200): void {
    this.current = text;
    this.untilMs = nowMs + durationMs;
  }

  currentText(nowMs: number): string {
    if (nowMs > this.untilMs) return '';
    return this.current;
  }
}
