# Reaction API

> Backend for Reaction, a Vue 3/Pinia reaction-time game with configurable target size, spawn speed, score history, profile stats, GSAP transitions, and PostgreSQL persistence.

[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/) [![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/) [![Sequelize](https://img.shields.io/badge/Sequelize-52B0E7?style=for-the-badge&logo=sequelize&logoColor=white)](https://sequelize.org/) [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

## Quick Links

- **🌐 [Live Site](https://trainreaction.gg)**
- **🎥 [Demo Video](https://michaelgreenl.net/#projects?slug=reaction&autoplay=true)**
- **🖥️ [Frontend Repository](https://github.com/michaelgreenl/reaction-client)**
- **💼 [Portfolio Link](https://michaelgreenl.net/#projects?slug=reaction&autoplay=false)**

## Overview

Reaction is an interactive reaction-time game backed by this Node.js/Express API. The Vue client spawns clickable circles, tracks score and elapsed time, lets players tune `circleSize`, `spawnInterval`, and `shrinkTime`, and sends completed games to the API with a snapshot of the settings used for that run.

Authenticated players can view recent scores in the game screen and profile history with sorting, pagination, and setting-based filters. The API persists users, settings, aggregate stats, and game history in PostgreSQL through Sequelize models and repository modules.

## Technical Highlights

**Configurable Gameplay:** The Vue `settingsStore` drives target size, spawn interval, and shrink duration. `Settings.vue` saves those values through `/settings`, and `GameView.vue` posts completed game results to `/game`.

**Persisted Game History:** The `Game` model stores `score`, `time`, and a JSONB `settings` snapshot. `/game` supports `limit`, `offset`, `sortedBy`, and `sortedOrder`; `/game/filter/settings` filters history by saved setting values.

**Auth and Session Handling:** Registration hashes passwords with `bcrypt`; login signs a 24-hour JWT and stores it in an HTTP-only cookie. The Vue API helper sends requests with `credentials: 'include'`.

**Request Controls:** The Express config applies Helmet, CORS with credentials, request schemas, JSON content-type validation, and rate limits. Authenticated routes use the token identity instead of client-supplied user IDs.

**GSAP-Driven Transitions:** The frontend keeps animation logic in composables such as `useGameAnimations`, `useProfileAnimations`, and `useUtilAnimations`, including GSAP timelines and Flip transitions for game/profile state changes.

**Repository Layer:** Controllers delegate Sequelize reads/writes to `src/db/repositories`, keeping HTTP handlers separate from database queries.

## Architecture & Design Decisions

**Atomic Persistence:** Account provisioning and game/stat updates use database transactions. A failed dependent write rolls back the complete operation.

**Small App Entry Point:** `src/app.js` creates the Express app and routes. `server.js` verifies PostgreSQL before it starts listening.

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
- `npm run migrate` applies pending database migrations. The start and development scripts run it first.
- `npm test` runs the API contract and model-schema suite.
- `npm run test:db` runs transaction tests against a disposable PostgreSQL database whose name ends in `_test`.

## Tech Stack

- **Client:** Vue 3, Pinia, Vue Router, GSAP, Sass, Vite
- **API:** Node.js, Express.js
- **Database:** PostgreSQL, Sequelize ORM
- **Local Infrastructure:** Docker Compose
- **Tooling:** ESLint, Prettier, Nodemon
