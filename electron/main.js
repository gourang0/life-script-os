const { app, BrowserWindow, Tray, Menu, nativeImage, Notification, ipcMain } = require('electron');
const path = require('path');
const Store = require('electron-store');

// Initialize settings store
const store = new Store({
  defaults: {
    autoLaunch: false,
    todayStats: {
      streak: 0,
      xp: 0,
      tasksCompleted: 0,
      level: 1,
      steps: 0,
      workHours: 0,
      sleepHours: 0
    }
  }
});

let mainWindow;
let tray;
let statsPopup;
let isQuitting = false;

// Create the main application window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'icons', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false
  });

  // Load the app - in production, load the built files
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Minimize to tray instead of closing
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      
      // Show notification that app is running in background
      if (Notification.isSupported()) {
        new Notification({
          title: 'Life Script OS',
          body: 'App minimized to system tray. Click the tray icon to open.',
          icon: path.join(__dirname, 'icons', 'icon.png')
        }).show();
      }
    }
  });
}

// Create stats popup window
function createStatsPopup() {
  const stats = store.get('todayStats');
  
  statsPopup = new BrowserWindow({
    width: 280,
    height: 320,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          color: #fff;
          padding: 16px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }
        .header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .header h1 { font-size: 14px; font-weight: 600; }
        .header .live { 
          background: #22c55e; 
          width: 8px; 
          height: 8px; 
          border-radius: 50%; 
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .stat-card {
          background: rgba(255,255,255,0.05);
          border-radius: 8px;
          padding: 12px;
          text-align: center;
        }
        .stat-card.highlight {
          background: linear-gradient(135deg, rgba(249,115,22,0.2) 0%, rgba(234,88,12,0.2) 100%);
          border: 1px solid rgba(249,115,22,0.3);
        }
        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #f97316;
        }
        .stat-label {
          font-size: 11px;
          color: rgba(255,255,255,0.6);
          margin-top: 4px;
        }
        .stat-card.xp .stat-value { color: #8b5cf6; }
        .stat-card.tasks .stat-value { color: #22c55e; }
        .stat-card.level .stat-value { color: #3b82f6; }
        .daily-metrics {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(255,255,255,0.1);
        }
        .daily-metrics h3 {
          font-size: 11px;
          color: rgba(255,255,255,0.5);
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .metric-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 0;
          font-size: 12px;
        }
        .metric-row span:first-child { color: rgba(255,255,255,0.7); }
        .metric-row span:last-child { font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="live"></div>
        <h1>Today's Stats</h1>
      </div>
      <div class="stats-grid">
        <div class="stat-card highlight">
          <div class="stat-value">${stats.streak}</div>
          <div class="stat-label">🔥 Streak</div>
        </div>
        <div class="stat-card xp">
          <div class="stat-value">${stats.xp.toLocaleString()}</div>
          <div class="stat-label">⚡ XP</div>
        </div>
        <div class="stat-card tasks">
          <div class="stat-value">${stats.tasksCompleted}</div>
          <div class="stat-label">✓ Tasks Done</div>
        </div>
        <div class="stat-card level">
          <div class="stat-value">${stats.level}</div>
          <div class="stat-label">📈 Level</div>
        </div>
      </div>
      <div class="daily-metrics">
        <h3>Daily Goals</h3>
        <div class="metric-row">
          <span>👟 Steps</span>
          <span>${stats.steps.toLocaleString()}</span>
        </div>
        <div class="metric-row">
          <span>💼 Work</span>
          <span>${stats.workHours}h</span>
        </div>
        <div class="metric-row">
          <span>😴 Sleep</span>
          <span>${stats.sleepHours}h</span>
        </div>
      </div>
    </body>
    </html>
  `;

  statsPopup.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);
  
  statsPopup.on('blur', () => {
    statsPopup.hide();
  });
}

// Show stats popup near tray
function showStatsPopup() {
  if (!statsPopup || statsPopup.isDestroyed()) {
    createStatsPopup();
  } else {
    // Refresh stats content
    createStatsPopup();
  }

  const trayBounds = tray.getBounds();
  const popupBounds = statsPopup.getBounds();
  
  // Position popup above tray icon
  const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (popupBounds.width / 2));
  const y = Math.round(trayBounds.y - popupBounds.height - 8);
  
  statsPopup.setPosition(x, y);
  statsPopup.show();
}

// Create system tray
function createTray() {
  const iconPath = path.join(__dirname, 'icons', 'tray-icon.png');
  const trayIcon = nativeImage.createFromPath(iconPath);
  
  tray = new Tray(trayIcon.resize({ width: 16, height: 16 }));
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open Life Script OS',
      click: () => {
        mainWindow.show();
        mainWindow.focus();
      }
    },
    {
      label: 'Dashboard',
      click: () => {
        mainWindow.show();
        mainWindow.webContents.send('navigate', '/dashboard');
      }
    },
    {
      label: 'Quick Stats',
      submenu: [
        {
          label: 'View Streak',
          click: () => {
            mainWindow.show();
            mainWindow.webContents.send('navigate', '/dashboard');
          }
        },
        {
          label: 'Today\'s Schedule',
          click: () => {
            mainWindow.show();
            mainWindow.webContents.send('navigate', '/schedule');
          }
        },
        {
          label: 'Health Summary',
          click: () => {
            mainWindow.show();
            mainWindow.webContents.send('navigate', '/health');
          }
        }
      ]
    },
    { type: 'separator' },
    {
      label: 'Settings',
      click: () => {
        mainWindow.show();
        mainWindow.webContents.send('navigate', '/profile');
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setToolTip('Life Script OS - Hover for stats');
  tray.setContextMenu(contextMenu);

  // Show stats popup on hover (mouse-move simulates hover)
  tray.on('mouse-move', () => {
    if (!statsPopup || !statsPopup.isVisible()) {
      showStatsPopup();
    }
  });

  // Double click to open
  tray.on('double-click', () => {
    mainWindow.show();
    mainWindow.focus();
  });
}

// Show desktop notification
function showNotification(title, body, urgency = 'normal') {
  if (Notification.isSupported()) {
    const notification = new Notification({
      title,
      body,
      icon: path.join(__dirname, 'icons', 'icon.png'),
      urgency,
      silent: false
    });

    notification.on('click', () => {
      mainWindow.show();
      mainWindow.focus();
    });

    notification.show();
  }
}

// Update auto-launch setting
function updateAutoLaunch(enabled) {
  store.set('autoLaunch', enabled);
  app.setLoginItemSettings({
    openAtLogin: enabled,
    openAsHidden: true
  });
}

// Handle IPC messages from renderer
ipcMain.handle('show-notification', (event, { title, body, urgency }) => {
  showNotification(title, body, urgency);
});

ipcMain.handle('get-app-info', () => {
  return {
    version: app.getVersion(),
    name: app.getName()
  };
});

ipcMain.handle('get-auto-launch', () => {
  return store.get('autoLaunch');
});

ipcMain.handle('set-auto-launch', (event, enabled) => {
  updateAutoLaunch(enabled);
  return enabled;
});

ipcMain.handle('update-today-stats', (event, stats) => {
  store.set('todayStats', stats);
  // Refresh popup if visible
  if (statsPopup && statsPopup.isVisible()) {
    createStatsPopup();
    showStatsPopup();
  }
});

// App lifecycle
app.whenReady().then(() => {
  // Apply saved auto-launch setting
  const autoLaunch = store.get('autoLaunch');
  app.setLoginItemSettings({
    openAtLogin: autoLaunch,
    openAsHidden: true
  });

  createWindow();
  createTray();
  createStatsPopup();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else {
      mainWindow.show();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Don't quit on Windows/Linux, keep running in tray
  }
});

app.on('before-quit', () => {
  isQuitting = true;
});
