export class VirtualJoystick {
  private id: number | null = null;
  private startX = 0;
  private startY = 0;
  private dx = 0;

  begin(pointerId: number, x: number, y: number): void {
    this.id = pointerId;
    this.startX = x;
    this.startY = y;
    this.dx = 0;
  }

  move(pointerId: number, x: number, y: number): void {
    if (this.id !== pointerId) return;
    const deltaX = x - this.startX;
    const _deltaY = y - this.startY;
    this.dx = Math.max(-1, Math.min(1, deltaX / 48));
  }

  end(pointerId: number): void {
    if (this.id !== pointerId) return;
    this.id = null;
    this.dx = 0;
  }

  axisX(): number {
    return this.dx;
  }
}
