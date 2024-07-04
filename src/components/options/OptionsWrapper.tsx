import { Match, Switch, createEffect, createSignal, useContext } from 'solid-js';
import { StateContext } from '../../state/StateController';
import * as i18n from '@solid-primitives/i18n';
import { createStore, reconcile, unwrap } from 'solid-js/store';
import style from './OptionsWrapper.module.css';

import CategoryLanguage from './CategoryLanguage';
import { BaseDirectory } from '@tauri-apps/api/fs';

const OptionsWrapper = () => {
  const { config, setConfig, state, setState, dictionary, writeQ } = useContext(StateContext);

  const t = i18n.translator(() => dictionary(), i18n.resolveTemplate);

  const [newConfig, setNewConfig] = createStore(structuredClone(unwrap(config)));

  let saveButton!: HTMLButtonElement;
  let discardButton!: HTMLButtonElement;

  const [selectedCategory, setSelectedCategory] = createSignal(`display`);

  const applyConfig = () => {
    const uwNewConfig = unwrap(newConfig);
    setConfig(reconcile(uwNewConfig));

    writeQ.add(`config.json`, JSON.stringify(uwNewConfig), { dir: BaseDirectory.AppData });

    console.debug(`new config applied`);
  };

  const discardConfig = () => {
    setNewConfig(reconcile(structuredClone(unwrap(config))));
    console.debug(`new config discarded`);
  };

  const deepCompare = (a: any, b: any): boolean => {
    if (a == null || b == null) return false;

    const equalKeyLength: boolean = (Object.keys(a).length === Object.keys(b).length);
    let recursiveCompare: boolean;

    if (typeof a === `object` && typeof b === `object`) {
      recursiveCompare = Object.keys(a).every((key: string) => {
        return deepCompare(a[key], b[key]);
      });
    } else {
      recursiveCompare = (a === b);
    }
    
    return (equalKeyLength && recursiveCompare);
  };

  createEffect(() => {
    const configsEqual = deepCompare(config, newConfig);

    saveButton.disabled = configsEqual;
    discardButton.disabled = configsEqual;
  });

  return (
    <div class={style.optionsWrapper} classList={{ [style.visible]: state.optionsOpen }}>
      <div class={style.sidebarWrapper}>
        <div class={style.sidebarScroller}>
          <div class={style.sidebar}>
            <h1>{t(`options.title`)}</h1>
            <div class={style.categories}>
              <button onClick={() => setSelectedCategory(`display`)}>
                {t(`options.categories.display`)}
              </button>
              <button onClick={() => setSelectedCategory(`input`)}>
                {t(`options.categories.input`)}
              </button>
              <button onClick={() => setSelectedCategory(`theme`)}>
                {t(`options.categories.theme`)}
              </button>
              <button onClick={() => setSelectedCategory(`plugins`)}>
                {t(`options.categories.plugins`)}
              </button>
              <button onClick={() => setSelectedCategory(`language`)}>
                {t(`options.categories.language`)}
              </button>
              <button onClick={() => setSelectedCategory(`system`)}>
                {t(`options.categories.system`)}
              </button>
              <button onClick={() => setSelectedCategory(`debug`)}>
                {t(`options.categories.debug`)}
              </button>
              <button onClick={() => setSelectedCategory(`experimental`)}>
                {t(`options.categories.experimental`)}
              </button>

              <button class={style.buttonDivider}>
                placeholder
              </button>

              <button ref={saveButton} onClick={() => applyConfig()} disabled>
                {t(`options.save`)}
              </button>
              <button ref={discardButton} onClick={() => discardConfig()} disabled>
                {t(`options.discard`)}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class={style.optionsContentWrapper}>
        <div class={style.optionsContentSeparator}>
          <div class={style.optionsContent}>
            <Switch fallback={<div>category not yet defined: {selectedCategory()}</div>}>
              <Match when={selectedCategory() === `language`}>
                <CategoryLanguage newConfig={newConfig} setNewConfig={setNewConfig} />
              </Match>
            </Switch>
          </div>
          <div class={style.optionsCloseWrapper}>
            <button onClick={() => { setState(`optionsOpen`, false); discardConfig(); } }>
              {t(`generic.close`)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptionsWrapper;