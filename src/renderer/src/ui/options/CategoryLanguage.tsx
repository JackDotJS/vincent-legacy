import { createEffect, createSignal, For, JSXElement, onMount, useContext } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';
import { StateContext } from '../../state/StateController';
import style from './CategoryLanguage.module.css';
import { SetStoreFunction } from 'solid-js/store';
import { trackDeep } from '@solid-primitives/deep';

// TODO: show % language completion
// TODO: use dice's coefficient for search
// TODO: add a banner to encourage localization contributions
const CategoryLanguage = (props: { 
  newConfig: VincentConfig, 
  setNewConfig: SetStoreFunction<VincentConfig> 
}): JSXElement => {
  const { config, dictionary } = useContext(StateContext);

  const t = i18n.translator(() => dictionary(), i18n.resolveTemplate) as Translator;

  const [ langs, setLangs ] = createSignal<string[]>([]);

  let searchInput!: HTMLInputElement;
  let langList!: HTMLDivElement;

  const langItems: HTMLInputElement[] = [];

  const langNameGetter = (): Intl.DisplayNames => {
    return new Intl.DisplayNames([config.locale.replace(`_`, `-`)], {
      type: `language`
    });
  };

  const [langName, setLangNameGetter] = createSignal(langNameGetter());

  const updateSearch = (e: Event): void => {
    if (e.target == null) return;
    if (!(e.target instanceof HTMLInputElement)) return;

    const searchString = e.target.value.toLowerCase();

    const labels = langList.querySelectorAll(`label`);

    for (let i = 0; i < labels.length; i++) {
      const elem = labels[i];
      const sourceString = elem.innerText.toLowerCase();

      if (!sourceString.includes(searchString)) {
        elem.style.display = `none`;
      } else {
        elem.style.display = ``;
      }
    }
  };

  const updateCurrentSelected = (): void => {
    for (let i = 0; i < langItems.length; i++) {
      const item = langItems[i];
      const langCode = item.value;

      if (langCode === props.newConfig.locale) {
        item.checked = true;
      }
    }
  };

  createEffect(() => {
    trackDeep(props.newConfig);
    updateCurrentSelected();
  });

  createEffect(() => {
    setLangNameGetter(langNameGetter());
  });

  onMount(async () => {
    // UX: auto-focus on search text box when this category is opened
    searchInput.focus();

    const getLangs = await window.electron.fetchDictionaryList();
    setLangs(getLangs);
    updateCurrentSelected();
  });

  return (
    <>
      <input type="text" placeholder={t(`options.language.search`)} onInput={updateSearch} onChange={updateSearch} ref={searchInput}/>
      <div class={style.langList} ref={langList}>
        <For each={langs()}>
          {(langCode) => {
            console.debug(langCode);
            const langCodeFixed = langCode.replace(`_`, `-`);

            const nativeLangName = new Intl.DisplayNames([langCodeFixed], {
              type: `language`
            });

            return (
              <label class={style.langListItem}>
                <input type="radio" name="lang" value={langCode} ref={(el) => langItems.push(el)} onChange={(e) => props.setNewConfig(`locale`, e.target.value)} />
                <span>{nativeLangName.of(langCodeFixed)}</span>
                <span class={style.langNameTranslated}>{langName().of(langCodeFixed)}</span>
              </label>
            );
          }}
        </For>
      </div>
    </>
  );
};

export default CategoryLanguage;