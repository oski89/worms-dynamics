export type GameEvent = {
  type: string;
  payload?: Record<string, unknown>;
};

export class Events {
  private listeners = new Map<string, Array<(event: GameEvent) => void>>();

  on(type: string, cb: (event: GameEvent) => void): void {
    const bucket = this.listeners.get(type) ?? [];
    bucket.push(cb);
    this.listeners.set(type, bucket);
  }

  emit(type: string, payload?: Record<string, unknown>): void {
    const bucket = this.listeners.get(type);
    if (!bucket) return;
    const evt: GameEvent = { type, payload };
    bucket.forEach((cb) => cb(evt));
  }
}
