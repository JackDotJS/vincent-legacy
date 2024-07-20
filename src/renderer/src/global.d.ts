import defaultConfig from '../../common/defaultConfig.json';

export interface IElectronAPI {
  pingTest: () => Promise<void>,
  readConfig: () => Promise<typeof defaultConfig>,
  writeConfig: (config: object) => Promise<undefined|Error>,
  fetchDictionaryList: () => Promise<string[]>
  fetchDictionary: (langCode: string) => Promise<object>
}

declare global {
  interface Window {
    electron: IElectronAPI
  }

  // im not sure if this is really necessary?
  // typescript just keeps yelling at me because the translator 
  // function returns unknown for some fucking reason
  type Translator = (path: string) => string;
}