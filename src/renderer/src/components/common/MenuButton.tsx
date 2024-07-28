import { JSXElement, useContext } from 'solid-js';
import { DropDownCollectionContext } from './DropDownCollection';

import style from './DropDown.module.css';

const MenuButton = (props: { label: string, actionId?: string }): JSXElement => {
  const { setActivated } = useContext(DropDownCollectionContext);

  return (
    <>
      <button class={style.dropdownButton} onClick={() => setActivated(false)}>
        <span>{props.label}</span>
        <span>{props.actionId}</span>
      </button>
    </>
  );
};

export default MenuButton;
