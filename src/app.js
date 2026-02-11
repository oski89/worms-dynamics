import {
  GRID_SIZE,
  createInitialState,
  setDirection,
  step,
  togglePause
} from "./gameLogic.js";

const TICK_MS = 140;
const canvas = document.getElementById("board");
const context = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const statusEl = document.getElementById("status");
const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restartBtn");

let state = createInitialState();

function render() {
  const cell = canvas.width / GRID_SIZE;

  context.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid(cell);

  context.fillStyle = getCssVar("--food", "#c62828");
  context.fillRect(state.food.x * cell, state.food.y * cell, cell, cell);

  context.fillStyle = getCssVar("--snake", "#2b7a0b");
  state.snake.forEach((segment) => {
    context.fillRect(segment.x * cell, segment.y * cell, cell, cell);
  });

  scoreEl.textContent = String(state.score);

  if (state.isGameOver) {
    statusEl.textContent = "Game over";
    pauseBtn.textContent = "Pause";
  } else if (state.isPaused) {
    statusEl.textContent = "Paused";
    pauseBtn.textContent = "Resume";
  } else {
    statusEl.textContent = "Running";
    pauseBtn.textContent = "Pause";
  }
}

function drawGrid(cell) {
  context.strokeStyle = getCssVar("--grid", "#efefef");
  context.lineWidth = 1;

  for (let i = 0; i <= GRID_SIZE; i += 1) {
    const p = i * cell;

    context.beginPath();
    context.moveTo(p, 0);
    context.lineTo(p, canvas.height);
    context.stroke();

    context.beginPath();
    context.moveTo(0, p);
    context.lineTo(canvas.width, p);
    context.stroke();
  }
}

function tick() {
  state = step(state);
  render();
}

setInterval(tick, TICK_MS);
render();

window.addEventListener("keydown", (event) => {
  const direction = keyToDirection(event.key);

  if (direction) {
    event.preventDefault();
    state = setDirection(state, direction);
    return;
  }

  if (event.key === " ") {
    event.preventDefault();
    state = togglePause(state);
    render();
  }
});

document.querySelectorAll(".dir").forEach((button) => {
  button.addEventListener("click", () => {
    const direction = button.getAttribute("data-dir");
    state = setDirection(state, direction);
  });
});

pauseBtn.addEventListener("click", () => {
  state = togglePause(state);
  render();
});

restartBtn.addEventListener("click", () => {
  state = createInitialState();
  render();
});

function keyToDirection(key) {
  switch (key.toLowerCase()) {
    case "arrowup":
    case "w":
      return "up";
    case "arrowdown":
    case "s":
      return "down";
    case "arrowleft":
    case "a":
      return "left";
    case "arrowright":
    case "d":
      return "right";
    default:
      return null;
  }
}

function getCssVar(name, fallback) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}
