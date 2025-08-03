// Preload script for Electron
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use IPC
contextBridge.exposeInMainWorld('electronAPI', {
  getSupabaseConfig: () => ipcRenderer.invoke('getSupabaseConfig'),
  setSupabaseConfig: (config) => ipcRenderer.invoke('setSupabaseConfig', config),
  saveSession: (session) => ipcRenderer.invoke('saveSession', session),
  getSession: () => ipcRenderer.invoke('getSession'),
  clearSession: () => ipcRenderer.invoke('clearSession'),
  verifyDatabase: () => ipcRenderer.invoke('verifyDatabase'),
  onEnvNotification: (callback) => ipcRenderer.on('show-env-notification', (_, message, type) => callback(message, type)),
  onVerifyDatabaseRequest: (callback) => ipcRenderer.on('verifyDatabase', () => callback())
});
