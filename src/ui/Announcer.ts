export class Announcer {
  private message = 'Ready for absurd ballistics.';
  private untilMs = 0;

  say(message: string, nowMs: number, ms = 2200): void {
    this.message = message;
    this.untilMs = nowMs + ms;
  }

  getMessage(nowMs: number): string {
    if (nowMs > this.untilMs) return 'Make every shot unnecessarily dramatic.';
    return this.message;
  }
}
