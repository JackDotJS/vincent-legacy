import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld(`electron`, {
  pingTest: () => ipcRenderer.send(`ping`),
  writeConfig: (config) => ipcRenderer.send(`writeConfig`, config)
});