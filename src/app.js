import { createGame, step, turn, tickMs } from './game.js';

const SIZE = 20;                        // cells per side
const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const $ = (id) => document.getElementById(id);
const colors = getComputedStyle(document.documentElement);
const color = (name) => colors.getPropertyValue(name).trim();

let game = createGame({ width: SIZE, height: SIZE });
let state = 'ready';                    // ready | playing | paused | over
let timer = null;

// ---- drawing ----

function fitCanvas() {
  // Draw at the screen's real pixel density so the board stays sharp on phones
  const px = Math.round(canvas.clientWidth * devicePixelRatio);
  if (canvas.width !== px) { canvas.width = px; canvas.height = px; }
  draw();
}

function draw() {
  const cell = canvas.width / SIZE;
  ctx.fillStyle = color('--panel');
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // checkerboard so it's easy to judge distances
  ctx.fillStyle = color('--grid');
  for (let y = 0; y < SIZE; y++) {
    for (let x = (y % 2); x < SIZE; x += 2) ctx.fillRect(x * cell, y * cell, cell, cell);
  }

  if (game.food) {
    ctx.fillStyle = color('--food');
    ctx.beginPath();
    ctx.arc((game.food.x + 0.5) * cell, (game.food.y + 0.5) * cell, cell * 0.38, 0, Math.PI * 2);
    ctx.fill();
  }

  game.snake.forEach((c, i) => {
    ctx.fillStyle = i === 0 ? color('--head') : color('--snake');
    const pad = cell * 0.08;
    roundRect(c.x * cell + pad, c.y * cell + pad, cell - pad * 2, cell - pad * 2, cell * 0.25);
  });
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

// ---- game loop ----

function tick() {
  const result = step(game);
  $('score').textContent = game.score;
  draw();
  if (result === 'crash' || result === 'win') return end(result);
  timer = setTimeout(tick, tickMs('normal', game.score));
}

function start() {
  if (state === 'over' || state === 'ready') {
    game = createGame({ width: SIZE, height: SIZE });
    $('score').textContent = 0;
  }
  state = 'playing';
  $('overlay').hidden = true;
  clearTimeout(timer);
  timer = setTimeout(tick, tickMs('normal', game.score));
}

function pause() {
  if (state !== 'playing') return;
  state = 'paused';
  clearTimeout(timer);
  showOverlay('Paused', 'Resume');
}

function end(result) {
  state = 'over';
  showOverlay(result === 'win' ? `You filled the board! Score ${game.score}` : `Game over · Score ${game.score}`, 'Play again');
}

function showOverlay(message, button) {
  $('message').textContent = message;
  $('start').textContent = button;
  $('overlay').hidden = false;
  $('start').focus({ preventScroll: true });
}

// ---- keyboard ----

const KEYS = {
  ArrowUp: 'up', KeyW: 'up',
  ArrowDown: 'down', KeyS: 'down',
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
};

addEventListener('keydown', (e) => {
  if (KEYS[e.code]) {
    e.preventDefault();
    if (state === 'playing') turn(game, KEYS[e.code]);
  } else if (e.code === 'Space' || e.code === 'KeyP') {
    e.preventDefault();
    state === 'playing' ? pause() : start();
  }
});

$('start').onclick = start;
addEventListener('resize', fitCanvas);
fitCanvas();
