import defaultConfig from '../../common/defaultConfig.json';

interface BaseHistoryItem {
  type: `canvas` | `text` | `number` | `select` | `checkbox` | `radio` | `slider`,
}

interface CanvasChange extends BaseHistoryItem {
  type: `canvas`,
  data: {
    before: ImageData,
    after: ImageData
  },
  x: number,
  y: number
}

interface CanvasSelectionChange extends BaseHistoryItem {
  type: `canvasSelection`,
  data: {
    before: ImageData,
    after: ImageData
  },
  x: number,
  y: number
}

interface TextChange extends BaseHistoryItem {
  type: `text`
  data: {
    before: string,
    after: string,
  },
  target: HTMLInputElement
}

interface NumberChange extends BaseHistoryItem {
  type: `number`,
  data: {
    before: number,
    after: number
  },
  target: HTMLInputElement
}

interface SelectChange extends BaseHistoryItem {
  type: `select`,
  data: {
    before: string,
    after: string
  },
  target: HTMLSelectElement
}

interface CheckBoxChange extends BaseHistoryItem {
  type: `checkbox`,
  data: {
    before: boolean,
    after: boolean
  },
  target: HTMLInputElement
}

interface RadioChange extends BaseHistoryItem {
  type: `radio`,
  data: {
    before: boolean,
    after: boolean
  },
  target: HTMLInputElement
}

interface SliderChange extends BaseHistoryItem {
  type: `slider`,
  data: {
    before: number,
    after: number
  },
  target: HTMLInputElement
}

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
  forEach: (callbackFn: (currentValue: unknown, index?: number, array?: KeyboardLayoutMap) => void, thisArg?: NonNullable<unknown>) => void,
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

  export type HistoryItem = 
  CanvasChange 
  | CanvasSelectionChange
  | TextChange 
  | NumberChange 
  | SelectChange 
  | CheckBoxChange 
  | RadioChange 
  | SliderChange;
}