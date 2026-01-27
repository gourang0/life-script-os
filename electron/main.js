const { app, BrowserWindow, Tray, Menu, nativeImage, Notification, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let tray;
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

  tray.setToolTip('Life Script OS - Running in background');
  tray.setContextMenu(contextMenu);

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

// App lifecycle
app.whenReady().then(() => {
  createWindow();
  createTray();

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

// Auto-start on system boot (optional)
app.setLoginItemSettings({
  openAtLogin: false, // Set to true to enable auto-start
  openAsHidden: true
});
