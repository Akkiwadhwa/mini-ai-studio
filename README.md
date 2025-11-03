# Mini AI Studio

End-to-end sample of a fashion generation tool with an Express backend, React frontend, and Playwright E2E coverage. Tests are automated and run through GitHub Actions (`.github/workflows/ci.yml`).

## Project Layout

- `backend/` – Express + SQLite API (TypeScript, Jest, Supertest)
- `frontend/` – React + Vite client (TypeScript, Vitest, Testing Library)
- `e2e/` – Playwright tests orchestrating the full signup → generate flow

## Prerequisites

- Node.js 20.x
- npm 10+
- Playwright browsers (install under `e2e/` with `npx playwright install --with-deps chromium`)

## Installation

```bash
# Backend
cd backend
npm ci

# Frontend
cd ../frontend
npm ci

# E2E
cd ../e2e
npm ci
npx playwright install --with-deps chromium
```

## Running the Apps

Backend (defaults to port 4000):
```bash
cd backend
npm run build    # optional, produces dist/
npm start        # serves dist/src/index.js
```
Environment variables of note:
- `JWT_SECRET` (required in production; defaults for tests)
- `DATABASE_PATH` (path to SQLite file, defaults to `./data.sqlite`)
- `BASE_URL` (prefix for generated image URLs)
- `SKIP_GENERATION_DELAY` / `FORCE_OVERLOAD` (used in tests to control simulated behaviour)

Frontend (Vite dev server on port 5173 by default):
```bash
cd frontend
npm run dev
```
Point `VITE_API_URL` to the backend if running on a non-default host or port.

## Tests

### Backend (Jest + Supertest)
```bash
cd backend
npm test            # runs suites in --runInBand mode
```
Coverage is produced automatically; validation, auth, and generation happy-path/error cases are covered.

### Frontend (Vitest + React Testing Library)
```bash
cd frontend
npm test
```
Tests exercise upload UI, generate flow (success + retry), and abort behaviour via mocked fetch calls.

### End-to-End (Playwright)
```bash
cd e2e
npm run test:dev    # spins up backend + preview frontend, then runs Playwright
# or
npm run test:ci     # same orchestration with line reporter (used in CI)
```
The E2E suite signs up, logs in, uploads a fixture asset, triggers generation, and restores history.

## Continuous Integration

GitHub Actions workflow (`.github/workflows/ci.yml`) performs:
1. Backend install → tests → build
2. Frontend install → tests → build
3. Playwright browser install (Chromium) and E2E run

## Cleaning Up

- Temporary SQLite files created during tests live under `backend/tmp/` (ignored via `.gitignore`).
- Playwright artifacts (`test-results/`, `playwright-report/`) are ignored by default.
