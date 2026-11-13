import { createGame, step, turn, tickMs } from './game.js';
import { animalFor, nextPair, VERSES, superBook } from './theme.js';

const SIZE = 20;                        // cells per side
const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const $ = (id) => document.getElementById(id);
const colors = getComputedStyle(document.documentElement);
const color = (name) => colors.getPropertyValue(name).trim();

let game = createGame({ width: SIZE, height: SIZE });
const newGame = () => createGame({ width: SIZE, height: SIZE, walls: $('walls').checked });
let state = 'ready';                    // ready | playing | paused | over
let timer = null;

// ---- settings and best scores (kept in this browser; storage can be blocked, so never fail on it) ----

const storage = {
  get(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } },
  set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode */ } },
};
// One best score per speed level, kept separately for walls on and off ("normal", "normal-wrap")
const level = () => $('speed').value + ($('walls').checked ? '' : '-wrap');
const bestScores = () => storage.get('snake-best', {});
const showBest = () => { $('best').textContent = bestScores()[level()] ?? 0; };

$('speed').value = storage.get('snake-speed', 'normal');
$('walls').checked = storage.get('snake-walls', true);
$('speed').onchange = () => {
  storage.set('snake-speed', $('speed').value);
  showBest();
  $('speed').blur();                    // so arrow keys steer instead of changing the speed
};
$('walls').onchange = () => {
  storage.set('snake-walls', $('walls').checked);
  canvas.classList.toggle('wrap', !$('walls').checked);
  if (state === 'ready') { game = newGame(); draw(); }
  showBest();
  $('walls').blur();
};
canvas.classList.toggle('wrap', !$('walls').checked);

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

  const emoji = (ch, cx, cy, size) => {
    ctx.font = `${size}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ch, cx, cy);
  };

  // the pair waiting to be gathered: two of the next animal
  if (game.food) {
    const pair = nextPair(game.snake.length);
    ctx.fillStyle = color('--food');
    ctx.globalAlpha = 0.25;
    ctx.beginPath();
    ctx.arc((game.food.x + 0.5) * cell, (game.food.y + 0.5) * cell, cell * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    emoji(pair, (game.food.x + 0.3) * cell, (game.food.y + 0.55) * cell, cell * 0.55);
    emoji(pair, (game.food.x + 0.72) * cell, (game.food.y + 0.45) * cell, cell * 0.55);
  }

  // the line of animals behind the ark, from the tail forward so the ark is drawn on top
  for (let i = game.snake.length - 1; i >= 1; i--) {
    const c = game.snake[i];
    emoji(animalFor(i), (c.x + 0.5) * cell, (c.y + 0.55) * cell, cell * 0.8);
  }
  if (game.snake.length) drawArk(game.snake[0], cell);
}

// The ark: a wooden hull with a little house on top.
function drawArk(c, cell) {
  const x = c.x * cell, y = c.y * cell, p = cell * 0.08;
  ctx.fillStyle = color('--head');
  ctx.beginPath();
  ctx.moveTo(x + p, y + cell * 0.52);
  ctx.lineTo(x + cell - p, y + cell * 0.52);
  ctx.lineTo(x + cell * 0.8, y + cell - p);
  ctx.lineTo(x + cell * 0.2, y + cell - p);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = color('--snake');
  ctx.fillRect(x + cell * 0.28, y + cell * 0.26, cell * 0.44, cell * 0.26);
  ctx.beginPath();
  ctx.moveTo(x + cell * 0.22, y + cell * 0.28);
  ctx.lineTo(x + cell * 0.5, y + p);
  ctx.lineTo(x + cell * 0.78, y + cell * 0.28);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = color('--panel');
  ctx.lineWidth = Math.max(1, cell * 0.04);
  ctx.beginPath();
  ctx.moveTo(x + cell * 0.18, y + cell * 0.72);
  ctx.lineTo(x + cell * 0.82, y + cell * 0.72);
  ctx.stroke();
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
  timer = setTimeout(tick, tickMs($('speed').value, game.score));
}

function start() {
  if (state === 'over' || state === 'ready') {
    game = newGame();
    $('score').textContent = 0;
  }
  state = 'playing';
  $('overlay').hidden = true;
  $('speed').disabled = true;           // changing settings mid-game would make best scores unfair
  $('walls').disabled = true;
  $('pause').setAttribute('aria-pressed', 'false');
  $('pause').textContent = 'Pause';
  clearTimeout(timer);
  timer = setTimeout(tick, tickMs($('speed').value, game.score));
}

function pause() {
  if (state !== 'playing') return;
  state = 'paused';
  clearTimeout(timer);
  $('pause').setAttribute('aria-pressed', 'true');
  $('pause').textContent = 'Resume';
  showOverlay('Paused', 'Resume', VERSES.gathered);
}

function end(result) {
  state = 'over';
  $('speed').disabled = false;
  $('walls').disabled = false;
  $('pause').textContent = 'Pause';
  const best = bestScores();
  const isBest = game.score > (best[level()] ?? 0);
  if (isBest) { best[level()] = game.score; storage.set('snake-best', best); showBest(); }
  showOverlay(result === 'win' ? `The ark is full! ${game.score} pairs gathered` : `The flood came · ${game.score} pairs gathered`, 'Play again',
    result === 'win' ? VERSES.win : VERSES.over);
  if (isBest) $('message').insertAdjacentHTML('beforeend', '<br><span class="new-best">New best score!</span>');
}

function showOverlay(message, button, verse = null) {
  $('message').textContent = message;
  $('verse').hidden = !verse;
  if (verse) {
    $('verse-text').textContent = `“${verse.text}”`;
    $('verse-ref').textContent = `${verse.ref} (WEB)`;
    $('verse-link').href = superBook(verse);
  }
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

// ---- touch: swipe on the board, or the on-screen buttons ----

let touchStart = null;
canvas.addEventListener('pointerdown', (e) => { touchStart = { x: e.clientX, y: e.clientY }; });
canvas.addEventListener('pointermove', (e) => {
  if (!touchStart) return;
  const dx = e.clientX - touchStart.x;
  const dy = e.clientY - touchStart.y;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;     // ignore small wobbles
  steer(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
  touchStart = { x: e.clientX, y: e.clientY };                 // allow a second swipe without lifting
});
addEventListener('pointerup', () => { touchStart = null; });

document.querySelectorAll('.dpad button').forEach((b) => {
  b.addEventListener('pointerdown', (e) => { e.preventDefault(); steer(b.dataset.dir); });
});

/** Steering from touch also starts the game, so phone players don't need the Start button. */
function steer(dir) {
  if (state === 'ready' || state === 'over') start();
  else if (state === 'paused') return;
  turn(game, dir);
}

$('start').onclick = start;
$('pause').onclick = () => (state === 'playing' ? pause() : state === 'paused' && start());
// Pause automatically when the player switches tabs or locks the phone
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
addEventListener('resize', fitCanvas);
showBest();
showOverlay('Lead the animals into the ark, two by two', 'Start', VERSES.start);
fitCanvas();
