export const GRID_SIZE = 20;

export function createInitialState(rng = Math.random) {
  const center = Math.floor(GRID_SIZE / 2);
  const snake = [
    { x: center, y: center },
    { x: center - 1, y: center },
    { x: center - 2, y: center }
  ];

  return {
    snake,
    direction: "right",
    pendingDirection: "right",
    food: spawnFood(snake, rng),
    score: 0,
    isGameOver: false,
    isPaused: false
  };
}

export function setDirection(state, nextDirection) {
  if (!isDirection(nextDirection) || isOpposite(state.direction, nextDirection)) {
    return state;
  }
  return {
    ...state,
    pendingDirection: nextDirection
  };
}

export function togglePause(state) {
  if (state.isGameOver) {
    return state;
  }
  return {
    ...state,
    isPaused: !state.isPaused
  };
}

export function step(state, rng = Math.random) {
  if (state.isGameOver || state.isPaused) {
    return state;
  }

  const direction = state.pendingDirection;
  const head = state.snake[0];
  const nextHead = move(head, direction);
  const hasEaten = nextHead.x === state.food.x && nextHead.y === state.food.y;
  const collisionBody = hasEaten ? state.snake : state.snake.slice(0, -1);

  if (isWallCollision(nextHead) || isSelfCollision(nextHead, collisionBody)) {
    return {
      ...state,
      direction,
      isGameOver: true
    };
  }

  const nextSnake = [nextHead, ...state.snake];

  if (!hasEaten) {
    nextSnake.pop();
  }

  return {
    ...state,
    snake: nextSnake,
    direction,
    food: hasEaten ? spawnFood(nextSnake, rng) : state.food,
    score: hasEaten ? state.score + 1 : state.score
  };
}

export function spawnFood(snake, rng = Math.random) {
  const occupied = new Set(snake.map((segment) => toKey(segment)));
  const freeCells = [];

  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      const key = `${x},${y}`;
      if (!occupied.has(key)) {
        freeCells.push({ x, y });
      }
    }
  }

  if (freeCells.length === 0) {
    return snake[0];
  }

  const index = Math.floor(rng() * freeCells.length);
  return freeCells[index];
}

function move(head, direction) {
  switch (direction) {
    case "up":
      return { x: head.x, y: head.y - 1 };
    case "down":
      return { x: head.x, y: head.y + 1 };
    case "left":
      return { x: head.x - 1, y: head.y };
    case "right":
      return { x: head.x + 1, y: head.y };
    default:
      return head;
  }
}

function isWallCollision(point) {
  return point.x < 0 || point.y < 0 || point.x >= GRID_SIZE || point.y >= GRID_SIZE;
}

function isSelfCollision(head, snake) {
  return snake.some((segment) => segment.x === head.x && segment.y === head.y);
}

function isDirection(value) {
  return value === "up" || value === "down" || value === "left" || value === "right";
}

function isOpposite(current, next) {
  return (
    (current === "up" && next === "down") ||
    (current === "down" && next === "up") ||
    (current === "left" && next === "right") ||
    (current === "right" && next === "left")
  );
}

function toKey(point) {
  return `${point.x},${point.y}`;
}
