export interface IElectronAPI {
  pingTest: () => Promise<void>,
  writeConfig: (config) => Promise<void>
}

declare global {
  interface Window {
    electron: IElectronAPI
  }
}