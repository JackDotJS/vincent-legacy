import { onMount, useContext } from 'solid-js';
import { StateContext } from '../../state/StateController';
import * as i18n from '@solid-primitives/i18n';
// import style from './CategoryInput.module.css';


// TODO
const CategoryInput = (props: { newConfig: any, setNewConfig: any }) => {
  const { dictionary } = useContext(StateContext);
  const t = i18n.translator(() => dictionary(), i18n.resolveTemplate);

  let listening = false;
  let buttonTarget: HTMLButtonElement | null = null;
  let currentKeyCombo = ``;

  const beginRebind = (ev: Event) => {
    listening = true;
    buttonTarget = ev.target as HTMLButtonElement;

    console.debug(`begin rebind`);
  };

  onMount(() => {
    document.addEventListener(`keydown`, (ev: KeyboardEvent) => {
      if (!listening || buttonTarget == null) return;

      ev.preventDefault();

      if (ev.repeat) return;

      if (currentKeyCombo.length > 0) {
        currentKeyCombo += ` + `;
      }

      currentKeyCombo += ev.key;

      console.debug(currentKeyCombo);
    });

    document.addEventListener(`keyup`, () => {
      if (!listening || buttonTarget == null) return;

      listening = false;

      console.debug(currentKeyCombo);

      buttonTarget.innerHTML = currentKeyCombo;

      currentKeyCombo = ``;

      console.debug(`finish rebind`);
    });

    // just to make the warning shut up for now
    console.debug(props.newConfig, props.setNewConfig);
  });

  return (
    <>
      <input placeholder={t(`options.input.searchKb`)} type="text" />
      <div>
        <input type="checkbox" checked/> 
        <span>example keybind</span>
        <button onClick={(ev) => beginRebind(ev)}>CTRL + A</button>
        <button onClick={(ev) => beginRebind(ev)}>CTRL + B</button>
      </div>
    </>
  );
};

export default CategoryInput;