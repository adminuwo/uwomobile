# 🔐 UwoConnect — Google Login / Google Sign-In Setup & Configuration Guide

This document provides the complete, production-ready guide for configuring and deploying **Google Sign-In / Google OAuth 2.0** across the UwoConnect Mobile App (`uwomobile`) and Django REST Backend (`UWO-CONNECT_B`).

---

## 1. Project Specifications

* **Expo SDK Version**: `Expo SDK 51.0.0`
* **React Native Version**: `0.74.1`
* **Android Package Name / Application ID**: `com.uwo.uwoconnect`
* **iOS Bundle Identifier**: `com.uwo.uwoconnect`
* **Custom URL Scheme**: `uwoconnect`
* **EAS Project ID**: `c984dbb0-9684-4a8b-b459-4f54e0d79b6e`

---

## 2. Architecture & Security Flow

```text
[ Mobile App (Expo SDK 51) ]
        │
        ▼ (User taps "Continue with Google")
[ Google OAuth 2.0 Flow ] ───────────► Returns verified Google `id_token`
        │
        ▼ (POST /api/auth/google/ with { id_token })
[ Django REST Backend ]
        │
        ├── 1. Cryptographic token verification (google.oauth2.id_token.verify_oauth2_token)
        ├── 2. Verifies Issuer (accounts.google.com), Audience, Expiration, Signature
        ├── 3. Extracts verified claims: email, name, sub (Google User ID), avatar
        ├── 4. Account Linking & Duplicate Prevention:
        │       • Existing email: Log into existing account
        │       • Admin email (admin@uwo24.com): Super Admin login & audit log
        │       • New Google account: Auto-provisions User + Client Workspace
        └── 5. Returns SimpleJWT Access Token + UserProfile
        │
        ▼
[ Mobile App Session Store ] ────────► Saved in SecureStore, routes to /(app)/home
```

> [!SECURITY]
> **Client Secrets are NEVER stored on the mobile device.** Only public Google Client IDs are declared in the mobile client. All user identity verification is strictly performed server-side on the backend.

---

## 3. How to Obtain Android SHA-1 Certificate Fingerprints

Google Sign-In on Android requires linking the **Android Package Name** (`com.uwo.uwoconnect`) and the **SHA-1 Fingerprint** of the signing keystore.

### Option A: EAS Build Keystore (For EAS Preview & Production Standalone APK/AAB)
Run this command in the terminal inside `uwomobile/`:
```bash
eas credentials -p android
```
1. Select the build profile (e.g., `production` or `preview`).
2. Choose **Keystore: Manage everything on Expo servers**.
3. Copy the displayed **SHA-1 Fingerprint** (e.g., `AA:BB:CC:DD:...`).

Alternatively, view it in the **Expo Dashboard**:
`https://expo.dev/accounts/uwo/projects/uwo-connect/credentials/android`

---

### Option B: Google Play App Signing (For Production Play Store Releases)
If you opted into Google Play App Signing on Google Play Console:
1. Open [Google Play Console](https://play.google.com/console).
2. Select your app -> **Release** -> **Setup** -> **App Integrity**.
3. Under **App signing key certificate**, copy the **SHA-1 certificate fingerprint**.

---

### Option C: Local Debug Keystore (For Local Android Studio / Debug Builds)
Run this command in your Mac terminal:
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```
Copy the `SHA1:` line. If you don't have a debug keystore yet, generate one with:
```bash
keytool -genkey -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
```

---

## 4. Google Cloud Console Configuration Steps

1. Navigate to the [Google Cloud Console Credentials Page](https://console.cloud.google.com/apis/credentials).
2. Select or create your project (`uwoconnect` or create new).

### Step 4.1: Configure OAuth Consent Screen
1. Go to **APIs & Services** -> **OAuth consent screen**.
2. Select **External** and click **Create**.
3. Fill in:
   * **App name**: `UwoConnect`
   * **User support email**: Your support email (e.g. `support@uwo24.com`)
   * **Developer contact email**: Your developer email
4. **Scopes**: Add `openid`, `.../auth/userinfo.email`, `.../auth/userinfo.profile`.
5. Save and finish.

### Step 4.2: Create Web Client ID (Required for Backend & AuthSession)
1. Go to **Credentials** -> **Create Credentials** -> **OAuth client ID**.
2. **Application type**: `Web application`.
3. **Name**: `UwoConnect Web Client`.
4. **Authorized JavaScript origins**:
   * `http://localhost:3000`
   * `https://uwoconnect.aisa24.com`
   * `https://auth.expo.io`
5. **Authorized redirect URIs**:
   * `https://auth.expo.io/@uwo/uwo-connect`
   * `https://auth.expo.io/@uwo/uwo-connect/auth/google`
   * `uwoconnect://auth/google`
6. Click **Create** and copy the **Web Client ID**.

### Step 4.3: Create Android Client ID (For Native Android Builds)
1. Click **Create Credentials** -> **OAuth client ID**.
2. **Application type**: `Android`.
3. **Name**: `UwoConnect Android App`.
4. **Package name**: `com.uwo.uwoconnect`
5. **SHA-1 certificate fingerprint**: Paste the SHA-1 obtained from Step 3 (EAS / Keystore).
6. Click **Create**.

### Step 4.4: Create iOS Client ID (Optional for iOS Builds)
1. Click **Create Credentials** -> **OAuth client ID**.
2. **Application type**: `iOS`.
3. **Name**: `UwoConnect iOS App`.
4. **Bundle ID**: `com.uwo.uwoconnect`
5. Click **Create**.

---

## 5. Environment Variables Configuration

In `uwomobile/.env`:
```env
APP_ENV=development
API_BASE_URL=http://192.168.29.183:8000
PROD_API_BASE_URL=https://uwoconnectforrb-743928421487.asia-south1.run.app
EXPO_PUBLIC_API_URL=http://192.168.29.183:8000
APP_VERSION=1.0.0

# Public Google OAuth Client IDs (Safe to expose)
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=876129590251-lok6bi4ut8f2nhl63hh79mghd1ccuf6j.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=876129590251-34k98ip577urgvt89s5hrihgg3aigme6.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=
```

---

## 6. Build Commands & EAS Deployment

### Local Development / Expo Go
```bash
cd uwomobile
npx expo start
```

### Create Android Preview APK (for direct testing on device)
```bash
cd uwomobile
eas build --platform android --profile preview
```

### Create Android Production AAB (for Google Play Store upload)
```bash
cd uwomobile
eas build --platform android --profile production
```

---

## 7. Complete Verification Checklist

- [x] **Backend Cryptographic Verification**: `google.oauth2.id_token.verify_oauth2_token` implemented on `POST /api/auth/google/`.
- [x] **Account Linking**: Existing registered emails log in seamlessly without creating duplicates.
- [x] **New User Auto-Provisioning**: New Google users receive an approved `CLIENT` account and a personalized workspace.
- [x] **UI Polish**: "Continue with Google" button with official Google multi-colored SVG logo.
- [x] **Loading & Disabled States**: Interactive spinner and button disabling during authentication.
- [x] **Session Persistence**: JWT securely saved in hardware-backed `SecureStore`.
- [x] **Biometrics Compatibility**: Biometric / Face ID / Touch ID works alongside Google authentication.
- [x] **TypeScript Compliance**: `npx tsc --noEmit` passed with 0 errors.
