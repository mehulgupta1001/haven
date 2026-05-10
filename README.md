# Haven

A **prototype mobile app** built with [Expo](https://expo.dev) and React Native. It explores the experience of a **student-first financial product** for international students arriving at UK universities: balances, receiving money from home in another currency, cards, credit journey, and rent reporting—**all backed by mock services only**. There is no real money, no bank integration, and no production backend.

## Requirements

- **Node.js** LTS (includes `npm`)
- **Expo Go** on a physical device ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)) if you want to run on your phone
- For simulators: Xcode (iOS) or Android Studio / emulator (Android)

## Quick start

```bash
npm install
npm start
```

Scan the QR code with Expo Go (Android) or the Camera app (iOS), or press `a` / `i` in the terminal for an emulator.

Other scripts:

| Command        | Description           |
| -------------- | --------------------- |
| `npm run android` | Start for Android |
| `npm run ios`     | Start for iOS     |
| `npm run web`     | Start for web     |

## What’s in the app

- **Welcome / sign-up** — onboarding-style flow with mock auth and profile (e.g. university).
- **Home** — balance card, recent transactions, pre-arrival checklist, credit snapshot.
- **Receive** — illustrative “money from home” flow with **mock** FX rates and currency picker.
- **Card** — card state and controls (mock).
- **Progress** — credit / journey style screen (mock).
- **Rent reporting** — dedicated screen for the rent → credit story (mock).

All server-like behaviour lives under `src/services/` (`authService`, `transactionService`, `creditService`, etc.) with delays and static or generated data to mimic a network.

## Project layout

```
├── App.tsx                 # Root providers + navigation container
├── src/
│   ├── components/        # Reusable UI (balance card, trust footer, etc.)
│   ├── context/           # Auth, currency
│   ├── data/              # Fiat currencies, UK universities lists
│   ├── navigation/        # Tab + stack navigators
│   ├── screens/           # Feature screens
│   ├── services/          # Mock APIs and types
│   └── theme/             # Colors + ThemeProvider
├── app.json               # Expo config (name: Haven)
└── package.json
```

## Stack

- **Expo SDK 54**, **React Native 0.81**, **React 19**
- **TypeScript**
- **React Navigation** (native stack + bottom tabs)
- **lucide-react-native** for icons

## Disclaimer

**Haven is a design and learning prototype.** It does not hold or move money, is not regulated, and must not be presented as a real bank or financial service. Do not enter real financial credentials expecting security or compliance.

## Licence

No licence is included by default. Add a `LICENSE` file if you want to specify terms for others.
