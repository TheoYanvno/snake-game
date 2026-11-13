# Two by Two: Snake

**▶ [Play it](https://theoyanvno.github.io/snake-game/)**

The classic Snake game with a Noah's ark theme: steer the ark, gather the animals two by two, and each pair joins the line behind you. Don't run into the walls or your own line. Works with a keyboard on a computer and with swipes or on-screen buttons on a phone.

**Tech:** vanilla JavaScript (ES modules) · HTML5 Canvas · CSS · `localStorage` · `node:test` · no frameworks or build step

| Desktop | Phone |
|---|---|
| ![The ark leading a long line of animals across a grassy board, with a pair of deer waiting to be gathered](docs/desktop.png) | ![The game on a phone with the direction pad](docs/phone.png) |

## Features

- **Noah's ark theme:** the ark leads the line, starting with a pair of doves; every pair you gather (sheep, cows, elephants, lions, camels and more) joins it, and the score counts pairs
- **Verses from Genesis 6 to 9** on the start, pause and game-over screens, from the World English Bible (public domain), each linking to its chapter in [SuperBook](https://theoyanvno.github.io/SuperBook/)
- **Controls:** arrow keys or WASD; on a phone, swipe on the board or use the direction pad
- **Speed levels:** slow, normal and fast, and the snake speeds up a little every 5 points
- **No-walls mode:** turn off Walls and the snake wraps around to the other side (the board gets a dashed edge)
- **Best score** for each speed level and mode, saved in the browser
- **Pause** with Space, P or the Pause button; the game also pauses itself when you switch tabs
- Quick turns are queued, so pressing two directions fast makes a tight U-turn instead of losing a key press
- Sharp on high-resolution screens (the canvas is drawn at the device's pixel density)

## How it works

| File | What it does |
|---|---|
| [`src/game.js`](src/game.js) | The rules, with no browser code: moving, turning, eating, growing, collisions, wrapping, food placement and speed |
| [`src/app.js`](src/app.js) | Drawing on the canvas (the ark, the animals and the waiting pair), the game loop, keyboard and touch input, pause and best scores |
| [`src/theme.js`](src/theme.js) | The ark theme: which animal is where in the line, the verses and the SuperBook links |
| [`test/game.test.js`](test/game.test.js), [`test/theme.test.js`](test/theme.test.js) | 15 tests for the rules and the theme |

Keeping the rules separate from the drawing makes them easy to test. A few details the tests cover:

- A turn straight back into the body is ignored, checked against the last *queued* turn, not just the current direction
- The snake may move into the cell its tail is leaving on the same step
- Food is only placed on empty cells, and filling the whole board is a win
- With walls off, the head wraps with modulo arithmetic (`(x + width) % width`), but hitting your own body still ends the game

The game loop uses `setTimeout` with a delay from `tickMs(level, score)`, so the speed can change as the score goes up.

## Run it

No install needed. Serve the folder (ES modules don't load from `file://`):

```bash
npm start      # python3 -m http.server 8000, then open http://localhost:8000
npm test       # 13 tests (Node 18+)
```

Built with help from AI coding tools for planning, code review and tests.

## License

MIT. See [LICENSE](LICENSE).
