import { VirtualJoystick } from './VirtualJoystick';

export type MobileState = {
  moveX: number;
  aimDeltaY: number;
  firePressed: boolean;
  fireHeld: boolean;
  fireReleased: boolean;
  fireHoldMs: number;
  endTurnPressed: boolean;
};

export class MobileControls {
  readonly root: HTMLDivElement;
  private joystick = new VirtualJoystick();
  private fireDownAt = 0;
  private state: MobileState = {
    moveX: 0,
    aimDeltaY: 0,
    firePressed: false,
    fireHeld: false,
    fireReleased: false,
    fireHoldMs: 0,
    endTurnPressed: false
  };

  constructor() {
    this.root = document.createElement('div');
    this.root.className = 'mobile-controls';

    const leftPad = document.createElement('div');
    leftPad.className = 'left-pad';
    leftPad.textContent = 'Move';

    const rightPad = document.createElement('div');
    rightPad.className = 'right-pad';
    rightPad.textContent = 'Aim';

    const fire = document.createElement('button');
    fire.className = 'fire-btn';
    fire.textContent = 'Fire';

    const endTurn = document.createElement('button');
    endTurn.className = 'end-btn';
    endTurn.textContent = 'End Turn';

    this.root.append(leftPad, rightPad, fire, endTurn);

    leftPad.addEventListener('pointerdown', (e) => {
      this.joystick.begin(e.pointerId, e.clientX, e.clientY);
      leftPad.setPointerCapture(e.pointerId);
    });
    leftPad.addEventListener('pointermove', (e) => {
      this.joystick.move(e.pointerId, e.clientX, e.clientY);
      this.state.moveX = this.joystick.axisX();
    });
    leftPad.addEventListener('pointerup', (e) => {
      this.joystick.end(e.pointerId);
      this.state.moveX = 0;
    });

    let rightPointer: number | null = null;
    let lastY = 0;
    rightPad.addEventListener('pointerdown', (e) => {
      rightPointer = e.pointerId;
      lastY = e.clientY;
      rightPad.setPointerCapture(e.pointerId);
    });
    rightPad.addEventListener('pointermove', (e) => {
      if (rightPointer !== e.pointerId) return;
      const dy = e.clientY - lastY;
      this.state.aimDeltaY = -dy * 0.65;
      lastY = e.clientY;
    });
    rightPad.addEventListener('pointerup', (e) => {
      if (rightPointer !== e.pointerId) return;
      rightPointer = null;
      this.state.aimDeltaY = 0;
    });

    fire.addEventListener('pointerdown', () => {
      this.state.fireHeld = true;
      this.state.firePressed = true;
      this.state.fireReleased = false;
      this.fireDownAt = performance.now();
      this.state.fireHoldMs = 0;
    });
    fire.addEventListener('pointerup', () => {
      this.state.fireHeld = false;
      this.state.fireReleased = true;
      this.state.fireHoldMs = performance.now() - this.fireDownAt;
    });

    endTurn.addEventListener('click', () => {
      this.state.endTurnPressed = true;
    });
  }

  consumeState(): MobileState {
    const snapshot = { ...this.state };
    this.state.firePressed = false;
    this.state.fireReleased = false;
    this.state.endTurnPressed = false;
    this.state.aimDeltaY = 0;
    return snapshot;
  }
}
