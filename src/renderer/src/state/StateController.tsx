import { JSXElement, Show, createContext, createEffect, createResource, createSignal, onMount } from "solid-js";
import { createStore, reconcile, unwrap } from 'solid-js/store';
import defaultConfig from '../../../common/defaultConfig.json';
import * as i18n from "@solid-primitives/i18n";
import { deepEquals } from "../../../common/deepEquals";
import { trackDeep } from "@solid-primitives/deep";
import HistoryController from "./HistoryController";
import { VincentBaseTool } from '@renderer/api/VincentBaseTool';
import './GlobalEventEmitter';

export interface VincentState {
  optionsOpen: boolean,
  modal: {
    open: boolean,
    title: string,
    contents: `none` | `newFile` | `options`
  },
  canvas: {
    main: HTMLCanvasElement | null,
    committed: OffscreenCanvas,
    selection: HTMLCanvasElement | null,
    committedSelection: OffscreenCanvas,
    wrapper: HTMLDivElement | null,
    scale: number
  },
  gpu: {
    adapter: GPUAdapter | null,
    device: GPUDevice | null
    canvasFormat: GPUTextureFormat | null
  },
  tools: {
    selected: number,
    list: VincentBaseTool[]
  },
  history: typeof HistoryController
}

const [ ready, setReady ] = createSignal(false);
export const [ config, setConfig ] = createStore<VincentConfig>(structuredClone(defaultConfig));

export const [ state, setState ] = createStore<VincentState>({
  optionsOpen: false,
  modal: {
    open: false,
    title: `Modal`,
    contents: `none`
  },
  canvas: {
    main: null,
    committed: new OffscreenCanvas(600,400),
    selection: null,
    committedSelection: new OffscreenCanvas(600,400),
    wrapper: null,
    scale: 1
  },
  gpu: {
    adapter: null,
    device: null,
    canvasFormat: null
  },
  tools: {
    selected: 0,
    list: []
  },
  history: HistoryController
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

    // load gpu data
    const adapter = await navigator.gpu.requestAdapter();
    if (adapter == null) {
      throw new Error(`could not get gpu adapter`);
    }

    const hasBgra = adapter.features.has(`bgra8unorm-storage`);
    const device = await adapter.requestDevice({
      requiredFeatures: hasBgra ? [`bgra8unorm-storage`] : []
    });
    if (device == null) {
      throw new Error(`could not get gpu device`);
    }

    const cf = hasBgra
      ? navigator.gpu.getPreferredCanvasFormat()
      : `rgba8unorm`;

    setState(`gpu`, `adapter`, adapter);
    setState(`gpu`, `device`, device);
    setState(`gpu`, `canvasFormat`, cf);

    // load built-in tools
    const vincentTools = (await import(`../tools`));
    const keys = Object.keys(vincentTools);
    keys.sort((a, b) => a.localeCompare(b));
    for (const key of keys) {
      const tool = vincentTools[key].default;
      setState(`tools`, `list`, (old) => [...old, tool]);
    }

    console.debug(state.tools);

    // load misc modules
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
