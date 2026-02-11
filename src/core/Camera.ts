export class Camera {
  x = 0;
  y = 0;
  zoom = 1;

  follow(
    targetX: number,
    targetY: number,
    worldWidth: number,
    worldHeight: number,
    viewW: number,
    viewH: number,
    lerp = 0.15
  ): void {
    const desiredX = Math.max(0, Math.min(worldWidth - viewW, targetX - viewW / 2));
    const desiredY = Math.max(0, Math.min(worldHeight - viewH, targetY - viewH / 2));
    this.x += (desiredX - this.x) * lerp;
    this.y += (desiredY - this.y) * lerp;
  }
}
