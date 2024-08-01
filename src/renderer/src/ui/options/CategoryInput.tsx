import { For, JSXElement, createEffect, createSignal, useContext } from 'solid-js';
import { SetStoreFunction, unwrap } from 'solid-js/store';
import { StateContext } from '../../state/StateController';
import InputHandler from '../../state/InputHandler';

import * as i18n from '@solid-primitives/i18n';
import style from './CategoryInput.module.css';

interface KeybindItem {
  enabled: boolean,
  action: string,
  keyCombo: string[]
}

const kblayout = await navigator.keyboard.getLayoutMap();

// TODO: action categories
// TODO: import/export keymaps
// TODO: search function
// TODO: highlight conflicting keybinds
const CategoryInput = (props: { newConfig: VincentConfig, setNewConfig: SetStoreFunction<VincentConfig> }): JSXElement => {
  const { dictionary } = useContext(StateContext);
  const t = i18n.translator(() => dictionary(), i18n.resolveTemplate) as Translator;

  const [ listening, setListening ] = createSignal(false);

  let keyComboListener = ``;

  const translateInputCodes = (keycombo: string[]): string[] => {
    const translated: string[] = [];

    for (const item of keycombo) {
      translated.push(kblayout.get(item) ?? item);
    }

    // console.debug(`before`, keycombo);
    // console.debug(`after`, translated);

    return translated;
  };

  const beginRebind = (ev: MouseEvent, index: number): void => {
    if (ev.target == null) return;
    const button = ev.target as HTMLButtonElement;
    setListening(true);
    InputHandler.setDefaultsPrevented(true);

    const oldText = button.innerText;
    button.innerText = `...`;

    button.classList.add(style.rebinding);

    const cancelFunction = (): void => {
      setListening(false);
      InputHandler.setDefaultsPrevented(false);
      button.innerText = oldText;
      button.classList.remove(style.rebinding);
      InputHandler.offInputChange(keyComboListener);
      console.debug(`rebind cancelled`);
    };

    window.addEventListener(`keydown`, (ev: KeyboardEvent) => {
      if (![`Escape`, `MetaLeft`, `MetaRight`].includes(ev.code)) return;
      cancelFunction();
    });
    window.addEventListener(`blur`, cancelFunction);

    // eslint-disable-next-line solid/reactivity
    keyComboListener = InputHandler.onInputChange((keyCombo) => {
      setListening(false);
      InputHandler.setDefaultsPrevented(false);

      props.setNewConfig(`keymap`, index, {
        enabled: props.newConfig.keymap[index].enabled,
        action: props.newConfig.keymap[index].action, 
        keyCombo: structuredClone(keyCombo)
      });

      button.innerText = translateInputCodes(keyCombo).join(` + `).toUpperCase();
      button.classList.remove(style.rebinding);

      InputHandler.offInputChange(keyComboListener);
      window.removeEventListener(`keydown`, cancelFunction);
      window.removeEventListener(`blur`, cancelFunction);

      console.debug(`finish rebind`);
    });

    console.debug(`begin rebind`);
  };

  const removeKeybind = (index: number): void => {
    const oldKeymap = structuredClone(unwrap(props.newConfig.keymap));
    const filtered = oldKeymap.filter((_item, filterIndex) => index !== filterIndex);
    props.setNewConfig(`keymap`, filtered);
  };

  const addNewKeybind = (): void => {
    props.setNewConfig(`keymap`, (currentKeymap) => [
      ...currentKeymap,
      { 
        enabled: true, 
        action: ``, 
        keyCombo: [] 
      }
    ]);
  };

  const setKeybindEnabled = (enabled: boolean, index: number): void => {
    props.setNewConfig(`keymap`, index, {
      enabled: enabled,
      action: props.newConfig.keymap[index].action, 
      keyCombo: props.newConfig.keymap[index].keyCombo
    });
  };

  const setKeybindActionId = (ev: Event, index: number): void => {
    if (ev.target == null) return;
    const textbox = ev.target as HTMLInputElement;

    props.setNewConfig(`keymap`, index, {
      enabled: props.newConfig.keymap[index].enabled,
      action: textbox.value, 
      keyCombo: props.newConfig.keymap[index].keyCombo
    });
  };

  return (
    <>
      <div classList={{ [style.disableClicks]: listening() }} />
      <input placeholder={t(`options.input.search`)} type="text" />
      <div class={style.columnNames}>
        <span class={style.columnActionName}>{t(`options.input.actionColumn`)}</span>
        <span class={style.columnKeybind}>{t(`options.input.keybindColumn`)}</span>
      </div>
      <For each={props.newConfig.keymap}>
        {(item: KeybindItem, index) => {
          let toggle!: HTMLInputElement;
          let actionId!: HTMLInputElement;
          let keybind!: HTMLButtonElement;

          createEffect(() => {
            toggle.checked = item.enabled;

            // TODO: maybe make these slightly transparent 
            // instead of completely disabling them?
            actionId.disabled = !item.enabled;
            keybind.disabled = !item.enabled;
          });

          return (
            <div class={style.keybindItem}>
              <label class={style.keybindToggle}>
                <input 
                  onChange={(ev) => setKeybindEnabled(ev.target.checked, index())} 
                  type="checkbox" 
                  ref={toggle}
                />
              </label>
              <input 
                onChange={(ev) => setKeybindActionId(ev, index())} 
                class={style.keybindActionId} 
                type="text" 
                value={item.action} 
                ref={actionId}
              />
              <button 
                class={style.keybindKeyCombo} 
                onClick={(ev) => beginRebind(ev, index())}
                ref={keybind}
              >
                {translateInputCodes(item.keyCombo).join(` + `).toUpperCase()}
              </button>
              <button class={style.keybindDelete} onClick={() => removeKeybind(index())}>Delete</button>
            </div>
          );
        }}
      </For>
      <button onClick={() => addNewKeybind()}>add new</button>
    </>
  );
};

export default CategoryInput;