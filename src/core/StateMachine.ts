import type { Phase } from './Config';

export class StateMachine {
  private phase: Phase = 'move';

  getPhase(): Phase {
    return this.phase;
  }

  setPhase(phase: Phase): void {
    this.phase = phase;
  }
}
