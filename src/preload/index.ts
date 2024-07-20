import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld(`electron`, {
  pingTest: () => ipcRenderer.send(`ping`),
  writeConfig: (config) => ipcRenderer.invoke(`writeConfig`, config)
});