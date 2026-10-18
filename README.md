# AtheroTrack 🫀

> **Evidence-Based Dietary Cholesterol, Saturated Fat & Soluble Fiber Intake Tracker with Blood Lipid Management**  
> *Cross-platform Android & Web application inspired by OpenNutriTracker, Cronometer, and Heartie.*

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Platform: Android & Web](https://img.shields.io/badge/Platform-Android%20%7C%20Web%20(PWA%20%2B%20Capacitor)-emerald.svg)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

---

## 📖 Overview

Standard nutrition applications often count calories while ignoring the physiological mechanisms of cardiovascular atherogenesis. **AtheroTrack** is designed around modern lipidology and American Heart Association (AHA) guidelines:

1. **Dietary Cholesterol (mg)**: Monitors daily intake against clinical thresholds (`<200 mg/day` for high-risk / statin users; `<300 mg/day` for general health).
2. **Saturated Fatty Acids (g)**: Highlights the primary dietary driver of hepatic LDL receptor downregulation (`<5–6%` of total energy, ~`11–13g/day`).
3. **Soluble Viscous Fiber (g)**: The active "Heart Shield" nutrient (beta-glucans from oats, barley, legumes, and seeds) that binds intestinal bile acids and lowers circulating LDL-C.
4. **Trans Fat (g)**: Strictly enforced 0g limit.
5. **Daily AtheroRisk Index**: Real-time composite score assessing dietary atherogenic burden balanced against soluble fiber clearance.

---

## ✨ Features

- **120+ Verified USDA Foods**: Pre-populated database with laboratory-verified values for cholesterol, saturated fat, trans fat, soluble fiber, total fiber, and sodium across 10 food categories.
- **Gemini 3.8 Flash AI Meal Scanner**: Decomposes free-form natural language meal descriptions (e.g., *"2 scrambled eggs in butter with sourdough toast and black coffee"*) into portion grams, exact lipid metrics, and cardiologist commentary.
- **1-Click Cardioprotective Swaps**: Contextual detection of high-cholesterol or high-saturated-fat choices with 1-click substitutions (e.g., whole eggs $\rightarrow$ egg whites + avocado; butter $\rightarrow$ extra virgin olive oil).
- **Clinical Blood Lipid Profile Tracker**: Log lab test results (Total Cholesterol, LDL-C, HDL-C, Triglycerides) with automatic NCEP ATP III classification and an interactive SVG multi-line trajectory chart.
- **Physician Clinical Summary**: Print-ready cardiovascular report with 7-day adherence averages, top cholesterol/saturated-fat contributors, and lab history for cardiologist visits.
- **Privacy First (Local Storage)**: All data persists securely in local browser storage. Includes JSON backup/restore and CSV spreadsheet export.

---

## 📱 Android App Deployment

AtheroTrack is built with dual Android deployment support:

### Option A: Instant Android WebAPK / PWA (Zero Setup)
1. Open the hosted web URL in **Google Chrome** or **Samsung Internet** on your Android phone.
2. Tap the browser menu (`⋮`) and select **"Install app"** or **"Add to Home screen"**.
3. The app installs directly into your Android App Drawer as a standalone app with full offline support and adaptive icons.

### Option B: Native Android APK with Capacitor & Android Studio
AtheroTrack includes `@capacitor/core` and `capacitor.config.json` pre-configured (`com.atherotrack.app`):

```bash
# 1. Build the production web bundle
npm run build

# 2. Add Android native platform (generates native Android Studio project)
npx cap add android

# 3. Open in Android Studio
npx cap open android
```
From Android Studio, you can run the app on any connected Android device, emulator, or build an `.apk` / `.aab` for the Google Play Store.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+ (Node 20+ recommended)
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/dreamcrusher98/atherotrack.git
cd atherotrack

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

### Building for Production

```bash
npm run build
npm start
```

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Canvas Confetti
- **Android Integration**: Vite PWA (`vite-plugin-pwa`), Workbox, Capacitor 7 (`@capacitor/core`, `@capacitor/android`)
- **Backend / AI**: Express, Node.js, `@google/genai` (Gemini 3.8 Flash)
- **Data**: USDA FoodData Central verified nutrition tables, NCEP ATP III / AHA clinical classification guidelines

---

## 🤝 Contributing

Contributions to improve cardiovascular health tracking, add new USDA food datasets, or enhance Android features are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/HeartHealthyFeature`)
3. Commit your Changes (`git commit -m 'Add new heart-smart food swap'`)
4. Push to the Branch (`git push origin feature/HeartHealthyFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the Apache License 2.0. See [`LICENSE`](LICENSE) for more information.
