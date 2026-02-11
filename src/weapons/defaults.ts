import type { WeaponConfig } from './schema';

export const WEAPON_DEFAULTS: Omit<WeaponConfig, 'id' | 'displayName' | 'type'> = {
  range: 0,
  arcDeg: 0,
  projectileCount: 1,
  spreadDeg: 0,
  muzzleVelocity: 400,
  gravityScale: 1,
  fuseTimeMs: 0,
  bounciness: 0,
  explosionRadius: 0,
  baseDamage: 0,
  terrainCarveRadius: 0,
  knockback: 240
};

export const COMEDY_DEFAULTS = {
  rareChance: 0,
  selfStunMs: 0,
  extraKnockbackOnKill: 0,
  wobbleAfterMs: 1500,
  bounceAtLowSpeed: false
} as const;
