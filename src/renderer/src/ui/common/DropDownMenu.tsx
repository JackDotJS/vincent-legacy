import { createUniqueId, JSXElement, Show, useContext } from 'solid-js';
import { DropDownCollectionContext } from './DropDownCollection';

import style from './DropDown.module.css';

const DropDown = (props: { label: string, children?: JSXElement }): JSXElement => {
  const { activated, setActivated, selectedId, setSelectedId, targetElement, setTargetElement } = useContext(DropDownCollectionContext);

  const buttonId = createUniqueId();
  let lastTarget: Element|null = null;
  let timeout = -1;

  const startCountdown = (): void => {
    timeout = setTimeout(() => {
      if (lastTarget == null) return;
      if (lastTarget === targetElement()) return;
      setTargetElement(lastTarget);
      // console.debug(`new target: `, lastTarget);
    }, 500);
  };

  const cancelCountdown = (): void => {
    clearTimeout(timeout);
  };

  const updateSelected = (): void => {
    setSelectedId(buttonId);
  };

  const isSelected = (): boolean => {
    return selectedId() === buttonId;
  };

  const movement = (ev: PointerEvent): void => {
    if (ev.target == null) return;
    if (!(activated() && isSelected())) return;
    if (lastTarget === ev.target) return;
    lastTarget = ev.target as Element;
    cancelCountdown();
    startCountdown();
  };

  const clickHandler = (): void => {
    setActivated(true);
    updateSelected();
  };

  return (
    <>
      <button 
        class={style.dropdownButton} 
        onPointerOver={() => updateSelected()}
        classList={{ [style.opened]: activated() && isSelected() }}
        onPointerMove={(ev) => movement(ev)}
        onClick={() => clickHandler()}
      >
        {props.label}
        <Show when={activated() && isSelected()}>
          <div class={style.dropdownMenu}>
            {props.children}
          </div>
        </Show>
      </button>
    </>
  );
};

export default DropDown;
