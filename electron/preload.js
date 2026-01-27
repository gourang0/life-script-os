const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Show desktop notification
  showNotification: (title, body, urgency = 'normal') => {
    return ipcRenderer.invoke('show-notification', { title, body, urgency });
  },
  
  // Get app info
  getAppInfo: () => {
    return ipcRenderer.invoke('get-app-info');
  },
  
  // Listen for navigation commands from main process
  onNavigate: (callback) => {
    ipcRenderer.on('navigate', (event, route) => callback(route));
  },
  
  // Check if running in Electron
  isElectron: true
});
