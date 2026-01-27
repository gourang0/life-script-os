# Building Life Script OS Desktop App (.exe)

This guide explains how to build the Life Script OS desktop application that runs in the background with system tray support.

## Prerequisites

1. **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
2. **Git** - [Download](https://git-scm.com/)
3. For Windows builds: Windows 10/11
4. For macOS builds: macOS with Xcode Command Line Tools

## Step-by-Step Build Instructions

### 1. Export & Clone the Project

1. In Lovable, click **Settings** → **GitHub** → **Export to GitHub**
2. Clone the repository to your local machine:
   ```bash
   git clone <your-github-repo-url>
   cd life-script-os
   ```

### 2. Install Dependencies

```bash
# Install web app dependencies
npm install

# Install Electron dependencies
cd electron
npm install
cd ..
```

### 3. Build the Web App

```bash
npm run build
```

This creates a `dist` folder with the production build.

### 4. Add App Icons

Place your icons in `electron/icons/`:
- `icon.png` - 256x256 PNG (required)
- `icon.ico` - Windows icon (required for Windows build)
- `tray-icon.png` - 16x16 or 32x32 PNG for system tray

You can use online tools like [ConvertICO](https://convertico.com/) to create .ico files.

### 5. Build the Desktop App

```bash
cd electron

# Build for Windows (.exe)
npm run build:win

# Build for macOS (.dmg)
npm run build:mac

# Build for Linux (.AppImage)
npm run build:linux

# Build for all platforms
npm run build:all
```

### 6. Find Your Build

Built files will be in `electron/release/`:
- **Windows**: `Life Script OS Setup x.x.x.exe` (installer) or `Life Script OS x.x.x.exe` (portable)
- **macOS**: `Life Script OS-x.x.x.dmg`
- **Linux**: `Life-Script-OS-x.x.x.AppImage`

## Features

### System Tray
- App runs in background when you close the window
- Right-click tray icon for quick access menu
- Double-click tray icon to open app

### Desktop Notifications
- Reminders appear as native desktop notifications
- Click notification to open the app
- Works even when app is minimized

### Auto-Start (Optional)
To enable auto-start on system boot, edit `electron/main.js`:
```javascript
app.setLoginItemSettings({
  openAtLogin: true,  // Change to true
  openAsHidden: true
});
```

## Development Mode

To run in development mode with hot reload:

```bash
# Terminal 1: Start the web dev server
npm run dev

# Terminal 2: Start Electron
cd electron
NODE_ENV=development npm start
```

## Troubleshooting

### Build Fails on Windows
- Ensure you have Windows Build Tools: `npm install -g windows-build-tools`
- Run as Administrator if permission issues occur

### Icons Not Showing
- Ensure icons are in the correct format and location
- Windows requires .ico format for app icon

### App Won't Start
- Check that `dist` folder exists (run `npm run build` first)
- Verify all dependencies are installed

## Updating the App

1. Pull latest changes from GitHub
2. Run `npm install` to update dependencies
3. Run `npm run build` to rebuild the web app
4. Run `npm run build:win` (or your platform) in the electron folder

## Notes

- The app connects to your Lovable Cloud backend, so you need internet access
- Your login session will be preserved between app restarts
- Notifications require the app to be running (in background is fine)
