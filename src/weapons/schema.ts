export type WeaponType = 'melee' | 'cone' | 'projectile';

export type StatusEffectConfig = {
  kind: 'poison' | 'stun';
  durationMs: number;
  dps?: number;
};

export type ComedyConfig = {
  rareChance?: number;
  selfStunMs?: number;
  extraKnockbackOnKill?: number;
  wobbleAfterMs?: number;
  bounceAtLowSpeed?: boolean;
};

export type WeaponConfig = {
  id: string;
  displayName: string;
  type: WeaponType;
  range: number;
  arcDeg: number;
  projectileCount: number;
  spreadDeg: number;
  muzzleVelocity: number;
  gravityScale: number;
  fuseTimeMs: number;
  bounciness: number;
  explosionRadius: number;
  baseDamage: number;
  terrainCarveRadius: number;
  knockback: number;
  statusEffect?: StatusEffectConfig;
  sfx?: string;
  vfx?: string;
  comedy?: ComedyConfig;
};

export type WeaponFile = {
  weapons: unknown[];
};
