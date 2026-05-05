# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Vue 3 lottery/drawing web app for company year-end banquet events (尾牙抽獎系統), deployed to GitHub Pages at `https://johnnyyu0930.github.io/awoo-drawing/`. Built with Vite, TypeScript, and WindiCSS.

## Commands

```bash
pnpm install        # install dependencies
pnpm dev            # dev server at http://localhost:8888
pnpm build          # type-check (vue-tsc) then Vite build
pnpm preview        # preview the production build
```

There are no tests. The build command runs `vue-tsc && vite build` — TypeScript errors will fail the build.

## Architecture

The app is a single-page Vue 3 application with a simple manual router using a `pageState` ref in `App.vue`. There is no Vue Router.

### Page flow

```
init → loading (5s timer) → result → init (loop)
                                ↕
                             record
```

- **`App.vue`** — owns all shared state (`awards`, `headcount`, `nameList`, `winners`) and the `pageState` switcher. Orchestrates transitions between pages.
- **`InitPage.vue`** — input form; receives props via `v-model` bindings and emits `start` / `goRecord`.
- **`LoadingPage.vue`** — plays `loading-music.mp3` from `/public`; shown for 5 seconds while the draw runs (the actual draw result is computed in `App.vue` after the timeout).
- **`ResultPage.vue`** — displays winners; emits `next` to loop back to init, plays `result-music.mp3`.
- **`RecordPage.vue`** — reads and clears the localStorage history via Lockr; emits `back`.
- **`src/libs/libs.ts`** — single exported function `drawing(list, count)` that shuffles with lodash and splices winners.

### State persistence

Past draws are stored in `localStorage` under the key `awardsStore` (an array of `{ awards, winners }`) using the **Lockr** wrapper. After each draw, `App.vue` pushes the result and removes winners from the name list using lodash `xor`.

### Styling

WindiCSS (Windi CSS, not Tailwind) with a custom theme defined in `windi.config.ts`:
- **Colors**: `bg` (#FFEFEF), `red` (#CD0000), `secondary-80` (#4E4C4C), `secondary-100` (#222222)
- **Breakpoints**: `2xl` = 1729px, `3xl` = 1920px (non-standard, larger than typical)
- Scrollbar plugin from `@windicss/plugin-scrollbar` is active.

Use WindiCSS utility classes, not Tailwind — they differ in some utilities and the JIT scanning behavior.

### Deployment

Merging to `master` triggers the GitHub Actions workflow (`.github/workflows/deploy.yml`) which builds and pushes `./dist` to `gh-pages`. The Vite `base` is set to `/awoo-drawing/`.

## Slack avatars on the loading screen

`LoadingPage.vue` renders each name as a "lottery ball" with an avatar. Avatars come from `public/slack-avatars.json` (a `{ "name": "image_url" }` map). Names not in the map fall back to a gradient + initials placeholder rendered by `src/libs/avatar.ts`.

To refresh the map:
- Local: `SLACK_BOT_TOKEN=xoxb-... pnpm sync-avatars` (token needs `users:read` scope).
- Automated: the `Sync Slack avatars` workflow (`.github/workflows/sync-slack-avatars.yml`) runs weekly and on manual dispatch, requires the `SLACK_BOT_TOKEN` repo secret, and commits any change directly to `master` (which then redeploys via `deploy.yml`).

The script keys each avatar by `real_name`, `display_name`, and Slack handle, so most name-list shapes match.

## Updating the title banner image

Per the README workflow:
1. Place the new image in `src/assets/`
2. Update the `src` attribute in `src/components/InitPage.vue` (the `<img>` in the `<header>`)
3. Bump `version` in `package.json`
4. Commit and open a PR to `master`
