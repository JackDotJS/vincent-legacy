import { JSXElement, Show, createContext, createEffect, createResource, createSignal, onMount } from "solid-js";
import { createStore, reconcile, unwrap } from 'solid-js/store';
import defaultConfig from '../../../common/defaultConfig.json';
import * as i18n from "@solid-primitives/i18n";
import { deepEquals } from "../../../common/deepEquals";
import { trackDeep } from "@solid-primitives/deep";

const [ ready, setReady ] = createSignal(false);
export const [ config, setConfig ] = createStore<VincentConfig>(structuredClone(defaultConfig));

interface VincentState {
  optionsOpen: boolean,
  canvas: HTMLCanvasElement | null,
  hiddenCanvas: HTMLCanvasElement | null,
}

export const [ state, setState ] = createStore<VincentState>({
  optionsOpen: false,
  canvas: null,
  hiddenCanvas: null,
});

const updateDictionary = async (langCode: string): Promise<i18n.BaseRecordDict> => {
  const newDictionary = await window.electron.fetchDictionary(langCode);
  const flattened = i18n.flatten(newDictionary as i18n.BaseDict);
  return flattened;
};

const [ dictionary ] = createResource(() => config.locale, updateDictionary);

const scValues = {
  state,
  setState,
  config,
  setConfig,
  dictionary
};

export const StateContext = createContext(scValues);

export const StateController = (props: { children?: JSXElement }): JSXElement => {
  onMount(async () => {
    const readConfig = await window.electron.readConfig();
    setConfig(reconcile(readConfig));

    createEffect((oldConfig) => {
      trackDeep(config);

      if (deepEquals(unwrap(oldConfig), unwrap(config))) {
        console.debug(`new config same as old config, skipping write`);
        return;
      }

      console.debug(`writing new config:`, config);
      window.electron.writeConfig(unwrap(config));
    }, readConfig);

    import(`./StateEventListeners`);
    import(`./HistoryController`);

    setReady(true);
  });

  return (
    <StateContext.Provider value={scValues}>
      <Show when={(ready() && dictionary())}>
        {props.children}
      </Show>
    </StateContext.Provider>
  );
};
