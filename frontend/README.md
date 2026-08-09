FitApp is an [Expo](https://expo.dev) / React Native app (using [Expo Router](https://docs.expo.dev/router/introduction/) and [NativeWind](https://www.nativewind.dev/)) that talks to the FastAPI backend in `../backend/`.

## Getting Started

1. Start the backend (see `../backend/README.md`), and set `EXPO_PUBLIC_API_URL` in `.env` to point at it — use your machine's LAN IP (not `localhost`) when testing on a physical device.
2. Install dependencies and start the app:

```bash
npm install
npx expo start
```

Open the result in [Expo Go](https://expo.dev/go) on your phone, or press `i`/`a` in the terminal to launch an iOS/Android simulator.

## Project structure

- `app/` — screens and layouts (Expo Router file-based routing)
- `components/` — shared UI components
- `lib/` — API client and auth context
