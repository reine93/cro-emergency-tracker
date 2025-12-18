# 🇭🇷 Cro Emergency Tracker

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A mobile app (React Native + Expo) designed to help users in Croatia prepare for and respond to emergencies such as earthquakes.  
The app will include features like real-time alerts, safety checklists, and gamified preparedness tasks.

---

## 🚧 Project Status

This repository is in early development. The monorepo wiring (mobile app + API + shared package) is in place and ready
for feature work.

---

## 📱 Planned Features

- Real-time earthquake and emergency alerts
- Preparedness checklists and safety guides
- Gamified learning (points, badges, daily challenges)
- Localized Croatian/English support

---

## 🛠️ Tech Stack

- **React Native** (Expo)
- **Node.js / Express** (for API integration, planned)
- **Seismic APIs** for real-time data
- **CodeRabbit** for automated code review

---

## ⚙️ Setup

### Prerequisites

- Node.js (LTS recommended)
- npm
- For mobile development: Expo Go on your device, or Android Studio / Xcode simulators

### Install

From the repo root:

```bash
npm install
```

### Run (Mobile)

```bash
npm run dev:mobile
```

Then use the Expo CLI menu to open iOS/Android/Web.

### Run (API)

```bash
npm run dev:api
```

Health check:

- `GET http://localhost:8080/health`

### Lint / Typecheck / Tests

```bash
npm run lint
npm run typecheck:api
npm run test:api
```

---

## 🪪 License

This project is open-source under the [MIT License](LICENSE).  
Feel free to use, modify, and share with attribution.
