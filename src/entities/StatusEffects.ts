import type { Worm } from './Worm';

export type StatusKind = 'poison' | 'stun' | 'slip';

export type StatusInstance = {
  kind: StatusKind;
  endAtMs: number;
  dps?: number;
  nextTickMs?: number;
};

export function addStatus(worm: Worm, status: StatusInstance): void {
  worm.statuses.push(status);
}

export function tickStatuses(
  worm: Worm,
  nowMs: number,
  onDamage: (amount: number) => void,
  onBubble: () => void
): void {
  worm.slipFactor = 1;
  worm.statuses = worm.statuses.filter((s) => s.endAtMs > nowMs);
  worm.statuses.forEach((status) => {
    if (status.kind === 'poison') {
      if (!status.nextTickMs || nowMs >= status.nextTickMs) {
        status.nextTickMs = nowMs + 1000;
        onDamage(status.dps ?? 4);
        onBubble();
      }
    } else if (status.kind === 'stun') {
      worm.stunUntilMs = Math.max(worm.stunUntilMs, status.endAtMs);
    } else if (status.kind === 'slip') {
      worm.slipFactor = 0.55;
    }
  });
}
