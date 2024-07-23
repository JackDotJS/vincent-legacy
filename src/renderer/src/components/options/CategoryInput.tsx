import { For, JSXElement, createSignal, onMount, useContext } from 'solid-js';
import { StateContext } from '../../state/StateController';
import * as i18n from '@solid-primitives/i18n';
import style from './CategoryInput.module.css';
import { createStore } from 'solid-js/store';

interface KeybindItem {
  action: string,
  keyCombo: string[]
}

const kblayout = await navigator.keyboard.getLayoutMap()

// TODO: highlight keybind button when activing rebinding
// TODO: ability to delete and create new keybinds, probably just gonna copy blender's solution to this
// TODO: move a bunch of this input capturing logic to its own module
// TODO: fix reactivity regarding keybind changes (may still need to use button innertext thing)
// TODO: save/load keybinds to/from config
const CategoryInput = (props: { newConfig: unknown, setNewConfig: unknown }): JSXElement => {
  const { dictionary } = useContext(StateContext);
  const t = i18n.translator(() => dictionary(), i18n.resolveTemplate) as Translator;

  const [ keybinds, setKeybinds ] = createStore<KeybindItem[]>([
    { action: `Cut`, keyCombo: [ `ControlLeft`, `x` ] },
    { action: `Copy`, keyCombo: [ `ControlLeft`, `c` ] },
    { action: `Paste`, keyCombo: [ `ControlLeft`, `v` ] },
    { action: `ComplicatedKeybind`, keyCombo: [ `ControlLeft`, `AltLeft`, `ShiftLeft`, `z` ] }
  ]);
  const [ listening, setListening ] = createSignal(false);

  let targetIndex: number | null = null;
  let currentKeyCombo: string[] = [];

  const beginRebind = (index: number): void => {
    setListening(true);
    targetIndex = index;

    console.debug(`begin rebind`);
  };

  const finishRebind = (ev: MouseEvent|WheelEvent|KeyboardEvent): void => {
    if (!listening() || targetIndex == null) return;
    if (ev.cancelable && !ev.defaultPrevented) ev.preventDefault();

    setListening(false);

    setKeybinds(targetIndex, { 
      action: keybinds[targetIndex].action, 
      keyCombo: currentKeyCombo
    });

    console.debug(keybinds);

    currentKeyCombo = [];

    console.debug(`finish rebind`);
  };

  const getShortenedKeyName = (key: string): string => {
    let newKey: string = key;

    switch (key) {
      case `ControlLeft`:
        newKey = `LCtrl`;
        break;
      case `ControlRight`:
        newKey = `RCtrl`;
        break;
      case `ShiftLeft`:
        newKey = `LShift`;
        break;
      case `ShiftRight`:
        newKey = `RShift`;
        break;
      case `AltLeft`:
        newKey = `LAlt`;
        break;
      case `AltRight`:
        newKey = `RAlt`;
        break;
    }

    console.debug(key, newKey);

    return newKey;
  }

  onMount(() => {
    document.addEventListener(`keydown`, (ev: KeyboardEvent) => {
      if (!listening() || targetIndex == null) return;
      if (ev.cancelable && !ev.defaultPrevented) ev.preventDefault();

      if ([`Escape`, `MetaLeft`, `MetaRight`].includes(ev.code)) {
        setListening(false);
        currentKeyCombo = [];
        
        console.debug(`rebind cancelled`);
        return;
      }

      if (ev.repeat) return;

      const attemptTranslatedCode = kblayout.get(ev.code);

      const finalCode = attemptTranslatedCode ?? ev.code;

      console.debug(ev.code, finalCode);

      currentKeyCombo.push(finalCode);

      // buttonTarget.innerText = (currentKeyCombo.join(` + `) + ` + ...`).toUpperCase();

      if (finalCode.length === 1 || finalCode === `Space`) finishRebind(ev);
    });

    document.addEventListener(`keyup`, finishRebind);

    document.addEventListener(`mousedown`, (ev: MouseEvent) => {
      if (!listening() || targetIndex == null) return;
      if (ev.cancelable && !ev.defaultPrevented) ev.preventDefault();

      switch (ev.button) {
        case 0:
          currentKeyCombo.push(`Left Mouse`);
          break;
        case 1:
          currentKeyCombo.push(`Middle Mouse`);
          break;
        case 2:
          currentKeyCombo.push(`Right Mouse`);
          break;
        case 3:
          currentKeyCombo.push(`Back`);
          break;
        case 4:
          currentKeyCombo.push(`Forward`);
          break;
      }

      finishRebind(ev);
    });

    document.addEventListener(`contextmenu`, (ev: MouseEvent) => {
      if (!listening() || targetIndex == null) return;
      if (ev.cancelable && !ev.defaultPrevented) ev.preventDefault();
    });

    document.addEventListener(`wheel`, (ev: WheelEvent) => {
      if (!listening() || targetIndex == null) return;
      if (ev.cancelable && !ev.defaultPrevented) ev.preventDefault();

      console.debug(ev.deltaX, ev.deltaY, ev.deltaZ);

      if (ev.deltaX > 0) {
        currentKeyCombo.push(`MWheelRight`);
      } else if (ev.deltaX < 0) {
        currentKeyCombo.push(`MWheelLeft`);
      }

      if (ev.deltaY > 0) {
        currentKeyCombo.push(`MWheelDown`);
      } else if (ev.deltaY < 0) {
        currentKeyCombo.push(`MWheelUp`);
      }

      finishRebind(ev);
    });

    document.addEventListener(`mouseup`, finishRebind);

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
          const translatedKeys: string[] = [];

          for (const key of item.keyCombo) {
            translatedKeys.push(getShortenedKeyName(kblayout.get(key) ?? key))
          }

          return (
            <div class={style.kbActionItem}>
              <label>
                <input type="checkbox" checked/>
              </label>
              <input type="text" value={item.action} />
              <button onClick={() => beginRebind(index())}>
                {translatedKeys.join(` + `).toUpperCase()}
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