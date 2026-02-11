export class PauseMenu {
  readonly root: HTMLDivElement;
  private checkbox: HTMLInputElement;
  private pausedLabel: HTMLDivElement;

  constructor(onRidiculousness: (enabled: boolean) => void) {
    this.root = document.createElement('div');
    this.root.className = 'pause-menu';
    this.root.innerHTML = '<h3>Settings</h3>';

    const row = document.createElement('label');
    row.className = 'toggle-row';
    row.textContent = 'Ridiculousness';

    this.checkbox = document.createElement('input');
    this.checkbox.type = 'checkbox';
    this.checkbox.checked = true;
    row.appendChild(this.checkbox);

    this.pausedLabel = document.createElement('div');
    this.pausedLabel.className = 'paused-label';
    this.pausedLabel.textContent = 'PAUSED';

    this.root.append(row, this.pausedLabel);
    this.checkbox.addEventListener('change', () => onRidiculousness(this.checkbox.checked));
  }

  setPaused(paused: boolean): void {
    this.root.classList.toggle('show', paused);
  }
}
