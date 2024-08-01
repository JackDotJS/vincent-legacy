import { JSXElement, useContext } from 'solid-js';
import { DropDownCollectionContext } from './DropDownCollection';

import style from './DropDown.module.css';
import { emit } from '../../state/GlobalEventEmitter';
import getKeyCombo from '@renderer/util/getKeyCombo';

const MenuButton = (props: { label: string, actionId?: string }): JSXElement => {
  const { setActivated } = useContext(DropDownCollectionContext);

  const execute = (): void => {
    setActivated(false);
    if (props.actionId) {
      emit(props.actionId);
    }
  };

  const getActionBind = (): string => {
    if (props.actionId == null) return ``;
    const result = getKeyCombo(props.actionId);
    if (result.length === 0) return ``;
    return result[0];
  };

  return (
    <>
      <button class={style.menuButton} onClick={() => execute()}>
        <span>{props.label}</span>
        <span class={style.shortcut}>{getActionBind()}</span>
      </button>
    </>
  );
};

export default MenuButton;
