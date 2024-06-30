import { JSXElement, Show, createContext, createEffect, createResource, createSignal, onMount } from "solid-js";
import { SetStoreFunction, createStore, reconcile } from 'solid-js/store';
import { BaseDirectory, appDataDir, resolveResource } from "@tauri-apps/api/path";
import { fs } from "@tauri-apps/api";
import * as i18n from "@solid-primitives/i18n";
import defaultConfig from './defaultconfig.json';

// TODO: unfuck all of this garbage

interface StateExports {
  state: any,
  setState: SetStoreFunction<any>
}

export const StateContext = createContext<any>();

const fetchDictionary = async (locale: string) => {
  const newDictPath = await resolveResource(`../locale/${locale}.json`);
  const newDictionary = (await import(newDictPath)).default;
  const flattened = i18n.flatten(newDictionary);

  return flattened;
};

export const StateController = (props: { children?: JSXElement }) => {
  const [loaded, setLoaded] = createSignal(false);
  const [config, setConfig] = createStore(defaultConfig);
  const [state, setState] = createStore({});

  const [ dictionary ] = createResource(() => config.locale, fetchDictionary);
  
  onMount(async () => {
    let cfgFinal = defaultConfig;

    const appdata = await appDataDir();
    const cfgExists = await fs.exists(`${appdata}/config.json`);

    if (cfgExists) {
      const config = await fs.readTextFile(`config.json`, { dir: BaseDirectory.AppData });
      const cfgjson = JSON.parse(config);

      cfgFinal = cfgjson;
    } else {
      await fs.writeTextFile(`config.json`, JSON.stringify(defaultConfig), { dir: BaseDirectory.AppData });
    }

    setConfig(reconcile(cfgFinal));
    setLoaded(true);
  });

  const sc = {
    state,
    setState,
    config,
    setConfig,
    dictionary
  };

  return (
    <StateContext.Provider value={sc}>
      <Show when={(loaded() && dictionary())}>
        {props.children}
      </Show>
    </StateContext.Provider>
  );
};
