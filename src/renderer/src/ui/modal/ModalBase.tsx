import { createEffect, JSXElement, useContext } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { StateContext } from '../../state/StateController';
import style from './ModalBase.module.css';
import NewFileModal from './newFile/ModalNewFile';

const modalIndex = {
  none: (): string => ``,
  newFile: NewFileModal
};

const ModalBase = (): JSXElement => {
  const { state, setState } = useContext(StateContext);

  createEffect(() => {
    if (!state.modal.open) setTimeout(() => {
      if (!state.modal.open) setState(`modal`, `contents`, `none`);
    }, 500);
  });

  return (
    <div class={style.overlay} classList={{ [style.modalOpen]: state.modal.open }}>
      <div class={style.modalWrapper}>
        <div class={style.title}>
          <h1>{state.modal.title}</h1>
          <button class={style.closeModal} onClick={() => setState(`modal`, `open`, false)}>Close</button>
        </div>
        <Dynamic component={modalIndex[state.modal.contents]} />
      </div>
    </div>
  );
};

export default ModalBase;
