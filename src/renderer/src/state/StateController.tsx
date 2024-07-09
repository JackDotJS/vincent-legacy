import { JSXElement, Show, createContext, createSignal, onMount } from "solid-js";
import { createStore } from 'solid-js/store';
// import * as i18n from "@solid-primitives/i18n";
// import defaultConfig from './defaultConfig.json';
// import { writeQ } from '../util/writeQueue';
// import { deepMerge } from '../util/deepMerge';

// TODO: unfuck all of this garbage

// interface StateExports {
//   state: any,
//   setState: SetStoreFunction<any>
// }

export const StateContext = createContext();

// const fetchDictionary = async (locale: string): Promise<i18n.BaseRecordDict> => {
//   const defaultDictionary = (JSON.parse(await readTextFile(`locale/${defaultConfig.locale}.json`, { dir: BaseDirectory.Resource })));

//   const newDictionary = (JSON.parse(await readTextFile(`locale/${locale}.json`, { dir: BaseDirectory.Resource })));

//   const mergedDictionaries = deepMerge(defaultDictionary, newDictionary);

//   const flattened = i18n.flatten(mergedDictionaries);

//   return flattened;
// };

export const StateController = (props: { children?: JSXElement }): JSXElement => {
  // we need to clone this because otherwise it turns out
  // modifications to the store change the imported config
  // itself for whatever fuckign reason??????????????
  // const clonedDefaultCfg = structuredClone(defaultConfig);

  const [loaded, setLoaded] = createSignal(false);
  const [config, setConfig] = createStore();
  const [state, setState] = createStore({
    optionsOpen: false,
  });

  //const [langs, setLangs] = createSignal<FileEntry[]>([]);

  // const [ dictionary ] = createResource(() => config.locale, fetchDictionary);
  
  onMount(async () => {
    // const cfgFinal = clonedDefaultCfg;

    // const appdata = await appDataDir();
    // const cfgExists = await exists(`${appdata}/config.json`);

    // if (cfgExists) {
      // const config = await readTextFile(`config.json`, { dir: BaseDirectory.AppData });
      // const cfgjson = JSON.parse(config);

    //   cfgFinal = cfgjson;
    // } else {
    //   writeQ.add(`config.json`, JSON.stringify(defaultConfig), { dir: BaseDirectory.AppData });
    // }

    //const localeDir = await readDir(`locale`, { dir: BaseDirectory.Resource });

    //setLangs(localeDir);

    // setConfig(reconcile(cfgFinal));
    setLoaded(true);
  });

  // TEMPORARY
  const dictionary = (): null => null;
  const langs = null;
  const writeQ = null;

  const sc = {
    state,
    setState,
    config,
    setConfig,
    dictionary,
    langs,
    writeQ
  };

  return (
    <StateContext.Provider value={sc}>
      <Show when={(loaded() /*&& dictionary()*/)}>
        {props.children}
      </Show>
    </StateContext.Provider>
  );
};
