export type TurnRecoveryInput = {
  hasWinner: boolean;
  hasActiveWorm: boolean;
  activeWormAlive: boolean;
  hasActiveProjectiles: boolean;
};

export type TurnRecoveryDecision = 'none' | 'resolve' | 'nextTurn';

export function decideTurnRecovery(input: TurnRecoveryInput): TurnRecoveryDecision {
  if (input.hasWinner) return 'none';
  if (!input.hasActiveWorm) return 'nextTurn';
  if (input.activeWormAlive) return 'none';
  if (input.hasActiveProjectiles) return 'resolve';
  return 'nextTurn';
}
