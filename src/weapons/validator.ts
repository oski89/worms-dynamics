import { COMEDY_DEFAULTS, WEAPON_DEFAULTS } from './defaults';
import type { ComedyConfig, WeaponConfig } from './schema';

const ALLOWED_FIELDS = new Set([
  'id',
  'displayName',
  'type',
  'range',
  'arcDeg',
  'projectileCount',
  'spreadDeg',
  'muzzleVelocity',
  'gravityScale',
  'fuseTimeMs',
  'bounciness',
  'explosionRadius',
  'baseDamage',
  'terrainCarveRadius',
  'knockback',
  'statusEffect',
  'sfx',
  'vfx',
  'comedy'
]);

const ALLOWED_COMEDY = new Set([
  'rareChance',
  'selfStunMs',
  'extraKnockbackOnKill',
  'wobbleAfterMs',
  'bounceAtLowSpeed'
]);

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

export function validateWeapon(input: unknown): WeaponConfig | null {
  if (!input || typeof input !== 'object') {
    console.warn('[weapons] Invalid weapon entry: expected object.');
    return null;
  }

  const raw = input as Record<string, unknown>;
  const id = typeof raw.id === 'string' ? raw.id : null;
  const displayName = typeof raw.displayName === 'string' ? raw.displayName : null;
  const type = raw.type;
  if (!id || !displayName || (type !== 'melee' && type !== 'cone' && type !== 'projectile')) {
    console.warn(`[weapons] Skipping weapon with missing critical fields: ${JSON.stringify(raw)}`);
    return null;
  }

  Object.keys(raw).forEach((field) => {
    if (!ALLOWED_FIELDS.has(field)) {
      console.warn(`[weapons] ${id}: unknown field '${field}'.`);
    }
  });

  const config: WeaponConfig = {
    id,
    displayName,
    type,
    ...WEAPON_DEFAULTS
  };

  const numberFields: Array<keyof typeof WEAPON_DEFAULTS> = [
    'range',
    'arcDeg',
    'projectileCount',
    'spreadDeg',
    'muzzleVelocity',
    'gravityScale',
    'fuseTimeMs',
    'bounciness',
    'explosionRadius',
    'baseDamage',
    'terrainCarveRadius',
    'knockback'
  ];

  numberFields.forEach((field) => {
    const value = raw[field];
    if (value === undefined) return;
    if (typeof value !== 'number' || Number.isNaN(value)) {
      console.warn(`[weapons] ${id}: '${field}' should be a number. Using default.`);
      return;
    }
    (config[field] as number) = value;
  });

  config.projectileCount = Math.max(1, Math.round(config.projectileCount));
  config.gravityScale = Math.max(0, config.gravityScale);
  config.bounciness = clamp(config.bounciness, 0, 1);
  config.range = Math.max(0, config.range);
  config.arcDeg = clamp(config.arcDeg, 0, 180);

  if (raw.statusEffect && typeof raw.statusEffect === 'object') {
    const se = raw.statusEffect as Record<string, unknown>;
    if ((se.kind === 'poison' || se.kind === 'stun') && typeof se.durationMs === 'number') {
      config.statusEffect = {
        kind: se.kind,
        durationMs: Math.max(0, se.durationMs),
        dps: typeof se.dps === 'number' ? Math.max(0, se.dps) : undefined
      };
    } else {
      console.warn(`[weapons] ${id}: invalid statusEffect.`);
    }
  }

  if (typeof raw.sfx === 'string') config.sfx = raw.sfx;
  if (typeof raw.vfx === 'string') config.vfx = raw.vfx;

  if (raw.comedy && typeof raw.comedy === 'object') {
    const comedyRaw = raw.comedy as Record<string, unknown>;
    Object.keys(comedyRaw).forEach((field) => {
      if (!ALLOWED_COMEDY.has(field)) {
        console.warn(`[weapons] ${id}: unknown comedy field '${field}'.`);
      }
    });
    const comedy: ComedyConfig = { ...COMEDY_DEFAULTS };
    if (typeof comedyRaw.rareChance === 'number') comedy.rareChance = clamp(comedyRaw.rareChance, 0, 1);
    if (typeof comedyRaw.selfStunMs === 'number') comedy.selfStunMs = Math.max(0, comedyRaw.selfStunMs);
    if (typeof comedyRaw.extraKnockbackOnKill === 'number') {
      comedy.extraKnockbackOnKill = Math.max(0, comedyRaw.extraKnockbackOnKill);
    }
    if (typeof comedyRaw.wobbleAfterMs === 'number') comedy.wobbleAfterMs = Math.max(0, comedyRaw.wobbleAfterMs);
    if (typeof comedyRaw.bounceAtLowSpeed === 'boolean') comedy.bounceAtLowSpeed = comedyRaw.bounceAtLowSpeed;
    config.comedy = comedy;
  }

  return config;
}
