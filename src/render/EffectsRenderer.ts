import type { Particle } from '../entities/Particles';

export function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]): void {
  particles.forEach((p) => {
    const t = 1 - p.ageMs / Math.max(1, p.lifeMs);
    ctx.globalAlpha = Math.max(0, t);
    ctx.fillStyle = p.color;
    if (p.kind === 'star') {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
  });
  ctx.globalAlpha = 1;
}
