# Power Market Solver

An interactive, browser-based game for learning how electricity markets work. The game introduces merit-order dispatch, LMP pricing, congestion, transmission limits, reserves, unit commitment, continuous offer curves, probability forecasts, and day-ahead scheduling.

## Run locally

Because the game is dependency-free, you can serve it with any static web server. For example:

```powershell
python -m http.server 4173
```

Then open `http://127.0.0.1:4173/`.

Opening `index.html` directly also works in most browsers, but a local static server is recommended for a browser-like deployment environment.

## Deploy

This repository contains only the game. The dashboard and its live-data proxy are intentionally not part of this project.

### GitHub Pages

1. Open the repository's Settings → Pages.
2. Set the publishing source to GitHub Actions.
3. Push to `main`.

The workflow in `.github/workflows/pages.yml` publishes the repository root. The game will be available at:

`https://<username>.github.io/<repository>/`

### Vercel

Import the repository into Vercel, choose the static/other project type, leave the build command empty, and use the repository root as the output directory. Vercel will serve `index.html` as the site entry point.

## Progress and theme

Level progress, saved inputs, and the light/night theme are stored in browser `localStorage`. Progress is local to each browser and does not automatically transfer between localhost, GitHub Pages, Vercel, or different devices.

## Project files

- `index.html` — game markup and entry point
- `game.js` — levels, market calculations, interactions, and saved progress
- `game.css` — game styling and responsive layout
- `ui-polish.js` — consistent control labels, definition access, numeric inputs, and result presentation

## Teaching model and review checks

Level 0 in each mode starts an anchored terminology guide once. The question-mark
button and Definitions menu reopen it on any level. Each card defines one term;
Previous and Next navigate, and the close button exits the guide. Guide history
is saved separately from scored progress.

Day-ahead curves clear against buyer value using continuous marginal offers.
Intersecting offers are compared at their marginal output, rather than filling a
whole generator based on its starting price. Higher-level rising segments use
simple $1 or $2 per MW slopes. Forecast renewable availability uses weighted means;
firm resources retain their full capacity. Reserve choices in advanced lessons
use 5 MW increments. Commitment is constant over the displayed hours, startup is
charged once, and reserve availability is charged each hour. These are explicit
teaching assumptions, not a full reproduction of ERCOT operations.

Construction uses a lossless transport model, with preset flows and capacity
constraints. Reliability levels check the named outage, not all N-1 contingencies.
LMP exercises use marginal redispatch paths; at a boundary that prevents any
additional service, the model uses the left marginal value. Linear supply curves
in the network solver use 0.1 MW integration blocks. Price answers are displayed
to one decimal place. CRR labels are context; a payout is not required to solve
the existing LMP exercises.

Run `node tests/market-model.test.cjs` for analytical crossing-curve, bid-clearing,
reference-level, empty-schedule, and multi-hour checks. Browser checks use
Playwright and installed Edge: `node tests/browser-review.cjs`. Set
`PLAYWRIGHT_MODULE` if Playwright is provided by an external runtime.

Run `node scripts/preview.cjs` to review the game at http://127.0.0.1:8765.
