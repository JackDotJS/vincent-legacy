import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld(`electron`, {
  pingTest: () => ipcRenderer.send(`ping`),
  readConfig: () => ipcRenderer.invoke(`readConfig`),
  writeConfig: (config: object) => ipcRenderer.invoke(`writeConfig`, config),
  fetchDictionaryList: () => ipcRenderer.invoke(`fetchDictionaryList`),
  fetchDictionary: (langCode: string) => ipcRenderer.invoke(`fetchDictionary`, langCode)
});