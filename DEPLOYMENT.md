# Deployment Instructions for LifeSync

This document provides instructions for deploying the backend (Firebase Functions) and frontend (web, iOS, Android) components of the LifeSync application.

## 1. Backend (Firebase Functions)

The backend logic for LifeSync is implemented as Firebase Functions.

### Prerequisites:

*   **Node.js:** Ensure you have Node.js installed (version 18 or later recommended for Firebase Functions). You can download it from [nodejs.org](https://nodejs.org/).
*   **Firebase CLI:** Install the Firebase Command Line Interface globally:
    ```bash
    npm install -g firebase-tools
    ```
*   **Firebase Login:** Log in to Firebase using your Google account:
    ```bash
    firebase login
    ```
*   **Firebase Project:** Ensure you have an active Firebase project set up. You can create one at the [Firebase Console](https://console.firebase.google.com/).

### Deployment Steps:

1.  **Navigate to Backend Directory:**
    Open your terminal and change to the `backend` directory of the project:
    ```bash
    cd path/to/your/project/backend
    ```

2.  **Install Dependencies:**
    If you haven't installed the dependencies or if there are updates, run:
    ```bash
    npm install
    ```

3.  **Deploy Firebase Functions:**
    Deploy only the functions to your Firebase project:
    ```bash
    firebase deploy --only functions
    ```
    This command will upload and activate your backend functions.

4.  **Identify Functions Base URL:**
    After successful deployment, the Firebase CLI will usually output the base URL for your HTTP-triggered functions. It typically looks like:
    `httpsFunction URL (yourFunctionName): https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/yourFunctionName`

    The common base URL for all your functions will be `https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/` (replace `us-central1` with your function's region if different). You will use this base URL (often with an `/api` suffix if your Express app is mounted there, e.g., `https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/api`) in your frontend's `.env.production` file for `API_BASE_URL`. You can also find this information in the Firebase console under the "Functions" section.

## 2. Frontend (lifesync-mobile-app)

The frontend is a React Native application that can be deployed to the web, iOS, and Android.

### General Prerequisites:

*   **Node.js:** Ensure Node.js is installed (version 16 or later, matching the project's `engines` requirement in `package.json`).
*   **npm or yarn:** A JavaScript package manager. This project uses `npm`.
*   **Environment Configuration:**
    *   Navigate to the `lifesync-mobile-app` directory.
    *   Create a `.env.production` file by copying `.env.example` if it doesn't exist.
    *   Fill in `lifesync-mobile-app/.env.production` with your actual Firebase project details:
        *   `REACT_APP_FIREBASE_API_KEY="YOUR_PRODUCTION_FIREBASE_API_KEY"`
        *   `REACT_APP_FIREBASE_AUTH_DOMAIN="your-production-project-id.firebaseapp.com"`
        *   `REACT_APP_FIREBASE_PROJECT_ID="your-production-project-id"`
        *   `REACT_APP_FIREBASE_STORAGE_BUCKET="your-production-project-id.appspot.com"`
        *   `REACT_APP_FIREBASE_MESSAGING_SENDER_ID="YOUR_PRODUCTION_MESSAGING_SENDER_ID"`
        *   `REACT_APP_FIREBASE_APP_ID="YOUR_PRODUCTION_FIREBASE_APP_ID"`
        *   `API_BASE_URL="YOUR_PRODUCTION_FIREBASE_FUNCTIONS_URL"` (e.g., `https://us-central1-your-production-project-id.cloudfunctions.net/api`)

### A. Web Deployment (Firebase Hosting)

We'll use Firebase Hosting to deploy the web version of the app.

#### Prerequisites:

*   **Firebase CLI:** Installed and configured (see backend prerequisites).

#### Deployment Steps:

1.  **Navigate to Frontend Directory:**
    ```bash
    cd path/to/your/project/lifesync-mobile-app
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Build for Web:**
    Generate the static web files. The output is typically in a `dist/` folder (this is the default for `@expo/webpack-config`).
    ```bash
    npm run web:build
    ```

4.  **Initialize Firebase Hosting (if not already done):**
    If this is your first time deploying this app's web version to Firebase Hosting from this directory:
    ```bash
    firebase init hosting
    ```
    *   **Project Selection:** When prompted, select "Use an existing project" and choose your Firebase project.
    *   **Public Directory:** For "What do you want to use as your public directory?", enter the directory where your web build output is located. If `npm run web:build` outputs to `dist`, then enter `dist`. (Note: `@expo/webpack-config` often outputs to `dist/` by default, but it might be `web-build/` or similar; verify this after the build step).
    *   **Single-Page App:** Configure as a single-page app? Answer "Yes" (or `y`). This ensures all routes are directed to `index.html`.
    *   **Overwrite `index.html`?** If Firebase offers to create and overwrite an `index.html` in your public directory, and your build step already created one, answer "No" (or `n`).

5.  **Deploy to Firebase Hosting:**
    Upload your web app to Firebase Hosting:
    ```bash
    firebase deploy --only hosting
    ```
    After deployment, Firebase CLI will provide the URL to your live web application.

### B. iOS Deployment

Deploying to iOS requires macOS and an Apple Developer account.

#### Prerequisites:

*   **macOS:** Xcode runs only on macOS.
*   **Xcode:** Install the latest version from the Mac App Store.
*   **CocoaPods:** (Often needed for React Native projects) `sudo gem install cocoapods`
*   **Apple Developer Account:** Required for App Store submission.

#### General Steps:

1.  **Navigate to Frontend Directory & Install Dependencies:**
    ```bash
    cd path/to/your/project/lifesync-mobile-app
    npm install
    cd ios && pod install && cd ..
    ```
    (Run `pod install` if your project uses native modules that require it).

2.  **Configure in Xcode:**
    *   Open the iOS project: `open lifesync-mobile-app/ios/LifeSyncMobileApp.xcworkspace` (use `.xcworkspace`).
    *   **Bundle Identifier:** Set a unique Bundle ID (e.g., `com.yourcompany.lifesyncapp`) in the "General" tab of your project settings.
    *   **Display Name:** Set the app's display name.
    *   **App Icons & Launch Screens:** Configure these in Xcode's asset catalog.
    *   **Signing & Capabilities:** Configure your Apple Developer account for signing and select your team. Ensure correct capabilities are enabled.

3.  **Build & Archive:**
    *   Select your target device as "Any iOS Device (arm64)".
    *   In Xcode, choose "Product" > "Archive".

4.  **Submit to App Store:**
    *   Once the archive is built, the Organizer window will appear.
    *   You can validate the app and then distribute it to TestFlight for testing or directly to the App Store.

5.  **Detailed Guide:**
    For comprehensive instructions, follow the official React Native documentation:
    [Publishing to Apple App Store](https://reactnative.dev/docs/publishing-to-app-store)

### C. Android Deployment

Deploying to Android requires Android Studio and a Google Play Developer account.

#### Prerequisites:

*   **Android Studio:** Install the latest version from [developer.android.com/studio](https://developer.android.com/studio).
*   **JDK (Java Development Kit):** Required by Android Studio. Often bundled or prompted for installation.
*   **Google Play Developer Account:** Required for Play Store submission.

#### General Steps:

1.  **Navigate to Frontend Directory & Install Dependencies:**
    ```bash
    cd path/to/your/project/lifesync-mobile-app
    npm install
    ```

2.  **Configure Project:**
    *   Open the Android project in Android Studio: `lifesync-mobile-app/android`.
    *   **Package Name (Application ID):** Update in `android/app/build.gradle` (the `applicationId` field).
    *   **Display Name:** Update in `android/app/src/main/res/values/strings.xml`.
    *   **App Icons & Splash Screens:** Add different icon sizes and splash screen drawables to the `res` folders.

3.  **Generate a Signing Key:**
    You need to sign your app for release.
    ```bash
    keytool -genkeypair -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
    ```
    Keep this keystore file safe. Refer to React Native docs for details on storing and using it.

4.  **Configure Gradle for Release:**
    *   Place the `my-release-key.keystore` file in the `android/app` directory.
    *   Edit `android/gradle.properties` to include your keystore's passwords and alias (use environment variables or other secure methods for storing these, don't hardcode directly if possible for public repos).
    *   Edit `android/app/build.gradle` to set up release signing configurations using the keystore.

5.  **Build Release AAB (Android App Bundle) or APK:**
    Navigate to the `android` directory in your terminal:
    ```bash
    cd lifesync-mobile-app/android
    ```
    For an App Bundle (recommended for Google Play):
    ```bash
    ./gradlew bundleRelease
    ```
    Or for an APK:
    ```bash
    ./gradlew assembleRelease
    ```
    The output will be in `android/app/build/outputs/bundle/release/` or `android/app/build/outputs/apk/release/`.

6.  **Submit to Google Play Console:**
    Upload your AAB or APK to the Google Play Console.

7.  **Detailed Guide:**
    For comprehensive instructions, follow the official React Native documentation:
    [Publishing to Google Play Store](https://reactnative.dev/docs/signed-apk-android)

---

Remember to replace placeholder values (like `YOUR_PROJECT_ID`, `com.yourcompany.lifesyncapp`) with your actual project details. Always ensure your `.env.production` file contains the correct and secure API keys and URLs before building for production.
