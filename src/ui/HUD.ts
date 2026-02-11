import type { Worm } from '../entities/Worm';

export class HUD {
  readonly root: HTMLDivElement;
  private turnEl: HTMLDivElement;
  private phaseEl: HTMLDivElement;
  private announcerEl: HTMLDivElement;
  private hpEl: HTMLDivElement;
  private powerEl: HTMLDivElement;
  private timerEl: HTMLDivElement;

  constructor() {
    this.root = document.createElement('div');
    this.root.className = 'hud';

    this.turnEl = document.createElement('div');
    this.phaseEl = document.createElement('div');
    this.hpEl = document.createElement('div');
    this.powerEl = document.createElement('div');
    this.timerEl = document.createElement('div');
    this.announcerEl = document.createElement('div');
    this.announcerEl.className = 'announcer';

    this.root.append(this.turnEl, this.phaseEl, this.hpEl, this.powerEl, this.timerEl, this.announcerEl);
  }

  update(turn: number, phase: string, activeWorm: Worm | null, power: number, actionSecondsLeft: number, announcer: string): void {
    this.turnEl.textContent = `Turn ${turn}`;
    this.phaseEl.textContent = `Phase: ${phase}`;
    this.hpEl.textContent = activeWorm ? `Active HP: ${Math.max(0, Math.round(activeWorm.hp))}` : 'No active worm';
    this.powerEl.textContent = `Power: ${Math.round(power * 100)}%`;
    this.timerEl.textContent = `Action Time: ${Math.max(0, actionSecondsLeft).toFixed(1)}s`;
    this.announcerEl.textContent = announcer;
  }
}
