import type { Worm } from '../entities/Worm';
import type { WeaponConfig } from './schema';
import { applyKnockback } from '../physics/Knockback';

type MeleeResult = {
  hit: boolean;
  hitCount: number;
  didYeet: boolean;
};

export function executeMelee(
  weapon: WeaponConfig,
  attacker: Worm,
  worms: Worm[],
  nowMs: number,
  ridiculousScale: number
): MeleeResult {
  let hitCount = 0;
  let didYeet = false;
  worms.forEach((target) => {
    if (!target.alive || target.id === attacker.id) return;
    const dx = target.x - attacker.x;
    if (Math.sign(dx || 1) !== attacker.facing) return;
    const dist = Math.hypot(dx, target.y - attacker.y);
    if (dist > weapon.range) return;
    hitCount += 1;
    target.hp -= weapon.baseDamage;
    let force = weapon.knockback;
    if (target.hp <= 20) {
      force *= 1 + (weapon.comedy?.extraKnockbackOnKill ?? 0);
      didYeet = true;
    }
    applyKnockback(target, attacker.x, attacker.y, force, ridiculousScale * 0.0036);
    target.squashX = 1.22;
    target.squashY = 0.78;
    if (target.hp <= 0) target.alive = false;
  });

  if (hitCount === 0) {
    const stun = weapon.comedy?.selfStunMs ?? 500;
    attacker.stunUntilMs = nowMs + stun;
    attacker.squashX = 0.7;
    attacker.squashY = 1.4;
  }

  return { hit: hitCount > 0, hitCount, didYeet };
}
