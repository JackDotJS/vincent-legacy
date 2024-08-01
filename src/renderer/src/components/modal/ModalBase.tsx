import { createEffect, JSXElement, Show, useContext } from 'solid-js';
import { StateContext } from '../../state/StateController';
import style from './ModalBase.module.css';

const ModalBase = (): JSXElement => {
  const { state, setState } = useContext(StateContext);

  createEffect(() => {
    if (!state.modalOpen) setTimeout(() => {
      if (!state.modalOpen) setState(`modalContents`, null);
    }, 500);
  });

  return (
    <div class={style.overlay} classList={{ [style.modalOpen]: state.modalOpen }}>
      <div class={style.modalWrapper}>
        <div class={style.title}>
          <h1>{state.modalTitle}</h1>
          <button class={style.closeModal} onClick={() => setState(`modalOpen`, false)}>Close</button>
        </div>
        <Show when={state.modalContents != null}>
          {state.modalContents}
        </Show>
      </div>
    </div>
  );
};

export default ModalBase;
