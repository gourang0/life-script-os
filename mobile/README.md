# Life Script OS - Android App

A native Android application built with Kotlin and Jetpack Compose that mirrors the web application functionality.

## Features

- **Dashboard**: View streaks, XP, level progress, and daily stats
- **Goals**: Create, track, and manage personal goals
- **Tasks**: Task management with priorities and scheduling
- **Health**: Track sleep, nutrition, and exercise
- **Schedule**: Daily/weekly schedule management
- **Habits**: Habit tracking with streaks
- **Analytics**: View progress charts and insights
- **Exceptions**: Log and reflect on missed activities

## Tech Stack

- **Language**: Kotlin
- **UI**: Jetpack Compose with Material 3
- **Architecture**: MVVM with Clean Architecture
- **Networking**: Retrofit + OkHttp
- **Database**: Room (local cache) + Supabase (remote)
- **DI**: Hilt
- **Authentication**: Supabase Auth

## Project Structure

```
mobile/
├── app/
│   └── src/
│       └── main/
│           ├── java/com/lifescriptos/
│           │   ├── data/           # Data layer (repositories, API, database)
│           │   ├── domain/         # Domain layer (models, use cases)
│           │   ├── ui/             # UI layer (screens, components, viewmodels)
│           │   └── di/             # Dependency injection modules
│           └── res/                # Resources (layouts, strings, themes)
├── build.gradle.kts               # Project-level build config
└── settings.gradle.kts            # Settings
```

## Setup Instructions

1. **Open in Android Studio**: File → Open → Select the `mobile` folder

2. **Configure Supabase**:
   - Open `app/src/main/java/com/lifescriptos/data/remote/SupabaseConfig.kt`
   - Update `SUPABASE_URL` and `SUPABASE_KEY` with your project credentials

3. **Build & Run**:
   - Connect an Android device or start an emulator
   - Click Run → Run 'app'

## Building Release APK

```bash
cd mobile
./gradlew assembleRelease
```

The APK will be in `app/build/outputs/apk/release/`

## Requirements

- Android Studio Hedgehog (2023.1.1) or later
- JDK 17
- Android SDK 34
- Kotlin 1.9+
