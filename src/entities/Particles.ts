export type ParticleKind = 'star' | 'confetti' | 'droplet' | 'smoke';

export type Particle = {
  kind: ParticleKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  lifeMs: number;
  ageMs: number;
  color: string;
  size: number;
};

export function tickParticles(particles: Particle[], dt: number): void {
  for (let i = particles.length - 1; i >= 0; i -= 1) {
    const p = particles[i];
    p.ageMs += dt * 1000;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 380 * dt;
    p.vx *= 0.99;
    if (p.ageMs >= p.lifeMs) particles.splice(i, 1);
  }
}
