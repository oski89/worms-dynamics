export type ChargeState = {
  charging: boolean;
  power: number;
};

export type ChargeConfig = {
  chargeRate: number;
  minPower: number;
  maxPower: number;
};

export type ChargeStepInput = {
  startPressed: boolean;
  held: boolean;
  released: boolean;
  dtMs: number;
};

export type ChargeStepOutput = {
  state: ChargeState;
  firePower: number | null;
};

export function stepCharge(state: ChargeState, input: ChargeStepInput, config: ChargeConfig): ChargeStepOutput {
  let charging = state.charging;
  let power = state.power;
  let firePower: number | null = null;

  if (input.startPressed && !charging) {
    charging = true;
    power = Math.max(config.minPower, power);
  }

  if (charging && input.held) {
    power = Math.min(config.maxPower, power + config.chargeRate * (input.dtMs / 1000));
  }

  if (charging && input.released) {
    firePower = Math.max(config.minPower, Math.min(config.maxPower, power));
    charging = false;
    power = 0;
  }

  return {
    state: { charging, power },
    firePower
  };
}
