# My 2D Portfolio

My interactive 2D portfolio experience built as a pixel-art game. Visitors navigate a character through a room and click on objects to learn about me through dialogue boxes.

**Live demo:** https://mycv2d.web.app/

## How it works

Use your mouse to move the character around the room. Click and hold to walk toward your cursor. Interact with objects in the room to read dialogue — the PC, bookshelf, resume, projects info, and more.

## Tech stack

- [Kaboom.js](https://kaboomjs.com/) — JavaScript game engine
- [Vite](https://vitejs.dev/) — Build tool
- [Tiled](https://www.mapeditor.org/) — Map editor (for `public/map.json`)
- [Firebase Hosting](https://firebase.google.com/products/hosting) — Deployment

## Getting started

```bash
npm install
npm run dev      # Dev server at http://localhost:3050
npm run build    # Production build → dist/
npm run preview  # Preview production build locally
```

## Project structure

```
src/
  main.js         # Game scene, player, input, camera, collision
  kaboomCtx.js    # Kaboom instance setup
  constant.js     # Scale factor and all dialogue content
  utils.js        # displayDialogue() and setCamScale() helpers
public/
  map.json        # Tiled map — boundaries and spawnpoints
  spritesheet.png # Character sprite sheet
  map.png         # Room background
```

## Adding a new interactive object

1. Add a named object to the `boundaries` layer in `public/map.json` using Tiled.
2. Add a matching entry in `dialogueData` in `src/constant.js` — HTML content is supported.

## Deployment

Pushes to `main` automatically build and deploy to Firebase via GitHub Actions. Requires a `FIREBASE_TOKEN` secret in the repository settings.
