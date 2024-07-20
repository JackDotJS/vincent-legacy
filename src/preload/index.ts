import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld(`electron`, {
  pingTest: () => ipcRenderer.send(`ping`),
  readConfig: () => ipcRenderer.invoke(`readConfig`),
  writeConfig: (config) => ipcRenderer.invoke(`writeConfig`, config)
});