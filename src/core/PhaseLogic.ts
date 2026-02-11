import type { Phase } from './Config';

export function tickPhaseTimer(timeLeftMs: number, dtMs: number): number {
  return Math.max(0, timeLeftMs - dtMs);
}

export function shouldAdvanceMovePhase(timeLeftMs: number, skipPressed: boolean): boolean {
  return skipPressed || timeLeftMs <= 0;
}

export function shouldAdvanceActionPhase(timeLeftMs: number, skipPressed: boolean, isCharging: boolean): boolean {
  if (timeLeftMs <= 0) return true;
  if (skipPressed && !isCharging) return true;
  return false;
}

export function countdownSecondsForPhase(phase: Phase, phaseTimeLeftMs: number): number {
  if (phase === 'resolve') return 0;
  return Math.max(0, Math.ceil(phaseTimeLeftMs / 1000));
}
