# Cro Emergency Tracker

Cro Emergency Tracker is a monorepo with a mobile app and backend API for earthquake awareness and preparedness in Croatia.

The app is informational. It does not provide earthquake prediction or official emergency warning.

## What is in this repo

- `apps/mobile`: React Native app (Expo)
- `apps/api`: Node.js + Express API
- `packages/shared`: shared types used across mobile and API

## Current app structure

The mobile app currently includes:

- Home dashboard
- Earthquake feed with filtering and refresh
- Earthquake details screen
- Preparedness tasks
- Progress hub (gamification)
- Settings (language and notification preferences)

The backend currently includes:

- Health endpoint
- Earthquake ingestion from external seismic source(s)
- Mapping to internal domain model
- Croatia-focused relevance filtering
- Notification-related endpoints for registration/debug flows
- Analytics summary/export endpoints for evaluation

## Tech stack

- React Native + Expo
- Node.js + Express
- TypeScript
- Vitest
- npm workspaces

## Requirements

- Node.js LTS
- npm
- Expo Go or iOS/Android simulator for mobile testing

## Install

From repo root:

```bash
npm install
```

## Run

Mobile:

```bash
npm run dev:mobile
```

API:

```bash
npm run dev:api
```

Health check:

- `GET http://localhost:8080/health`

## Simulate a debug earthquake event

Use this when you want to test feed updates and notification behavior without waiting for real events.

1. Start API and mobile in separate terminals.

```bash
npm run dev:api
npm run dev:mobile
```

2. Make sure mobile points to your API.

- Default API base URL is `http://localhost:8080`.
- For a real phone, set `EXPO_PUBLIC_API_BASE_URL` to your machine IP, for example:
  `http://192.168.1.20:8080`.

3. Send a POST request to the debug endpoint.

- URL: `http://localhost:8080/api/debug/earthquakes/inject`
- Method: `POST`
- Headers:
  - `Content-Type: application/json`
  - `Accept: application/json`
- Body fields (all optional):
  - `magnitude` (number)
  - `time` (ISO string)
  - `depthKm` (number)
  - `latitude` (number)
  - `longitude` (number)
  - `place` (string)
  - `authority` (string)
  - `ttlMinutes` (number, must be > 0)

Example payload:

```json
{
  "magnitude": 4.8,
  "time": "2026-03-22T12:30:00.000Z",
  "depthKm": 12,
  "latitude": 45.815,
  "longitude": 15.982,
  "place": "ZAGREB (DEBUG)",
  "authority": "DEBUG",
  "ttlMinutes": 30
}
```

Example with curl:

```bash
curl -X POST "http://localhost:8080/api/debug/earthquakes/inject" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "magnitude": 4.8,
    "time": "2026-03-22T12:30:00.000Z",
    "depthKm": 12,
    "latitude": 45.815,
    "longitude": 15.982,
    "place": "ZAGREB (DEBUG)",
    "authority": "DEBUG",
    "ttlMinutes": 30
  }'
```

4. What to observe in mobile:

- Feed: a new event appears after polling or pull-to-refresh.
- Home: latest earthquakes section shows the event (if it is among latest 3).
- Notifications: if enabled and not blocked by quiet hours/cooldown, a local notification is triggered for relevant new events.
- Event details: opening the card shows injected values (magnitude, place, depth, time, coordinates).

Notes:

- Debug inject endpoint is disabled in production (`404` when `NODE_ENV=production`).
- Injected events expire automatically based on `ttlMinutes`.

## Test commands

Run API tests:

```bash
npm run test:api
```

Run mobile tests:

```bash
npm run test:mobile
```

Run both:

```bash
npm run test:all
```

## Lint and typecheck

```bash
npm run lint
npm run typecheck:api
```

## Notes

- Mobile test files are under `apps/mobile/tests`.
- API test files are under `apps/api/tests`.
- Some notification behavior differs between Expo Go and development builds, especially on Android.

## License

MIT. See [LICENSE](LICENSE).
