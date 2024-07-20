import { JSXElement, Show, createContext, createResource, createSignal, onMount } from "solid-js";
import { createStore, reconcile } from 'solid-js/store';
import defaultConfig from '../../../common/defaultConfig.json';
import * as i18n from "@solid-primitives/i18n";

const [ ready, setReady ] = createSignal(false);
const [ config, setConfig ] = createStore(structuredClone(defaultConfig));
const [ state, setState ] = createStore({
  optionsOpen: false,
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
    const config = await window.electron.readConfig();
    setConfig(reconcile(config));
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
