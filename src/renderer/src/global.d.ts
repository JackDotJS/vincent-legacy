import defaultConfig from '../../common/defaultConfig.json';

export interface IElectronAPI {
  pingTest: () => Promise<void>,
  readConfig: () => Promise<typeof defaultConfig>,
  writeConfig: (config: object) => Promise<undefined|Error>,
  fetchDictionaryList: () => Promise<string[]>
  fetchDictionary: (langCode: string) => Promise<object>
}

// need to define these manually bc this is an "experimental technology" (even though its existed for over 4 years)
export interface KeyboardLayoutMap {
  size: number,
  entries: () => Iterator,
  forEach: (callbackFn: (currentValue: unknown, index?: number, array?: KeyboardLayoutMap) => void, thisArg: Object) => void,
  get: (key: string) => string;
}

export interface KeyboardAPI {
  getLayoutMap: () => Promise<KeyboardLayoutMap>
}

declare global {
  interface Window {
    electron: IElectronAPI
  }

  interface Navigator {
    keyboard: KeyboardAPI
  }

  // im not sure if this is really necessary?
  // typescript just keeps yelling at me because the translator 
  // function returns unknown for some fucking reason
  type Translator = (path: string) => string;

  type VincentConfig = typeof defaultConfig;
}