import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGame, step, turn, placeFood, tickMs } from '../src/game.js';

// A fixed "random" number so food lands in a predictable place
const fixed = (n) => () => n;

test('starts as a 3-cell snake heading right with food on an empty cell', () => {
  const g = createGame({ width: 10, height: 10, rand: fixed(0) });
  assert.deepEqual(g.snake, [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }]);
  assert.equal(g.direction, 'right');
  assert.ok(!g.snake.some((c) => c.x === g.food.x && c.y === g.food.y));
});

test('moves one cell per step and keeps its length', () => {
  const g = createGame({ width: 10, height: 10, rand: fixed(0) });
  assert.equal(step(g), 'move');
  assert.deepEqual(g.snake[0], { x: 6, y: 5 });
  assert.equal(g.snake.length, 3);
});

test('grows and scores when it eats', () => {
  const g = createGame({ width: 10, height: 10, rand: fixed(0) });
  g.food = { x: 6, y: 5 };
  assert.equal(step(g), 'eat');
  assert.equal(g.snake.length, 4);
  assert.equal(g.score, 1);
  assert.notDeepEqual(g.food, { x: 6, y: 5 });
});

test('ignores a turn straight back into itself', () => {
  const g = createGame({ width: 10, height: 10 });
  assert.equal(turn(g, 'left'), false);
  assert.equal(turn(g, 'up'), true);
  step(g);
  assert.equal(g.direction, 'up');
});

test('two quick turns are both kept (U-turn)', () => {
  const g = createGame({ width: 10, height: 10, rand: fixed(0) });
  g.food = { x: 0, y: 0 };
  turn(g, 'up');
  turn(g, 'left');
  step(g);
  step(g);
  assert.deepEqual(g.snake[0], { x: 4, y: 4 });
});

test('the reverse check uses the last queued turn, not the current direction', () => {
  const g = createGame({ width: 10, height: 10 });
  turn(g, 'up');
  assert.equal(turn(g, 'down'), false);
  assert.equal(turn(g, 'left'), true);
});

test('crashes into a wall', () => {
  const g = createGame({ width: 6, height: 6, rand: fixed(0) });
  g.food = { x: 0, y: 0 };
  let result;
  for (let i = 0; i < 5; i++) result = step(g);
  assert.equal(result, 'crash');
  assert.equal(g.over, true);
});

test('crashes into its own body', () => {
  const g = createGame({ width: 10, height: 10 });
  g.snake = [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 4, y: 6 }, { x: 5, y: 6 }, { x: 6, y: 6 }];
  g.direction = 'down';
  g.food = { x: 0, y: 0 };
  assert.equal(step(g), 'crash');
});

test('moving into the cell the tail is leaving is allowed', () => {
  const g = createGame({ width: 10, height: 10 });
  g.snake = [{ x: 5, y: 5 }, { x: 6, y: 5 }, { x: 6, y: 6 }, { x: 5, y: 6 }];
  g.direction = 'down';
  g.food = { x: 0, y: 0 };
  assert.equal(step(g), 'move');
});

test('food never lands on the snake, and filling the board wins', () => {
  const g = createGame({ width: 2, height: 2 });
  g.snake = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }];
  assert.deepEqual(placeFood(g), { x: 0, y: 1 });
  g.direction = 'down';
  g.food = { x: 0, y: 1 };
  assert.equal(step(g), 'win');
  assert.equal(g.won, true);
});

test('speeds up with level and score, with a floor', () => {
  assert.ok(tickMs('fast', 0) < tickMs('normal', 0));
  assert.ok(tickMs('normal', 10) < tickMs('normal', 0));
  assert.equal(tickMs('fast', 1000), 45);
});
