import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld(`electron`, {
  pingTest: () => ipcRenderer.send(`ping`)
});