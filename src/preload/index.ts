import { contextBridge, ipcRenderer } from 'electron';

// Custom APIs for renderer
const api = {};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer 
contextBridge.exposeInMainWorld(`electron`, {
  pingTest: () => ipcRenderer.send(`ping`)
});
contextBridge.exposeInMainWorld(`api`, api);