import type { WeaponConfig } from '../weapons/schema';

export class WeaponMenu {
  readonly root: HTMLDivElement;
  private buttons = new Map<string, HTMLButtonElement>();

  constructor(onSelect: (weaponId: string) => void) {
    this.root = document.createElement('div');
    this.root.className = 'weapon-menu';
    this.root.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const weapon = target.dataset.weaponId;
      if (weapon) onSelect(weapon);
    });
  }

  setWeapons(weapons: WeaponConfig[]): void {
    this.root.innerHTML = '';
    this.buttons.clear();
    weapons.forEach((weapon, i) => {
      const btn = document.createElement('button');
      btn.textContent = `${i + 1}. ${weapon.displayName}`;
      btn.dataset.weaponId = weapon.id;
      this.root.appendChild(btn);
      this.buttons.set(weapon.id, btn);
    });
  }

  setActive(weaponId: string): void {
    this.buttons.forEach((btn, id) => {
      btn.classList.toggle('active', id === weaponId);
    });
  }
}
