import type { StatusInstance } from './StatusEffects';

export type Facing = 1 | -1;

export type Worm = {
  id: string;
  teamId: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hp: number;
  alive: boolean;
  facing: Facing;
  aimAngleDeg: number;
  grounded: boolean;
  moveBudgetMs: number;
  hasActed: boolean;
  stunUntilMs: number;
  slipFactor: number;
  statuses: StatusInstance[];
  squashX: number;
  squashY: number;
  bubbleText?: string;
  bubbleUntilMs?: number;
};
