import { describe, expect, it } from 'vitest';
import { decideTurnRecovery } from '../core/TurnRecovery';

describe('turn recovery', () => {
  it('advances turn when active worm dies and no projectiles remain', () => {
    const decision = decideTurnRecovery({
      hasWinner: false,
      hasActiveWorm: true,
      activeWormAlive: false,
      hasActiveProjectiles: false
    });
    expect(decision).toBe('nextTurn');
  });

  it('waits in resolve when active worm dies but projectiles are still active', () => {
    const decision = decideTurnRecovery({
      hasWinner: false,
      hasActiveWorm: true,
      activeWormAlive: false,
      hasActiveProjectiles: true
    });
    expect(decision).toBe('resolve');
  });

  it('does nothing once winner exists', () => {
    const decision = decideTurnRecovery({
      hasWinner: true,
      hasActiveWorm: false,
      activeWormAlive: false,
      hasActiveProjectiles: false
    });
    expect(decision).toBe('none');
  });
});
