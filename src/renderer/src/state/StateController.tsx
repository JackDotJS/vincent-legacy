import { JSXElement, Show, createContext, createSignal, onMount } from "solid-js";
import { createStore, reconcile } from 'solid-js/store';
import defaultConfig from '../../../common/defaultConfig.json';
// import * as i18n from "@solid-primitives/i18n";
// import { writeQ } from '../util/writeQueue';
// import { deepMerge } from '../util/deepMerge';

// we need to clone this because otherwise it turns out
// modifications to the store change the imported config
// itself for whatever fuckign reason??????????????
const clonedDefaultCfg = structuredClone(defaultConfig);

const [ready, setReady] = createSignal(false);
const [config, setConfig] = createStore(clonedDefaultCfg);
const [state, setState] = createStore({
  optionsOpen: false,
});

// TEMPORARY
const dictionary = (): null => null;
const langs = null;

const scValues = {
  state,
  setState,
  config,
  setConfig,
  dictionary,
  langs
};

export const StateContext = createContext(scValues);

// const fetchDictionary = async (locale: string): Promise<i18n.BaseRecordDict> => {
//   const defaultDictionary = (JSON.parse(await readTextFile(`locale/${defaultConfig.locale}.json`, { dir: BaseDirectory.Resource })));

//   const newDictionary = (JSON.parse(await readTextFile(`locale/${locale}.json`, { dir: BaseDirectory.Resource })));

//   const mergedDictionaries = deepMerge(defaultDictionary, newDictionary);

//   const flattened = i18n.flatten(mergedDictionaries);

//   return flattened;
// };

export const StateController = (props: { children?: JSXElement }): JSXElement => {
  //const [langs, setLangs] = createSignal<FileEntry[]>([]);

  // const [ dictionary ] = createResource(() => config.locale, fetchDictionary);
  
  onMount(async () => {
    const config = await window.electron.readConfig();
    setConfig(reconcile(config));

    //const localeDir = await readDir(`locale`, { dir: BaseDirectory.Resource });

    //setLangs(localeDir);

    // setConfig(reconcile(cfgFinal));
    setReady(true);
  });

  return (
    <StateContext.Provider value={scValues}>
      <Show when={(ready() /*&& dictionary()*/)}>
        {props.children}
      </Show>
    </StateContext.Provider>
  );
};
