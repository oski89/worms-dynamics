import { describe, expect, it } from 'vitest';
import { stepCharge } from '../core/ChargeLogic';

const config = {
  chargeRate: 1,
  minPower: 0.1,
  maxPower: 1
};

describe('charge logic', () => {
  it('holding increases power over time and release fires once', () => {
    let state = { charging: false, power: 0 };

    let out = stepCharge(state, { startPressed: true, held: true, released: false, dtMs: 100 }, config);
    state = out.state;
    expect(state.charging).toBe(true);
    expect(state.power).toBeGreaterThan(0.1);

    out = stepCharge(state, { startPressed: false, held: true, released: false, dtMs: 900 }, config);
    state = out.state;
    expect(state.power).toBeCloseTo(1, 5);

    out = stepCharge(state, { startPressed: false, held: false, released: true, dtMs: 16 }, config);
    expect(out.firePower).toBe(1);
    expect(out.state.charging).toBe(false);
    expect(out.state.power).toBe(0);

    const out2 = stepCharge(out.state, { startPressed: false, held: false, released: true, dtMs: 16 }, config);
    expect(out2.firePower).toBeNull();
  });

  it('quick tap still fires at minimum power', () => {
    const out = stepCharge(
      { charging: false, power: 0 },
      { startPressed: true, held: false, released: true, dtMs: 16 },
      config
    );

    expect(out.firePower).toBe(config.minPower);
    expect(out.state.charging).toBe(false);
  });
});
