export const GAME_CONFIG = {
  worldWidth: 1400,
  worldHeight: 900,
  gravity: 900,
  fixedDt: 1 / 60,
  wormsPerTeam: 2,
  wormRadius: 14,
  moveSpeed: 130,
  jumpImpulse: 310,
  maxMoveSeconds: 3.5,
  maxActionSeconds: 6,
  maxWormHp: 100,
  poisonTickMs: 1000,
  poisonTickDamageDefault: 4,
  announcerChance: 0.1,
  ridiculousKnockbackScaleOn: 1,
  ridiculousKnockbackScaleOff: 0.45,
  shakeScaleOn: 1,
  shakeScaleOff: 0.4,
  cameraLerp: 0.15,
  resolveMinMs: 350,
  resolveMaxMs: 2200,
  wormMaxVx: 520,
  wormMaxVy: 780,
  outOfBoundsMargin: 120,
  teamColors: ['#6dd16a', '#5ba7ff']
} as const;

export type Phase = 'move' | 'action' | 'resolve';
