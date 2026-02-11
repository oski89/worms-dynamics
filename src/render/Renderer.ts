import type { Camera } from '../core/Camera';
import type { Particle } from '../entities/Particles';
import type { Projectile } from '../entities/Projectile';
import type { Team } from '../entities/Team';
import type { Worm } from '../entities/Worm';
import type { TerrainRenderer } from '../terrain/TerrainRenderer';
import { drawParticles } from './EffectsRenderer';
import { drawProjectile, drawWorm } from './SpritePrimitives';

export class Renderer {
  constructor(private ctx: CanvasRenderingContext2D) {}

  render(params: {
    camera: Camera;
    viewWidth: number;
    viewHeight: number;
    terrainRenderer: TerrainRenderer;
    worms: Worm[];
    teams: Team[];
    projectiles: Projectile[];
    particles: Particle[];
    stains: Array<{ x: number; y: number; untilMs: number }>;
    nowMs: number;
    shake: { x: number; y: number };
    winner?: string;
    activeWormId?: string;
    projectileLabel?: string;
  }): void {
    const {
      camera,
      viewWidth,
      viewHeight,
      terrainRenderer,
      worms,
      teams,
      projectiles,
      particles,
      stains,
      nowMs,
      shake,
      winner,
      activeWormId,
      projectileLabel
    } = params;

    this.ctx.clearRect(0, 0, viewWidth, viewHeight);

    const sky = this.ctx.createLinearGradient(0, 0, 0, viewHeight);
    sky.addColorStop(0, '#8fd3ff');
    sky.addColorStop(1, '#d8f4ff');
    this.ctx.fillStyle = sky;
    this.ctx.fillRect(0, 0, viewWidth, viewHeight);

    this.ctx.save();
    this.ctx.translate(-camera.x + shake.x, -camera.y + shake.y);

    stains.forEach((stain) => {
      if (nowMs > stain.untilMs) return;
      const t = 1 - (nowMs - (stain.untilMs - 5000)) / 5000;
      this.ctx.globalAlpha = Math.max(0, Math.min(0.45, t * 0.45));
      this.ctx.fillStyle = '#78d65e';
      this.ctx.beginPath();
      this.ctx.arc(stain.x, stain.y, 8, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.globalAlpha = 1;

    terrainRenderer.renderTo(this.ctx);

    worms.forEach((worm) => {
      if (!worm.alive) return;
      const team = teams.find((t) => t.id === worm.teamId);
      drawWorm(
        this.ctx,
        worm.x,
        worm.y,
        worm.radius,
        team?.color ?? '#b5b5b5',
        worm.facing,
        worm.squashX,
        worm.squashY
      );
      if (worm.id === activeWormId) {
        this.ctx.strokeStyle = '#f9f46d';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(worm.x, worm.y, worm.radius + 4, 0, Math.PI * 2);
        this.ctx.stroke();
      }
      if (worm.bubbleText && worm.bubbleUntilMs && nowMs < worm.bubbleUntilMs) {
        this.ctx.fillStyle = '#10243d';
        this.ctx.font = '14px sans-serif';
        this.ctx.fillText(worm.bubbleText, worm.x - 14, worm.y - worm.radius - 22);
      }
    });

    projectiles.forEach((p) => {
      if (!p.active) return;
      drawProjectile(this.ctx, p.x, p.y, p.radius, p.kind === 'at4' ? '#444' : '#a56f2a', p.transformedChicken);
      if (p.kind === 'at4') {
        this.ctx.globalAlpha = 0.55;
        this.ctx.fillStyle = '#d9d9d9';
        this.ctx.fillRect(p.x - p.vx * 0.02, p.y - p.vy * 0.02, 14, 8);
        this.ctx.globalAlpha = 1;
      }
    });

    drawParticles(this.ctx, particles);
    this.ctx.restore();

    if (winner) {
      this.ctx.fillStyle = 'rgba(0,0,0,0.45)';
      this.ctx.fillRect(0, 0, viewWidth, viewHeight);
      this.ctx.fillStyle = '#fff';
      this.ctx.font = 'bold 34px sans-serif';
      this.ctx.fillText(`${winner} wins!`, viewWidth / 2 - 100, viewHeight / 2);
      this.ctx.font = '18px sans-serif';
      this.ctx.fillText('Press R to restart', viewWidth / 2 - 82, viewHeight / 2 + 28);
    }

    if (projectileLabel) {
      this.ctx.fillStyle = '#1d1d1d';
      this.ctx.font = '16px sans-serif';
      this.ctx.fillText(projectileLabel, 16, viewHeight - 16);
    }
  }
}
