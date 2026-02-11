export function drawWorm(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  facing: number,
  squashX = 1,
  squashY = 1
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(squashX, squashY);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(4 * facing, -3, radius * 0.25, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#1f1f1f';
  ctx.beginPath();
  ctx.arc(5 * facing, -3, radius * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawProjectile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  isChicken: boolean
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();
  if (isChicken) {
    ctx.fillStyle = '#fef0a8';
    ctx.fillRect(-radius, -radius - 6, radius * 2, 4);
  }
  ctx.restore();
}
