export interface IElectronAPI {
  pingTest: () => Promise<void>
}

declare global {
  interface Window {
    electron: IElectronAPI
  }
}