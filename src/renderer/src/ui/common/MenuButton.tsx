import { JSXElement, useContext, ValidComponent } from 'solid-js';
import { DropDownCollectionContext } from './DropDownCollection';

import style from './DropDown.module.css';
import { emit } from '../../state/GlobalEventEmitter';
import getKeyCombo from '@renderer/util/getKeyCombo';
import { Dynamic } from 'solid-js/web';

const MenuButton = (props: { 
  label: string, 
  icon?: ValidComponent, 
  iconPos?: `left` | `right`, 
  actionId?: string
}): JSXElement => {
  const finalIconPos = (props.iconPos ?? `left`);

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

  const labelTypes = {
    left: <>
      <Dynamic component={props.icon} size={`1.25rem`} stroke={1.5} />
      <span class={style.labelText}>{props.label}</span>
    </>,
    right: <>
      <span class={style.labelText}>{props.label}</span>
      <Dynamic component={props.icon} size={`1.25rem`} stroke={1.5} />
    </>
  };

  return (
    <button class={style.menuButton} onClick={() => execute()}>
      <span class={style.label}>
        {labelTypes[finalIconPos]}
      </span>
      <span class={style.shortcut}>{getActionBind()}</span>
    </button>
  );
};

export default MenuButton;
