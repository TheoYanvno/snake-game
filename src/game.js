// Snake game rules with no DOM code, so they can be tested in Node.
// The board is a grid of cells; the snake is a list of cells, head first.

export const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' };

/**
 * A new game: a 3-cell snake in the middle of the board heading right, plus one piece of food.
 * With walls: false the board wraps around, so leaving one edge brings the snake in on the other side.
 */
export function createGame({ width = 20, height = 20, rand = Math.random, walls = true } = {}) {
  const cx = Math.floor(width / 2);
  const cy = Math.floor(height / 2);
  const snake = [{ x: cx, y: cy }, { x: cx - 1, y: cy }, { x: cx - 2, y: cy }];
  const game = {
    width,
    height,
    snake,
    direction: 'right',
    queue: [],            // turns pressed since the last step, so quick presses aren't lost
    food: null,
    score: 0,
    over: false,
    won: false,
    walls,
    rand,
  };
  game.food = placeFood(game);
  return game;
}

/** Picks a random empty cell for the food, or null when the snake fills the board. */
export function placeFood(game) {
  const taken = new Set(game.snake.map(key));
  const free = [];
  for (let y = 0; y < game.height; y++) {
    for (let x = 0; x < game.width; x++) if (!taken.has(`${x},${y}`)) free.push({ x, y });
  }
  if (free.length === 0) return null;
  return free[Math.floor(game.rand() * free.length)];
}

/**
 * Queues a turn. Ignores a reverse into the snake's own body and repeats of the same direction.
 * Up to 2 turns are kept, so pressing up then left quickly makes a tight U-turn.
 */
export function turn(game, name) {
  if (!DIRECTIONS[name] || game.over) return false;
  const last = game.queue.at(-1) ?? game.direction;
  if (name === last || name === OPPOSITE[last] || game.queue.length >= 2) return false;
  game.queue.push(name);
  return true;
}

/** Moves the snake one cell. Returns what happened: 'move', 'eat', 'crash' or 'win'. */
export function step(game) {
  if (game.over) return 'crash';
  if (game.queue.length) game.direction = game.queue.shift();
  const d = DIRECTIONS[game.direction];
  let head = { x: game.snake[0].x + d.x, y: game.snake[0].y + d.y };
  if (!game.walls) head = wrap(game, head);
  const eating = game.food && head.x === game.food.x && head.y === game.food.y;

  // The tail moves out of the way this step unless the snake is growing, so it doesn't count as a hit.
  const body = eating ? game.snake : game.snake.slice(0, -1);
  if (outside(game, head) || body.some((c) => c.x === head.x && c.y === head.y)) {
    game.over = true;
    return 'crash';
  }

  game.snake.unshift(head);
  if (!eating) {
    game.snake.pop();
    return 'move';
  }
  game.score += 1;
  game.food = placeFood(game);
  if (!game.food) {
    game.over = true;
    game.won = true;
    return 'win';
  }
  return 'eat';
}

/** Milliseconds between steps: each level is faster, and the snake speeds up a little every 5 points. */
export const SPEEDS = { slow: 170, normal: 120, fast: 80 };
export function tickMs(level, score) {
  const base = SPEEDS[level] ?? SPEEDS.normal;
  return Math.max(45, base - Math.floor(score / 5) * 5);
}

const key = (c) => `${c.x},${c.y}`;
const wrap = (game, c) => ({ x: (c.x + game.width) % game.width, y: (c.y + game.height) % game.height });
const outside = (game, c) => c.x < 0 || c.y < 0 || c.x >= game.width || c.y >= game.height;
