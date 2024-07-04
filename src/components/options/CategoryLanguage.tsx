import { For, createEffect, createSignal, onMount, useContext } from 'solid-js';
import { StateContext } from '../../state/StateController';
import style from './CategoryLanguage.module.css';

const CategoryLanguage = (props: { newConfig: any, setNewConfig: any }) => {
  const { config, langs } = useContext(StateContext);

  let searchInput!: HTMLInputElement;
  let langList!: HTMLDivElement;
  const langItems: HTMLInputElement[] = [];

  const langNameGetter = () => {
    return new Intl.DisplayNames([config.locale.replace(`_`, `-`)], {
      type: `language`
    });
  };

  const [langName, setLangNameGetter] = createSignal(langNameGetter());

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

  createEffect(() => {
    for (let i = 0; i < langItems.length; i++) {
      const item = langItems[i];
      const langCode = item.value;

      if (langCode === props.newConfig.locale) {
        item.checked = true;
      }
    }
  });

  createEffect(() => {
    setLangNameGetter(langNameGetter());
  });

  onMount(() => {
    // UX: auto-focus on search text box when this category is opened
    searchInput.focus();
  });

  return (
    <>
      <input type="text" placeholder="Search Languages" onInput={updateSearch} onChange={updateSearch} ref={searchInput}/>
      <div class={style.langList} ref={langList}>
        <For each={langs()}>
          {(item) => {
            const langCode = item.name.split(`.`)[0];
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