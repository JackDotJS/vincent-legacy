import { For, useContext } from 'solid-js';
import { StateContext } from '../../state/StateController';
import * as i18n from '@solid-primitives/i18n';
import style from './OptionsWrapper.module.css';

const OptionsWrapper = () => {
  const { config, state, setState, setConfig, dictionary, langs } = useContext(StateContext);

  const t = i18n.translator(() => dictionary(), i18n.resolveTemplate);

  const langName = new Intl.DisplayNames([config.locale.replace(`_`, `-`)], {
    type: `language`
  });

  return (
    <div class={style.optionsWrapper} classList={{ [style.visible]: state.optionsOpen }}>
      <div class={style.sidebarWrapper}>
        <div class={style.sidebarScroller}>
          <div class={style.sidebar}>
            <h1>{t(`options.title`)}</h1>
            <div class={style.categories}>
              <button>{t(`options.categories.display`)}</button>
              <button>{t(`options.categories.theme`)}</button>
              <button>{t(`options.categories.controls`)}</button>
              <button>{t(`options.categories.keymapping`)}</button>
              <button>{t(`options.categories.plugins`)}</button>
              <button>{t(`options.categories.language`)}</button>
              <button>{t(`options.categories.system`)}</button>
              <button>{t(`options.categories.debug`)}</button>
              <button>{t(`options.categories.experimental`)}</button>
            </div>
          </div>
        </div>
      </div>

      <div class={style.optionsContentWrapper}>
        <div class={style.optionsContentSeparator}>
          <div class={style.optionsContent}>
            {/* <button onClick={() => setConfig(`locale`, `en_US`)}>set language en_US</button>
            <button onClick={() => setConfig(`locale`, `en_GB`)}>set language en_GB</button> */}
            <select onChange={(e) => setConfig(`locale`, e.target.value)}>
              <For each={langs()}>
                {(item) => {
                  const langCode = item.name.split(`.`)[0];
                  const langCodeFixed = langCode.replace(`_`, `-`);

                  if (langCode === config.locale) {
                    return (
                      <option value={langCode} selected>{langName.of(langCodeFixed)}</option>
                    );
                  } else {
                    return (
                      <option value={langCode}>{langName.of(langCodeFixed)}</option>
                    );
                  }
                }}
              </For>
            </select>
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