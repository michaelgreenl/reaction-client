# Reaction API

> Backend for Reaction, a Vue 3/Pinia reaction-time game with configurable target size, spawn speed, score history, profile stats, GSAP transitions, and PostgreSQL persistence.

[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/) [![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/) [![Sequelize](https://img.shields.io/badge/Sequelize-52B0E7?style=for-the-badge&logo=sequelize&logoColor=white)](https://sequelize.org/) [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

## Quick Links

- **🌐 [Live Site](https://trainreaction.gg)**
- **🖥️ [Frontend Repository](https://github.com/michaelgreenl/reaction-client)**
- **💼 [Portfolio Link](https://michaelgreenl.net/#projects?slug=reaction&autoplay=false)**

## Demo Video

<p align="center">
  <a href="https://vimeo.com/1149531486">
    <img src="https://i.vimeocdn.com/filter/overlay?src0=https%3A%2F%2Fi.vimeocdn.com%2Fvideo%2F2171069670-31a24325e59332df9de457b603a1d5bd318ed9e4aebacd7fcea042f970968b00-d_1280%3Fregion%3Dus&amp;src1=http%3A%2F%2Ff.vimeocdn.com%2Fp%2Fimages%2Fcrawler_play.png" alt="Watch the Reaction demo video" width="800">
  </a>
</p>

## Overview

Reaction is an interactive reaction-time game backed by this Node.js/Express API. The Vue client spawns clickable circles, tracks score and elapsed time, lets players tune `circleSize`, `spawnInterval`, and `shrinkTime`, and sends completed games to the API with a snapshot of the settings used for that run.

Authenticated players can view recent scores in the game screen and profile history with sorting, pagination, and setting-based filters. The API persists users, settings, aggregate stats, and game history in PostgreSQL through Sequelize models and repository modules.

## Technical Highlights

**Configurable Gameplay:** The Vue `settingsStore` drives target size, spawn interval, and shrink duration. `Settings.vue` saves those values through `/settings`, and `GameView.vue` posts completed game results to `/game`.

**Persisted Game History:** The `Game` model stores `score`, `time`, and a JSONB `settings` snapshot. `/game` supports `limit`, `offset`, `sortedBy`, and `sortedOrder`; `/game/filter/settings` filters history by saved setting values.

**Auth and Session Handling:** Registration hashes passwords with `bcrypt`; login signs a 24-hour JWT and stores it in an HTTP-only cookie. The Vue API helper sends requests with `credentials: 'include'`.

**Request Controls:** The Express config applies Helmet, CORS with credentials, JSON content-type validation, a global rate limiter, a slow-down limiter, and a stricter limiter on registration/login routes.

**GSAP-Driven Transitions:** The frontend keeps animation logic in composables such as `useGameAnimations`, `useProfileAnimations`, and `useUtilAnimations`, including GSAP timelines and Flip transitions for game/profile state changes.

**Repository Layer:** Controllers delegate Sequelize reads/writes to `src/db/repositories`, keeping HTTP handlers separate from database queries.

## Architecture & Design Decisions

**Account Provisioning:** `user.controller.js` creates default `Stats` and `Settings` rows after a user is registered, so a new account can immediately load gameplay settings and profile stats.

**Small App Entry Point:** `src/app.js` creates the Express app, applies the shared config array, and exports the app for `server.js` to sync Sequelize and start listening.

## Run Locally

- `npm install`
- `docker compose up -d postgres`
- `npm run dev`

The API loads environment values from `.env.${NODE_ENV || 'development'}` and reads database, JWT, and frontend-origin settings from `sequelize.config.js`, `src/util/jwt.util.js`, and `src/config/cors.config.js`.

## Scripts

- `npm run dev` starts the API with Nodemon.
- `npm start` starts the API with Node.
- `npm run lint` runs ESLint.
- `npm run format` checks Prettier formatting.
- `npm test` is still the package placeholder and exits with an error.

## Tech Stack

- **Client:** Vue 3, Pinia, Vue Router, GSAP, Sass, Vite
- **API:** Node.js, Express.js
- **Database:** PostgreSQL, Sequelize ORM
- **Local Infrastructure:** Docker Compose
- **Tooling:** ESLint, Prettier, Nodemon
