import { JSXElement, Show, useContext, ValidComponent } from 'solid-js';
import style from './DropDown.module.css';
import { DropDownCollectionContext } from './DropDownCollection';
import { IconChevronRight } from '@tabler/icons-solidjs';
import { Dynamic } from 'solid-js/web';

const SubMenu = (props: { 
  label: string, 
  children: JSXElement,
  icon?: ValidComponent, 
  iconPos?: `left` | `right`,
}): JSXElement => {
  const { targetElement, setTargetElement } = useContext(DropDownCollectionContext);
  const finalIconPos = (props.iconPos ?? `left`);

  let buttonRef!: HTMLButtonElement;

  const openSubMenu = (): boolean => {
    return buttonRef.contains(targetElement());
  };

  const clickHandler = (): void => {
    // helps prevent submenus within submenus conflicting with eachother
    if (targetElement() === buttonRef) return;
    if (buttonRef.contains(targetElement())) return;
    setTargetElement(buttonRef);
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
    <>
      <button 
        class={style.subMenuButton} 
        classList={{ [style.subMenuButtonActivated]: openSubMenu() }}
        onClick={() => clickHandler()}
        ref={buttonRef}
      >
        <span class={style.label}>
          {labelTypes[finalIconPos]}
        </span>
        <IconChevronRight size={`1.25rem`}/>
        <Show when={openSubMenu()}>
          <div class={style.dropdownMenu}>
            {props.children}
          </div>
        </Show>
      </button>
    </>
  );
};

export default SubMenu;
