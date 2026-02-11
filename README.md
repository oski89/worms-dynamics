# Snake Game

Minimal classic Snake implementation with:
- Grid movement
- Food spawning
- Growth + score
- Game-over on wall/self collision
- Pause + restart

## Run

1. From `/Users/oski/Documents/codex/test-project`, run:
   `python3 -m http.server 8000`
2. Open `http://localhost:8000` in your browser.

## Controls

- Keyboard: Arrow keys or `W/A/S/D`
- Pause/resume: `Space` or `Pause` button
- Restart: `Restart` button
- On-screen directional buttons are available for touch/mobile.

## Manual Verification Checklist

- Move with arrows/WASD; snake advances one grid cell per tick.
- Direction reversal (e.g., right -> left immediately) is blocked.
- Eating food increases score by 1 and increases snake length.
- Controls invert for scores 5-9, return to normal for 10-14, and continue toggling every 5 points.
- Food never spawns on the snake body.
- Hitting any boundary ends the game.
- Hitting snake body ends the game.
- Pause stops movement; resume continues from current state.
- Restart resets score, snake position, and game-over status.

## Notes on Tests

No test runner/tooling existed in this repo, so no automated tests were added.
Core logic is isolated in `src/gameLogic.js` for deterministic testing when a test setup is introduced.
