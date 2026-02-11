import type { Worm } from '../entities/Worm';
import type { WeaponConfig } from './schema';
import { applyKnockback } from '../physics/Knockback';
import { addStatus } from '../entities/StatusEffects';
import type { RNG } from '../core/RNG';

type ConeResult = {
  hitCount: number;
  missedStains: Array<{ x: number; y: number; untilMs: number }>;
};

export function executeCone(
  weapon: WeaponConfig,
  attacker: Worm,
  worms: Worm[],
  nowMs: number,
  ridiculousScale: number,
  rng: RNG
): ConeResult {
  const facingAngle = attacker.facing === 1 ? 0 : Math.PI;
  const arc = ((weapon.arcDeg || 50) * Math.PI) / 180;
  let hitCount = 0;

  worms.forEach((target) => {
    if (!target.alive || target.id === attacker.id) return;
    const dx = target.x - attacker.x;
    const dy = target.y - attacker.y;
    const dist = Math.hypot(dx, dy);
    if (dist > weapon.range || dist < 1) return;
    const angle = Math.atan2(dy, dx);
    let delta = angle - facingAngle;
    while (delta > Math.PI) delta -= Math.PI * 2;
    while (delta < -Math.PI) delta += Math.PI * 2;
    if (Math.abs(delta) > arc / 2) return;

    hitCount += 1;
    target.hp -= weapon.baseDamage;
    applyKnockback(target, attacker.x, attacker.y, weapon.knockback, ridiculousScale * 0.0036);

    if (weapon.statusEffect?.kind === 'poison') {
      addStatus(target, {
        kind: 'poison',
        endAtMs: nowMs + weapon.statusEffect.durationMs,
        dps: weapon.statusEffect.dps ?? 4,
        nextTickMs: nowMs + 1000
      });
      addStatus(target, {
        kind: 'slip',
        endAtMs: nowMs + 2500
      });
    }

    if (target.hp <= 0) target.alive = false;
  });

  const missedStains: Array<{ x: number; y: number; untilMs: number }> = [];
  if (hitCount === 0) {
    for (let i = 0; i < 8; i += 1) {
      const t = 0.35 + rng.nextFloat() * 0.65;
      const a = facingAngle + (rng.nextFloat() - 0.5) * arc;
      missedStains.push({
        x: attacker.x + Math.cos(a) * weapon.range * t,
        y: attacker.y + Math.sin(a) * weapon.range * t,
        untilMs: nowMs + 3500 + rng.nextFloat() * 1500
      });
    }
  }

  return { hitCount, missedStains };
}
