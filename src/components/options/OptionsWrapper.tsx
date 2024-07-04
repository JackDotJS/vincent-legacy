import { Match, Switch, createSignal, useContext } from 'solid-js';
import { StateContext } from '../../state/StateController';
import * as i18n from '@solid-primitives/i18n';
import style from './OptionsWrapper.module.css';

import CategoryLanguage from './CategoryLanguage';

const OptionsWrapper = () => {
  const { state, setState, dictionary } = useContext(StateContext);

  const t = i18n.translator(() => dictionary(), i18n.resolveTemplate);

  const [selectedCategory, setSelectedCategory] = createSignal(`display`);

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

              <button disabled>
                {t(`options.save`)}
              </button>
              <button disabled>
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
                <CategoryLanguage />
              </Match>
            </Switch>
          </div>
          <div class={style.optionsCloseWrapper}>
            <button onClick={() => setState(`optionsOpen`, false) }>{t(`generic.close`)}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptionsWrapper;