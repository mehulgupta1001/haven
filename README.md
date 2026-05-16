# Haven

*Your financial home, from the moment you land.*

*Built with React Native · Powered by Expo · TypeScript*

Haven is a financial platform built exclusively for international students arriving at UK universities — combining pre-arrival account setup, parent-to-student transfers, automatic UK credit building, and AI-powered money management in one place.

## The problem

- 600,000+ international students arrive in UK universities every year.
- They face a chicken-and-egg problem: need a UK address to open a bank account, need a bank account to settle into accommodation.
- Existing solutions like HSBC Premier only work if your family already banks with them. Wise and Revolut were built for everyone — not for the specific financial life of an international student.

## The solution

- Pre-arrival account opening using a university offer letter before you land.
- Cheap parent-to-student transfers regardless of which bank the family uses back home.
- Automatic UK credit building through rent reporting — no salary required.
- AI money manager that understands student loan cycles, quarterly parent transfers, and London rent dates.

## Key screens

- **Welcome & Onboarding** — university selector, offer letter verification, passport KYC.
- **Dashboard** — global balance, arrival checklist, AI nudges.
- **Parent View** — read-only balance and rent status for family back home.
- **Progress** — credit score tracker and AI money assistant.
- **Card Management** — virtual and physical card controls.
- **Receive Money** — shareable account details for parent transfers.

## Tech stack

- React Native with Expo
- TypeScript throughout
- BaaS: Griffin (UK Banking Licence, FCA Regulated)
- KYC: Onfido
- Transfers: Currencycloud / Thunes
- Credit Reporting: CreditLadder API / Experian
- Open Banking: TrueLayer

## Status

Currently in closed pilot development.  
Built by an international student at UCL, for international students.

GitHub: [@mehulgupta1001](https://github.com/mehulgupta1001)

## Requirements & quick start

- **Node.js** LTS (includes `npm`)
- **Expo Go** on a phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)) for device testing
- Simulators: Xcode (iOS) or Android Studio / emulator (Android)

```bash
npm install
npm start
```

Scan the QR with Expo Go (Android) or the Camera app (iOS), or press `a` / `i` in the terminal for an emulator.

| Command | Description |
| ------- | ----------- |
| `npm run android` | Start for Android |
| `npm run ios` | Start for iOS |
| `npm run web` | Start for web |

This repo uses **mock services only** for balances, transfers, and cards — there is no real money or production backend in this codebase.

## Project layout

```
├── App.tsx
├── LICENSE
├── src/
│   ├── components/    # Reusable UI (balance card, trust footer, etc.)
│   ├── context/       # Auth, currency
│   ├── data/          # Fiat currencies, UK universities
│   ├── navigation/    # Tab + stack navigators
│   ├── screens/       # Feature screens
│   ├── services/      # Mock APIs and types
│   └── theme/         # Colors + ThemeProvider
├── app.json
└── package.json
```

## Stack (implementation)

- Expo SDK 54, React Native 0.81, React 19
- React Navigation (native stack + bottom tabs)
- lucide-react-native for icons


## Licence

This project is **proprietary**. All rights are reserved. See **[LICENSE](LICENSE)** for the full terms.

## Disclaimer

This repository contains a prototype built for learning and
validation purposes. No real money is held or moved. Haven is
not a regulated financial product. Do not enter real financial
credentials.
