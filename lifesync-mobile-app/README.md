# LifeSync Mobile App

This is a React Native application designed to help users synchronize various aspects of their life, including tasks, appointments, challenges, and community interactions, with AI-powered suggestions and coaching.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Install Dependencies](#2-install-dependencies)
  - [3. Environment Configuration](#3-environment-configuration)
  - [4. Start the Mock API Server](#4-start-the-mock-api-server)
  - [5. Start the Metro Bundler](#5-start-the-metro-bundler)
  - [6. Run the Application](#6-run-the-application)
- [Overview of Features](#overview-of-features)
- [State Management](#state-management)
- [Data Persistence](#data-persistence)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Building and Deploying](#building-and-deploying)
  - [Environment Variables for Builds](#environment-variables-for-builds)
  - [Building for Development/Testing](#building-for-developmenttesting)
  - [Preparing for Production](#preparing-for-production)
    - [Bundle Generation](#bundle-generation)
    - [App Icons](#app-icons)
    - [Splash Screen](#splash-screen)
    - [Native Build and Signing](#native-build-and-signing)
- [Contributing](#contributing)
- [License](#license)

## Prerequisites

- Node.js (LTS version recommended - check project's `.nvmrc` if available)
- npm or Yarn
- React Native development environment set up (see [React Native Environment Setup](https://reactnative.dev/docs/environment-setup))
  - Including JDK, Android Studio (for Android), Xcode (for iOS)
- An emulator/simulator or a physical device for running the app.

## Getting Started

### 1. Clone Repository
```bash
git clone <repository-url>
cd lifesync-mobile-app
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Configuration
This application uses `react-native-dotenv` to manage environment-specific configurations, such as the API endpoint.

-   A template `.env` file is provided in the root directory.
-   Create a `.env.development` file for local development:
    ```bash
    cp .env .env.development
    ```
    Modify `.env.development` if your local mock API server runs on a different port than the default (`http://localhost:3001`).
-   For production builds, a `.env.production` file is used. This should contain the URL of your live API.
    ```bash
    cp .env .env.production
    # Modify .env.production with your actual production API_BASE_URL
    # Example: API_BASE_URL=https://api.yourlifesyncapp.com
    ```
-   **Important**: If you add any sensitive keys, ensure they are added to `.gitignore` or use local override files like `.env.local`, `.env.development.local`, etc., which are already ignored by `.gitignore`.

The `API_BASE_URL` is loaded based on the current environment (`development`, `production`).

### 4. Start the Mock API Server
This application uses `json-server` to provide a mock backend API for development and testing. The data is served from `db.json`.
To start the mock API server, run:
```bash
npm run mock-api
# or
yarn mock-api
```
This will typically start the server on `http://localhost:3001` (as configured in `.env.development`). Ensure this server is running for the app to fetch and update data during development.

### 5. Start the Metro Bundler
In a new terminal window/tab, start the React Native Metro bundler:
```bash
npm start
# or
yarn start
```

### 6. Run the Application
-   **For iOS:**
    ```bash
    npm run ios
    # or
    yarn ios
    ```
-   **For Android:**
    ```bash
    npm run android
    # or
    yarn android
    ```

## Overview of Features
-   **Authentication**: Basic login screen.
-   **Dashboard**: At-a-glance view of tasks, upcoming appointments, and AI suggestions.
-   **Reminders/Tasks**: Manage daily tasks, with AI optimization suggestions.
-   **Appointments**: Keep track of appointments.
-   **Challenges**: Participate in and create personal or community challenges.
-   **Community**: Connect with friends, share routine templates, and join groups.
-   **AI Coach**: Get personalized suggestions, performance analysis, and coaching.
-   **Profile Selector**: Choose a user profile (Student, Professional, Parent, Fitness) to tailor the app experience.

## State Management
The application uses Zustand for global state management. The store is defined in `src/store.js`.

## Data Persistence
-   During development, data is served and persisted by `json-server` using `db.json`.
-   For production, a real backend API is required. The `API_BASE_URL` in `.env.production` should point to this live API.

## Project Structure
-   `src/`: Contains the main application source code.
    -   `components/`: Reusable UI components, including view components for different screens and the Login screen.
    -   `store.js`: Zustand store definition, including API interactions.
    -   `LifeSyncApp.js`: Main application component, handles routing between Login and main app.
-   `.env*`: Environment configuration files.
-   `babel.config.js`: Babel configuration, including `react-native-dotenv` setup.
-   `db.json`: Data file for `json-server` (mock API).
-   `App.js`: Entry point of the application.
-   `package.json`: Project dependencies and scripts.

## Available Scripts
-   `npm start` / `yarn start`: Starts the Metro bundler.
-   `npm run ios` / `yarn ios`: Runs the app on an iOS simulator/device (development mode).
-   `npm run android` / `yarn android`: Runs the app on an Android emulator/device (development mode).
-   `npm run mock-api` / `yarn mock-api`: Starts the `json-server` mock API on port 3001.

## Building and Deploying

### Environment Variables for Builds
As described in the "Environment Configuration" section, `react-native-dotenv` will automatically pick up the appropriate `.env` file (`.env.development` or `.env.production`) based on the `NODE_ENV` or build environment. For production builds, ensure `NODE_ENV` is set to `production` or that your build process correctly utilizes `.env.production`.

### Building for Development/Testing
Running `npm run ios` or `npm run android` typically creates development builds that are easy to deploy to emulators/simulators or connected devices.

### Preparing for Production
Deploying to app stores involves several steps beyond a simple development build.

#### Bundle Generation
React Native applications require bundling of JavaScript code.
-   **Android**: Generating a signed APK or AAB.
-   **iOS**: Archiving the app in Xcode.

Refer to the official React Native documentation for detailed instructions:
[Running On Device](https://reactnative.dev/docs/running-on-device)
[Generating Signed APK (Android)](https://reactnative.dev/docs/signed-apk-android)
[Publishing to App Stores (General Info)](https://reactnative.dev/docs/publishing-to-app-store)

#### App Icons
You will need to create and configure app icons for different device resolutions.
-   **iOS**: Configure in Xcode's `Images.xcassets`.
-   **Android**: Place icons in `android/app/src/main/res/mipmap-*` directories.
-   Tools like [App Icon Generator](https://appicon.co/) can be helpful.

#### Splash Screen
A splash screen provides a better user experience on app launch.
-   Consider using a library like `react-native-splash-screen`.
-   Expo projects have built-in splash screen configuration.
-   Refer to the chosen library's documentation or the official React Native guides for platform-specific setup.

#### Native Build and Signing
-   **Android**: Requires generating a signing key and configuring Gradle.
-   **iOS**: Managed through Xcode, requires an Apple Developer account for App Store submission.

**It is highly recommended to follow the official React Native and platform-specific (Android/iOS) guides for building and deploying production applications.**

## Contributing
(Information about contributing to the project can be added here if applicable.)

## License
(License information can be added here.)
