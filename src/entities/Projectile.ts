export type ProjectileKind = 'at4' | 'slingshot';

export type Projectile = {
  id: string;
  ownerWormId: string;
  weaponId: string;
  kind: ProjectileKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  bornAtMs: number;
  fuseTimeMs: number;
  gravityScale: number;
  bounciness: number;
  canBounceOnce: boolean;
  bounced: boolean;
  transformedChicken: boolean;
  active: boolean;
};
