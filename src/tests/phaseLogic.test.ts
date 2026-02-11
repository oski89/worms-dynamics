import { describe, expect, it } from 'vitest';
import { shouldAdvanceActionPhase, shouldAdvanceMovePhase, tickPhaseTimer } from '../core/PhaseLogic';

describe('phase timing and skip logic', () => {
  it('move phase advances after six seconds', () => {
    let ms = 6000;
    for (let i = 0; i < 6; i += 1) ms = tickPhaseTimer(ms, 1000);
    expect(shouldAdvanceMovePhase(ms, false)).toBe(true);
  });

  it('space skip advances move and action early when not charging', () => {
    expect(shouldAdvanceMovePhase(4500, true)).toBe(true);
    expect(shouldAdvanceActionPhase(4500, true, false)).toBe(true);
  });

  it('space skip does not end action while charging', () => {
    expect(shouldAdvanceActionPhase(4500, true, true)).toBe(false);
  });
});
