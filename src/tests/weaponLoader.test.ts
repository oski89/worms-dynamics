import { describe, expect, it, vi } from 'vitest';
import { parseWeaponFile } from '../weapons/loader';

describe('weapon loader', () => {
  it('applies defaults for missing optional fields', () => {
    const loaded = parseWeaponFile({
      weapons: [
        {
          id: 'x',
          displayName: 'X',
          type: 'projectile'
        }
      ]
    });

    expect(loaded).toHaveLength(1);
    expect(loaded[0].projectileCount).toBe(1);
    expect(loaded[0].bounciness).toBe(0);
    expect(loaded[0].knockback).toBeGreaterThan(0);
  });

  it('warns for unknown fields and skips malformed critical fields', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const loaded = parseWeaponFile({
      weapons: [
        { id: 'ok', displayName: 'OK', type: 'melee', nonsense: 1 },
        { displayName: 'Bad', type: 'melee' }
      ]
    });

    expect(loaded).toHaveLength(1);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
