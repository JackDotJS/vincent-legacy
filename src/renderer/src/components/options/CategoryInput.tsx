import { For, JSXElement, createSignal, onMount, useContext } from 'solid-js';
import { createStore, SetStoreFunction, unwrap } from 'solid-js/store';
import { StateContext } from '../../state/StateController';
import { disableDefaults, enableDefaults, offKeyCombo, onKeyCombo } from '../../util/InputListener';

import * as i18n from '@solid-primitives/i18n';
import style from './CategoryInput.module.css';

interface KeybindItem {
  action: string,
  keyCombo: string[]
}

const kblayout = await navigator.keyboard.getLayoutMap();

// TODO: action categories
const CategoryInput = (props: { newConfig: VincentConfig, setNewConfig: SetStoreFunction<VincentConfig> }): JSXElement => {
  const { dictionary } = useContext(StateContext);
  const t = i18n.translator(() => dictionary(), i18n.resolveTemplate) as Translator;

  const [ keybinds, setKeybinds ] = createStore<KeybindItem[]>(props.newConfig.keymap);
  const [ listening, setListening ] = createSignal(false);

  let keyComboListener = ``;

  const translateInputCodes = (keycombo: string[]): string[] => {
    const translated: string[] = [];

    for (const item of keycombo) {
      translated.push(kblayout.get(item) ?? item);
    }

    console.debug(`before`, keycombo);
    console.debug(`after`, translated);

    return translated;
  }

  const beginRebind = (ev: MouseEvent, index: number): void => {
    if (ev.target == null) return;
    const button = ev.target as HTMLButtonElement;
    setListening(true);
    disableDefaults();

    const oldText = button.innerText;
    button.innerText = `...`;

    button.classList.add(style.rebinding);

    const cancelFunction = (): void => {
      setListening(false);
      enableDefaults();
      button.innerText = oldText;
      button.classList.remove(style.rebinding);
      offKeyCombo(keyComboListener);
      console.debug(`rebind cancelled`);
    }

    window.addEventListener(`keydown`, (ev: KeyboardEvent) => {
      if (![`Escape`, `MetaLeft`, `MetaRight`].includes(ev.code)) return;
      cancelFunction()
    });
    window.addEventListener(`blur`, cancelFunction);

    keyComboListener = onKeyCombo((keyCombo) => {
      setListening(false);
      enableDefaults();

      const translated = translateInputCodes(keyCombo);

      setKeybinds(index, {
        action: keybinds[index].action, 
        keyCombo: translated
      });

      button.innerText = translated.join(` + `).toUpperCase();
      button.classList.remove(style.rebinding);

      offKeyCombo(keyComboListener);
      window.removeEventListener(`keydown`, cancelFunction);
      window.removeEventListener(`blur`, cancelFunction);

      console.debug(`finish rebind`);
    });

    console.debug(`begin rebind`);
  };

  const removeKeybind = (index: number): void => {
    setKeybinds((old) => {
      return old.filter((_item, filterIndex) => index !== filterIndex)
    });
  }

  const addNewKeybind = (): void => {
    setKeybinds((old) => {
      return old.concat([{ action: ``, keyCombo: [] }])
    })
  }

  onMount(() => {
    // just to make the warning shut up for now
    props.setNewConfig(`keymap`, keybinds);
  });

  return (
    <>
      <div classList={{ [style.disableClicks]: listening() }} />
      <input placeholder={t(`options.input.searchKb`)} type="text" />
      <div class={style.columnNames}>
        <span class={style.columnActionName}>Action</span>
        <span class={style.columnKeybind}>Keybind</span>
      </div>
      <For each={keybinds}>
        {(item: KeybindItem, index) => {
          return (
            <div class={style.keybindItem}>
              <label class={style.keybindToggle}>
                <input type="checkbox" checked/>
              </label>
              <input class={style.keybindActionId} type="text" value={item.action} />
              <button 
                class={style.keybindKeyCombo} 
                onClick={(ev) => beginRebind(ev, index())}
              >
                {translateInputCodes(item.keyCombo).join(` + `).toUpperCase()}
              </button>
              <button class={style.keybindDelete} onClick={() => removeKeybind(index())}>Delete</button>
            </div>
          )
        }}
      </For>
      <button onClick={() => addNewKeybind()}>add new</button>
    </>
  );
};

export default CategoryInput;