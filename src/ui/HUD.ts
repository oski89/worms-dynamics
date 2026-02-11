import type { Worm } from '../entities/Worm';

export class HUD {
  readonly root: HTMLDivElement;
  private panelEl: HTMLDivElement;
  private turnEl: HTMLDivElement;
  private phaseEl: HTMLDivElement;
  private announcerEl: HTMLDivElement;
  private hpEl: HTMLDivElement;
  private powerEl: HTMLDivElement;
  private timerEl: HTMLDivElement;
  private countdownEl: HTMLDivElement;

  constructor() {
    this.root = document.createElement('div');
    this.root.className = 'hud-layer';

    this.panelEl = document.createElement('div');
    this.panelEl.className = 'hud';

    this.turnEl = document.createElement('div');
    this.phaseEl = document.createElement('div');
    this.hpEl = document.createElement('div');
    this.powerEl = document.createElement('div');
    this.timerEl = document.createElement('div');
    this.announcerEl = document.createElement('div');
    this.announcerEl.className = 'announcer';

    this.panelEl.append(this.turnEl, this.phaseEl, this.hpEl, this.powerEl, this.timerEl, this.announcerEl);

    this.countdownEl = document.createElement('div');
    this.countdownEl.className = 'phase-countdown';

    this.root.append(this.panelEl, this.countdownEl);
  }

  update(
    turn: number,
    phase: string,
    activeWorm: Worm | null,
    power: number,
    phaseSecondsLeft: number,
    countdownSeconds: number,
    announcer: string
  ): void {
    this.turnEl.textContent = `Turn ${turn}`;
    this.phaseEl.textContent = `Phase: ${phase}`;
    this.hpEl.textContent = activeWorm ? `Active HP: ${Math.max(0, Math.round(activeWorm.hp))}` : 'No active worm';
    this.powerEl.textContent = `Power: ${Math.round(power * 100)}%`;
    this.timerEl.textContent = `Phase Time: ${Math.max(0, phaseSecondsLeft).toFixed(1)}s`;
    this.announcerEl.textContent = announcer;

    this.countdownEl.textContent = phase === 'resolve' ? '' : String(countdownSeconds);
    this.countdownEl.classList.toggle('large', countdownSeconds <= 5);
  }
}
