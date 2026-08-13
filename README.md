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
