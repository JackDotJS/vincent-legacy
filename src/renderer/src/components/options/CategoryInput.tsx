import { JSXElement, createSignal, onMount, useContext } from 'solid-js';
import { StateContext } from '../../state/StateController';
import * as i18n from '@solid-primitives/i18n';
import style from './CategoryInput.module.css';


// TODO: signal to prevent inputs to other buttons while rebinding
// TODO: highlight keybind button when activing rebinding
// TODO: ability to delete and create new keybinds, probably just gonna copy blender's solution to this
const CategoryInput = (props: { newConfig: unknown, setNewConfig: unknown }): JSXElement => {
  const { dictionary } = useContext(StateContext);
  const t = i18n.translator(() => dictionary(), i18n.resolveTemplate) as Translator;

  const [listening, setListening] = createSignal(false);

  let buttonTarget: HTMLButtonElement | null = null;
  let oldLabel = ``;
  let currentKeyCombo = ``;

  const beginRebind = (ev: Event): void => {
    setListening(true);
    buttonTarget = ev.target as HTMLButtonElement;
    oldLabel = buttonTarget.innerText;

    buttonTarget.innerText = `...`;

    console.debug(`begin rebind`);
  };

  const finishRebind = (ev: MouseEvent|WheelEvent|KeyboardEvent): void => {
    if (!listening() || buttonTarget == null) return;
    if (ev.cancelable && !ev.defaultPrevented) ev.preventDefault();

    setListening(false);

    console.debug(currentKeyCombo);

    buttonTarget.innerText = currentKeyCombo.toUpperCase();

    currentKeyCombo = ``;

    console.debug(`finish rebind`);
  };

  onMount(async () => {
    const kblayout = await navigator.keyboard.getLayoutMap();

    document.addEventListener(`keydown`, (ev: KeyboardEvent) => {
      if (!listening() || buttonTarget == null) return;
      if (ev.cancelable && !ev.defaultPrevented) ev.preventDefault();

      if (ev.code === `Escape`) {
        setListening(false);
        currentKeyCombo = ``;

        buttonTarget.innerText = oldLabel;
        
        console.debug(`rebind cancelled`);
        return;
      }

      if (ev.repeat) return;

      if (currentKeyCombo.length > 0) {
        currentKeyCombo += ` + `;
      }

      const attemptTranslatedCode = kblayout.get(ev.code);

      const finalCode = attemptTranslatedCode ?? ev.code;

      console.debug(ev.code, finalCode);

      switch (finalCode) {
        case `ControlLeft`:
          currentKeyCombo += `LCtrl`;
          break;
        case `ControlRight`:
          currentKeyCombo += `RCtrl`;
          break;
        case `ShiftLeft`:
          currentKeyCombo += `LShift`;
          break;
        case `ShiftRight`:
          currentKeyCombo += `RShift`;
          break;
        case `AltLeft`:
          currentKeyCombo += `LAlt`;
          break;
        case `AltRight`:
          currentKeyCombo += `RAlt`;
          break;
        default:
          currentKeyCombo += finalCode;
      }

      if (finalCode.length === 1 || finalCode === `Space`) finishRebind(ev);
    });

    document.addEventListener(`keyup`, finishRebind);

    document.addEventListener(`mousedown`, (ev: MouseEvent) => {
      if (!listening() || buttonTarget == null) return;
      if (ev.cancelable && !ev.defaultPrevented) ev.preventDefault();

      if (currentKeyCombo.length > 0) {
        currentKeyCombo += ` + `;
      }

      switch (ev.button) {
        case 0:
          currentKeyCombo += `Left Mouse`;
          break;
        case 1:
          currentKeyCombo += `Middle Mouse`;
          break;
        case 2:
          currentKeyCombo += `Right Mouse`;
          break;
        case 3:
          currentKeyCombo += `Back`;
          break;
        case 4:
          currentKeyCombo += `Forward`;
          break;
      }
    });

    document.addEventListener(`contextmenu`, (ev: MouseEvent) => {
      if (!listening() || buttonTarget == null) return;
      if (ev.cancelable && !ev.defaultPrevented) ev.preventDefault();
    });

    document.addEventListener(`wheel`, (ev: WheelEvent) => {
      if (!listening() || buttonTarget == null) return;
      if (ev.cancelable && !ev.defaultPrevented) ev.preventDefault();

      console.debug(ev.deltaX, ev.deltaY, ev.deltaZ);

      if (currentKeyCombo.length > 0) {
        currentKeyCombo += ` + `;
      }

      if (ev.deltaX > 0) {
        currentKeyCombo += `MWheelRight`;
      } else if (ev.deltaX < 0) {
        currentKeyCombo += `MWheelLeft`;
      }

      if (ev.deltaY > 0) {
        currentKeyCombo += `MWheelDown`;
      } else if (ev.deltaY < 0) {
        currentKeyCombo += `MWheelUp`;
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
      <div class={style.kbActionItem}>
        <label>
          <input type="checkbox" checked/>
        </label>
        <input type="text" value="example keybind" />
        <button onClick={(ev) => beginRebind(ev)}>LCTRL + A</button>
      </div>
    </>
  );
};

export default CategoryInput;