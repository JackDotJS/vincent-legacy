import { JSXElement, Show, useContext } from 'solid-js';
import style from './DropDown.module.css';
import { DropDownCollectionContext } from './DropDownCollection';

const SubMenu = (props: { label: string, children: JSXElement }): JSXElement => {
  const { targetElement, setTargetElement } = useContext(DropDownCollectionContext);

  let testRef!: HTMLSpanElement;
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

  return (
    <>
      <button 
        class={style.subMenuButton} 
        classList={{ [style.subMenuButtonActivated]: openSubMenu() }}
        onClick={() => clickHandler()}
        ref={buttonRef}
      >
        <span ref={testRef}>{props.label}</span>
        <span>{`>`}</span>
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
