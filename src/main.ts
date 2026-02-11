import './styles.css';
import { Game } from './core/Game';

const root = document.getElementById('app');
if (!root) throw new Error('Missing #app root');

const gameRoot = document.createElement('div');
gameRoot.className = 'game-root';
root.appendChild(gameRoot);

const game = new Game(gameRoot);
game.init().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
});
