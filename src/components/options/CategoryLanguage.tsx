import { For, createEffect, createSignal, onMount, useContext } from 'solid-js';
import { StateContext } from '../../state/StateController';
import style from './CategoryLanguage.module.css';

const CategoryLanguage = () => {
  const { config, setConfig, langs } = useContext(StateContext);

  let searchInput!: HTMLInputElement;
  let langList!: HTMLDivElement;

  const langNameGetter = () => {
    return new Intl.DisplayNames([config.locale.replace(`_`, `-`)], {
      type: `language`
    });
  };

  const [langName, setLangNameGetter] = createSignal(langNameGetter());

  createEffect(() => {
    setLangNameGetter(langNameGetter());
  });

  onMount(() => {
    const updateSearch = (e: Event) => {
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

    searchInput.addEventListener(`input`, updateSearch);
    searchInput.addEventListener(`change`, updateSearch);

    // UX: auto-focus on search text box when this category is opened
    searchInput.focus();
  });

  return (
    <>
      {/* TODO: need apply/save function for config changes */}
      <input type="text" placeholder="Search Languages" ref={searchInput}/>
      <div class={style.langList} ref={langList}>
        <For each={langs()}>
          {(item) => {
            const langCode = item.name.split(`.`)[0];
            const langCodeFixed = langCode.replace(`_`, `-`);

            const nativeLangName = new Intl.DisplayNames([langCodeFixed], {
              type: `language`
            });

            if (langCode === config.locale) {
              return (
                <label class={style.langListItem}>
                  <input type="radio" name="lang" value={langCode} checked onChange={(e) => setConfig(`locale`, e.target.value)}/>
                  <span>{nativeLangName.of(langCodeFixed)}</span>
                  <span class={style.langNameTranslated}>{langName().of(langCodeFixed)}</span>
                </label>
              );
            } else {
              return (
                <label class={style.langListItem}>
                  <input type="radio" name="lang" value={langCode} onChange={(e) => setConfig(`locale`, e.target.value)} />
                  <span>{nativeLangName.of(langCodeFixed)}</span>
                  <span class={style.langNameTranslated}>{langName().of(langCodeFixed)}</span>
                </label>
              );
            }
          }}
        </For>
      </div>
    </>
  );
};

export default CategoryLanguage;