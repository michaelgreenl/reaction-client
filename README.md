# Reaction Client

> A Vue 3/Pinia reaction-time game with configurable target behavior, saved scores, profile history, GSAP transitions, and an Express/PostgreSQL API.

[![Vue.js](https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D)](https://vuejs.org/) [![Pinia](https://img.shields.io/badge/Pinia-F1C40F?style=for-the-badge&logo=pinia&logoColor=black)](https://pinia.vuejs.org/) [![GSAP](https://img.shields.io/badge/GSAP-88CE02?style=for-the-badge&logo=greensock&logoColor=white)](https://greensock.com/) [![Sass](https://img.shields.io/badge/Sass-CC6699?style=for-the-badge&logo=sass&logoColor=white)](https://sass-lang.com/)

## Quick Links

- 🌐 **[Live Site](https://trainreaction.gg)**
- **⚙ [Backend Repository](https://github.com/michaelgreenl/reaction-api)**
- **💼 [Portfolio Link](https://michaelgreenl.net/#projects?slug=reaction&autoplay=false)**

## Demo Video

<p align="center">
  <a href="https://vimeo.com/1149531486">
    <img src="https://i.vimeocdn.com/filter/overlay?src0=https%3A%2F%2Fi.vimeocdn.com%2Fvideo%2F2171069670-31a24325e59332df9de457b603a1d5bd318ed9e4aebacd7fcea042f970968b00-d_1280%3Fregion%3Dus&amp;src1=http%3A%2F%2Ff.vimeocdn.com%2Fp%2Fimages%2Fcrawler_play.png" alt="Watch the Reaction demo video" width="800">
  </a>
</p>

## Overview

Reaction is an interactive game where players register or log in, tune circle size, spawn interval, and shrink time, then click randomly placed shrinking targets before one expires.

The client stores session state, recent games, aggregate stats, and saved settings in Pinia. The API uses Express, Sequelize, PostgreSQL, bcrypt, and JWT cookies to create users, persist settings, save game results, and update profile stats.

## Features

- Configurable game settings for circle size, spawn interval, and shrink time, saved through `/settings` for logged-in users.
- A timed game loop that starts after a three-second countdown, updates elapsed time every 10ms, and ends when an active target finishes shrinking.
- Recent scores on the game screen for authenticated users, limited to the five latest saved games.
- Profile history with paginated game results, sortable score/time/date columns, optional settings columns, and filters for saved circle size, spawn interval, and shrink time.
- Registration hashes passwords with bcrypt and creates stats/settings records; login sets an HTTP-only JWT cookie from the Express API.
- Game persistence that stores score, elapsed time, and per-game settings, then updates total games, high score, and longest time.
- GSAP and Flip animations extracted into `useGameAnimations`, `useProfileAnimations`, `useUtilAnimations`, and `useGsap` composables.

## Technical Details

- Vue Router exposes `/game`, `/login`, `/register`, and authenticated `/profile` routes.
- `api.js` wraps `fetch` with `credentials: 'include'`, JSON headers, and API error parsing.
- `authStore` manages session checks, login/logout, stats, recent games, game creation, and filtered game history.
- `settingsStore` manages circle size, spawn interval, shrink time, and `/settings` reads/writes.
- `useBreakpoints` drives viewport-specific UI behavior, including recent-score/settings panel collisions on mobile.
- The backend exposes `/users`, `/game`, `/stats`, and `/settings` routes with Sequelize models for users, games, stats, and settings.
- Static client deployment is handled by `gh-pages -d dist` through `npm run deploy`.

## Run Locally

```sh
npm install
npm run dev
```

The client reads the API origin from `VITE_API_URL`.

The API runs from the sibling backend project:

```sh
cd ../reaction-api
npm install
npm run dev
```

## Project Scripts

- `npm run build` builds the Vite client.
- `npm run preview` serves the production build.
- `npm run lint` runs ESLint.
- `npm run lint:style` runs Stylelint on Vue, CSS, and SCSS files.
- `npm run format` runs the Prettier check.
- `npm run test:unit` runs Vitest.
- `npm run test:e2e` runs Playwright.

## Tech Stack

- **Framework:** Vue 3, Vite, Vue Router
- **State:** Pinia
- **Styling:** Sass (SCSS)
- **Animation:** GSAP, Flip
- **API:** Express, Sequelize, PostgreSQL
- **Auth:** bcrypt, JWT cookies
- **Quality:** ESLint, Stylelint, Prettier, Vitest, Playwright
- **Deploy:** GitHub Pages
