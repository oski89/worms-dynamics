import type { WeaponConfig } from './schema';

export class WeaponRegistry {
  private byId = new Map<string, WeaponConfig>();
  private sorted: WeaponConfig[] = [];

  load(configs: WeaponConfig[]): void {
    this.byId.clear();
    this.sorted = configs;
    configs.forEach((config) => this.byId.set(config.id, config));
  }

  get(id: string): WeaponConfig {
    const found = this.byId.get(id);
    if (!found) throw new Error(`Unknown weapon id: ${id}`);
    return found;
  }

  all(): WeaponConfig[] {
    return this.sorted;
  }
}
