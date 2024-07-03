import { For, createEffect, createSignal, useContext } from 'solid-js';
import { StateContext } from '../../state/StateController';

const CategoryLanguage = () => {
  const { config, setConfig, langs } = useContext(StateContext);

  const langNameGetter = () => {
    return new Intl.DisplayNames([config.locale.replace(`_`, `-`)], {
      type: `language`
    });
  };

  const [langName, setLangNameGetter] = createSignal(langNameGetter());

  createEffect(() => {
    setLangNameGetter(langNameGetter());
  });

  return (
    <select onChange={(e) => setConfig(`locale`, e.target.value)}>
      {/* TODO: need apply/save function for config changes */}
      <For each={langs()}>
        {(item) => {
          const langCode = item.name.split(`.`)[0];
          const langCodeFixed = langCode.replace(`_`, `-`);

          if (langCode === config.locale) {
            return (
              <option value={langCode} selected>{langName().of(langCodeFixed)}</option>
            );
          } else {
            return (
              <option value={langCode}>{langName().of(langCodeFixed)}</option>
            );
          }
        }}
      </For>
    </select>
  );
};

export default CategoryLanguage;