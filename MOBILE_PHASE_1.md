# UwoConnect Mobile Application — Phase 1 Documentation

## 1. Architecture Overview

The **UwoConnect Mobile Application** is built as a standalone native cross-platform application for **Android** and **iOS** under `apps/mobile/`.

It functions purely as a new mobile frontend client consuming the existing **UwoConnect Django Backend**. Zero changes have been made to the backend codebase or database schema.

### Tech Stack:
- **Framework**: React Native 0.74 (Expo SDK 51)
- **Routing**: Expo Router v3 (file-based navigation with typed routes)
- **Language**: TypeScript 5.3
- **HTTP Client**: Centralized Axios API client with interceptors
- **Server State**: TanStack React Query v5
- **Global UI/Auth State**: Zustand v4
- **Security Storage**: Expo SecureStore (hardware-backed secure storage)

---

## 2. Directory Structure

```text
apps/mobile/
├── app/
│   ├── _layout.tsx              # Root Provider & Splash handling
│   ├── index.tsx                # Auth state redirect controller
│   ├── (auth)/
│   │   ├── _layout.tsx          # Auth stack
│   │   └── login.tsx            # Login Screen (UwoConnect JWT Auth)
│   └── (app)/
│       ├── _layout.tsx          # Bottom Tab Navigator
│       ├── home.tsx             # Home Dashboard Screen
│       ├── inbox.tsx            # Unified Inbox Placeholder
│       ├── crm.tsx              # CRM Pipeline Placeholder
│       └── more.tsx             # Settings, Profile & Logout
│
├── src/
│   ├── api/                     # Central API Client & Auth/WhiteLabel API methods
│   │   ├── client.ts
│   │   ├── auth.ts
│   │   └── whitelabel.ts
│   ├── components/              # Reusable UwoConnect Native Components
│   │   ├── Screen.tsx
│   │   ├── Text.tsx
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Avatar.tsx
│   │   ├── Badge.tsx
│   │   ├── Header.tsx
│   │   ├── SearchBar.tsx
│   │   ├── Modal.tsx
│   │   ├── BottomSheet.tsx
│   │   ├── Loader.tsx
│   │   ├── Skeleton.tsx
│   │   ├── EmptyState.tsx
│   │   └── ErrorState.tsx
│   ├── config/                  # Environment & App Configuration
│   │   ├── env.ts
│   │   ├── app-config.ts
│   │   └── queryClient.ts
│   ├── hooks/                   # Lifecycle & Network State Hooks
│   │   ├── useNetworkState.ts
│   │   └── useAppLifecycle.ts
│   ├── services/                # Hardware-backed SecureStore Service
│   │   └── secureStore.ts
│   ├── stores/                  # Zustand Stores
│   │   ├── sessionStore.ts
│   │   └── brandStore.ts
│   ├── theme/                   # UwoConnect Dark/Light Theme System
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   └── index.ts
│   └── types/                   # TypeScript Interfaces
│       ├── auth.ts
│       └── whitelabel.ts
│
├── .env.example
├── app.json                     # Android package & iOS Bundle ID
├── eas.json                     # EAS Build configuration
├── package.json
└── tsconfig.json
```

---

## 3. Installation & Getting Started

### Prerequisites:
- Node.js (v18+)
- Expo CLI (`npm i -g expo-cli`)
- Android Studio / Xcode (for local emulators) or Expo Go app on physical device

### Installation Commands:
```bash
cd apps/mobile
npm install
```

---

## 4. Environment Configuration

Create a `.env` file in `apps/mobile/`:
```env
APP_ENV=development
API_BASE_URL=http://10.0.2.2:8000
```
- For **Android Emulator**: Use `http://10.0.2.2:8000` to reach local Django host.
- For **iOS Simulator**: Use `http://127.0.0.1:8000` or local LAN IP.
- For **Production**: Set `API_BASE_URL=https://uwoconnectforrb-743928421487.asia-south1.run.app`.

---

## 5. Running the Application

```bash
# Start Expo Metro Bundler
npm start

# Run directly on Android Emulator
npm run android

# Run directly on iOS Simulator
npm run ios
```

---

## 6. Android & iOS Identifiers

- **Android Package Name**: `com.uwoconnect.app`
- **iOS Bundle Identifier**: `com.uwoconnect.app`
- **App Name**: `UwoConnect`

---

## 7. API Client Architecture

All requests flow through `src/api/client.ts`:
```text
Mobile Screen → Feature Hook → API Method → Central API Client (Axios) → Django API
```
Key Features:
- Automatically attaches `Authorization: Bearer <token>` from `SecureStore`.
- Standardizes error responses (400, 401, 403, 404, 429, 500, network timeouts).

---

## 8. Authentication & Secure Storage Flow

1. User enters credentials on `login.tsx`.
2. App sends `POST /api/auth/login` to existing Django backend.
3. Django returns access token and user metadata.
4. Token is stored securely using `expo-secure-store`.
5. Session state transitions from `unauthenticated` to `authenticated`.
6. Expo Router redirects user to `(app)/home`.

---

## 9. Design System & Dynamic White-Labeling

- **Visual Identity**: Rich dark emerald and teal aesthetic (`#0a120d`, `#111e16`, `#16271c`, `#10b981`, `#14b8a6`).
- **Dynamic White-Labeling**: On app launch, `useBrandStore` fetches `/api/whitelabel/config`. If reseller colors or logo exist, they dynamically override the mobile theme in real time without recompiling the application.

---

## 10. Phase 1 Verification Results

- **Backend Files Modified**: **0** (Untouched)
- **TypeScript**: PASS (`tsc --noEmit` verified)
- **Navigation**: PASS (Expo Router typed routing)
- **SecureStore**: PASS (Token persistence)
- **Design System**: PASS (Native themed components)

---

## 11. Preparation for Phase 2

In **Phase 2**, we will implement:
- **Unified Inbox Module**: Real-time WhatsApp, Instagram, Facebook, and Email messaging stream using WebSocket and existing message endpoints.
- **CRM Module**: Contact lists, lead details, deal stages, and tag management.
