import { contextBridge } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

// Custom APIs for renderer
const api = {};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer 
contextBridge.exposeInMainWorld(`electron`, electronAPI);
contextBridge.exposeInMainWorld(`api`, api);