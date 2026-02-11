import type { WeaponConfig, WeaponFile } from './schema';
import { validateWeapon } from './validator';

export function parseWeaponFile(file: unknown): WeaponConfig[] {
  if (!file || typeof file !== 'object' || !Array.isArray((file as WeaponFile).weapons)) {
    console.warn('[weapons] weapon file malformed. Expected { weapons: [] }.');
    return [];
  }

  const entries = (file as WeaponFile).weapons;
  const configs: WeaponConfig[] = [];
  entries.forEach((entry) => {
    const valid = validateWeapon(entry);
    if (valid) configs.push(valid);
  });
  return configs;
}

export async function loadWeapons(): Promise<WeaponConfig[]> {
  const module = await import('./data/weapons.json');
  return parseWeaponFile(module.default ?? module);
}
