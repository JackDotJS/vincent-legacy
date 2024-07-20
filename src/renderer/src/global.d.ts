import defaultConfig from '../../common/defaultConfig.json';

export interface IElectronAPI {
  pingTest: () => Promise<void>,
  readConfig: () => Promise<typeof defaultConfig>,
  writeConfig: (config) => Promise<undefined|Error>
}

declare global {
  interface Window {
    electron: IElectronAPI
  }
}