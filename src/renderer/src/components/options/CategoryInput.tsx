import { For, JSXElement, createSignal, onMount, useContext } from 'solid-js';
import { createStore } from 'solid-js/store';
import { StateContext } from '../../state/StateController';
import { disableDefaults, enableDefaults, offKeyCombo, onKeyCombo } from '../../util/InputListener';

import * as i18n from '@solid-primitives/i18n';
import style from './CategoryInput.module.css';

interface KeybindItem {
  action: string,
  keyCombo: string[]
}

// const kblayout = await navigator.keyboard.getLayoutMap();

// TODO: highlight keybind button when activing rebinding
// TODO: ability to delete and create new keybinds, probably just gonna copy blender's solution to this
// TODO: save/load keybinds to/from config
// TODO: action categories
const CategoryInput = (props: { newConfig: unknown, setNewConfig: unknown }): JSXElement => {
  const { dictionary } = useContext(StateContext);
  const t = i18n.translator(() => dictionary(), i18n.resolveTemplate) as Translator;

  const [ keybinds, setKeybinds ] = createStore<KeybindItem[]>([
    { action: `Cut`, keyCombo: [ `Ctrl`, `x` ] },
    { action: `Copy`, keyCombo: [ `Ctrl`, `c` ] },
    { action: `Paste`, keyCombo: [ `Ctrl`, `v` ] },
    { action: `ComplicatedKeybind`, keyCombo: [ `Ctrl`, `Alt`, `Shift`, `z` ] }
  ]);
  const [ listening, setListening ] = createSignal(false);

  let keyComboListener = ``;

  const beginRebind = (ev: MouseEvent, index: number): void => {
    if (ev.target == null) return;
    const button = ev.target as HTMLButtonElement;
    setListening(true);
    disableDefaults();

    const oldText = button.innerText;

    button.innerText = `...`;

    const cancelFunction = (): void => {
      setListening(false);
      enableDefaults();
      button.innerText = oldText;
      offKeyCombo(keyComboListener);
    }

    window.addEventListener(`keydown`, (ev: KeyboardEvent) => {
      if ([`Escape`, `MetaLeft`, `MetaRight`].includes(ev.code)) return;
      cancelFunction()
    });
    window.addEventListener(`blur`, cancelFunction);

    keyComboListener = onKeyCombo((keyCombo) => {
      setListening(false);
      enableDefaults();

      console.debug(keyCombo);

      setKeybinds(index, {
        action: keybinds[index].action, 
        keyCombo: [...keyCombo]
      });

      button.innerText = keyCombo.join(` + `).toUpperCase();

      offKeyCombo(keyComboListener);
      window.removeEventListener(`keydown`, cancelFunction);

      console.debug(keybinds);

      console.debug(`finish rebind`);
    });

    console.debug(`begin rebind`);
  };

  onMount(() => {
    // just to make the warning shut up for now
    console.debug(props.newConfig, props.setNewConfig);
  });

  return (
    <>
      <div classList={{ [style.disableClicks]: listening() }} />
      <input placeholder={t(`options.input.searchKb`)} type="text" />
      <div class={style.kbLegend}>
        <span class={style.kbLegendTitle}>Action</span>
        <span class={style.kbLegendPrimary}>Keybind</span>
      </div>
      <For each={keybinds}>
        {(item: KeybindItem, index) => {
          return (
            <div class={style.kbActionItem}>
              <label>
                <input type="checkbox" checked/>
              </label>
              <input type="text" value={item.action} />
              <button onClick={(ev) => beginRebind(ev, index())}>
                {item.keyCombo.join(` + `).toUpperCase()}
              </button>
            </div>
          )
        }}
      </For>
      <button onClick={() => setKeybinds((old) => old.concat([{ action: ``, keyCombo: [] }]) )}>add new</button>
    </>
  );
};

export default CategoryInput;