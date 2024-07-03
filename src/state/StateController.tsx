import { JSXElement, Show, createContext, createResource, createSignal, onMount } from "solid-js";
import { createStore, reconcile } from 'solid-js/store';
import { BaseDirectory, appDataDir, resolveResource} from "@tauri-apps/api/path";
import { exists, readTextFile, readDir, FileEntry } from "@tauri-apps/api/fs";
import * as i18n from "@solid-primitives/i18n";
import defaultConfig from './defaultConfig.json';
import { wq } from '../util/writeQueue';
import { deepMerge } from '../util/deepMerge';

// TODO: unfuck all of this garbage

// interface StateExports {
//   state: any,
//   setState: SetStoreFunction<any>
// }

export const StateContext = createContext<any>();

const fetchDictionary = async (locale: string) => {
  const defaultDictPath = await resolveResource(`locale/${defaultConfig.locale}.json`);
  const defaultDictionary = (await import(defaultDictPath)).default;

  const newDictPath = await resolveResource(`locale/${locale}.json`);
  const newDictionary = (await import(newDictPath)).default;

  const mergedDictionaries = deepMerge(defaultDictionary, newDictionary);

  const flattened = i18n.flatten(mergedDictionaries);

  return flattened;
};

export const StateController = (props: { children?: JSXElement }) => {
  // we need to clone this because otherwise it turns out
  // modifications to the store change the imported config
  // itself for whatever fuckign reason??????????????
  const clonedDefaultCfg = structuredClone(defaultConfig);

  const [loaded, setLoaded] = createSignal(false);
  const [config, setConfig] = createStore(clonedDefaultCfg);
  const [state, setState] = createStore({
    optionsOpen: false,
  });

  const [langs, setLangs] = createSignal<FileEntry[]>([]);

  const [ dictionary ] = createResource(() => config.locale, fetchDictionary);
  
  onMount(async () => {
    let cfgFinal = clonedDefaultCfg;

    const appdata = await appDataDir();
    const cfgExists = await exists(`${appdata}/config.json`);

    if (cfgExists) {
      const config = await readTextFile(`config.json`, { dir: BaseDirectory.AppData });
      const cfgjson = JSON.parse(config);

      cfgFinal = cfgjson;
    } else {
      wq.add(`config.json`, JSON.stringify(defaultConfig), { dir: BaseDirectory.AppData });
    }

    const localeDir = await readDir(`locale`, { dir: BaseDirectory.Resource });

    setLangs(localeDir);

    setConfig(reconcile(cfgFinal));
    setLoaded(true);
  });

  const sc = {
    state,
    setState,
    config,
    setConfig,
    dictionary,
    langs,
  };

  return (
    <StateContext.Provider value={sc}>
      <Show when={(loaded() && dictionary())}>
        {props.children}
      </Show>
    </StateContext.Provider>
  );
};
