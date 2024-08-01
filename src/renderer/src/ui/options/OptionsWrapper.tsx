import { JSXElement, Match, Switch, createEffect, createSignal, useContext } from 'solid-js';
import { StateContext } from '../../state/StateController';
import * as i18n from '@solid-primitives/i18n';
import { createStore, reconcile, unwrap } from 'solid-js/store';
import style from './OptionsWrapper.module.css';

import CategoryLanguage from './CategoryLanguage';
import CategoryInput from './CategoryInput';
import CategorySystem from './CategorySystem';
import { deepEquals } from '../../../../common/deepEquals';
import { trackDeep } from '@solid-primitives/deep';


const OptionsWrapper = (): JSXElement => {
  const { config, setConfig, state, setState, dictionary} = useContext(StateContext);

  const t = i18n.translator(() => dictionary(), i18n.resolveTemplate) as Translator;

  const [newConfig, setNewConfig] = createStore<VincentConfig>(structuredClone(unwrap(config)));

  let saveButton!: HTMLButtonElement;
  let discardButton!: HTMLButtonElement;

  const [selectedCategory, setSelectedCategory] = createSignal(`display`);

  const applyConfig = (): void => {
    const uwNewConfig = unwrap(newConfig);
    setConfig(reconcile(uwNewConfig));

    console.debug(`new config applied`);
  };

  const discardConfig = (): void => {
    setNewConfig(reconcile(structuredClone(unwrap(config))));
    console.debug(`new config discarded`);
  };

  createEffect(() => {
    trackDeep(newConfig);
    trackDeep(config);
    const configsEqual = deepEquals(unwrap(config), unwrap(newConfig));

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
                {t(`options.display.title`)}
              </button>
              <button onClick={() => setSelectedCategory(`input`)}>
                {t(`options.input.title`)}
              </button>
              <button onClick={() => setSelectedCategory(`theme`)}>
                {t(`options.themes.title`)}
              </button>
              <button onClick={() => setSelectedCategory(`plugins`)}>
                {t(`options.plugins.title`)}
              </button>
              <button onClick={() => setSelectedCategory(`language`)}>
                {t(`options.language.title`)}
              </button>
              <button onClick={() => setSelectedCategory(`system`)}>
                {t(`options.system.title`)}
              </button>
              <button onClick={() => setSelectedCategory(`debug`)}>
                {t(`options.debug.title`)}
              </button>
              <button onClick={() => setSelectedCategory(`experimental`)}>
                {t(`options.experimental.title`)}
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
              <Match when={selectedCategory() === `input`}>
                <CategoryInput newConfig={newConfig} setNewConfig={setNewConfig} />
              </Match>
              <Match when={selectedCategory() === `language`}>
                <CategoryLanguage newConfig={newConfig} setNewConfig={setNewConfig} />
              </Match>
              <Match when={selectedCategory() === `system`}>
                <CategorySystem newConfig={newConfig} setNewConfig={setNewConfig} />
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