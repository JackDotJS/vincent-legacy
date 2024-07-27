import { For, JSXElement, createSignal, onMount, useContext } from 'solid-js';
import { StateContext } from '../../state/StateController';
import * as i18n from '@solid-primitives/i18n';
import style from './CategoryInput.module.css';
import { createStore } from 'solid-js/store';

interface KeybindItem {
  action: string,
  keyCombo: string[]
}

// const kblayout = await navigator.keyboard.getLayoutMap();

// TODO: highlight keybind button when activing rebinding
// TODO: ability to delete and create new keybinds, probably just gonna copy blender's solution to this
// TODO: move a bunch of this input capturing logic to its own module
// TODO: fix reactivity regarding keybind changes (may still need to use button innertext thing)
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

  // let targetIndex: number | null = null;
  // let currentKeyCombo: string[] = [];

  // const beginRebind = (index: number): void => {
  //   setListening(true);
  //   targetIndex = index;

  //   console.debug(`begin rebind`);
  // };

  // const finishRebind = (ev: MouseEvent|WheelEvent|KeyboardEvent): void => {
  //   if (!listening() || targetIndex == null) return;
  //   if (ev.cancelable && !ev.defaultPrevented) ev.preventDefault();

  //   setListening(false);

  //   setKeybinds(targetIndex, { 
  //     action: keybinds[targetIndex].action, 
  //     keyCombo: currentKeyCombo
  //   });

  //   console.debug(keybinds);

  //   currentKeyCombo = [];

  //   console.debug(`finish rebind`);
  // };

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
        {(item: KeybindItem) => {
          return (
            <div class={style.kbActionItem}>
              <label>
                <input type="checkbox" checked/>
              </label>
              <input type="text" value={item.action} />
              <button /*onClick={() => beginRebind(index())}*/>
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