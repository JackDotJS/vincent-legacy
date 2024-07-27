import { createUniqueId, JSXElement, Show, useContext } from 'solid-js';
import { DropDownCollectionContext } from './DropDownCollection';

import style from './DropDown.module.css';

const DropDown = (props: { label: string, children?: JSXElement }): JSXElement => {
  const { activated, selectedId, setSelectedId } = useContext(DropDownCollectionContext);

  const buttonId = createUniqueId();

  const updateSelected = (): void => {
    setSelectedId(buttonId);
  };

  const isSelected = (): boolean => {
    return selectedId() === buttonId;
  };

  return (
    <>
      <button class={style.dropdownButton} onPointerOver={() => updateSelected()}>
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
