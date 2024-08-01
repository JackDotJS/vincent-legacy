import { createEffect, JSXElement } from 'solid-js';
// import * as i18n from '@solid-primitives/i18n';
// import { StateContext } from '../../state/StateController';
import { SetStoreFunction } from 'solid-js/store';

const CategoryDebug = (props: { 
  newConfig: VincentConfig, 
  setNewConfig: SetStoreFunction<VincentConfig> 
}): JSXElement => {
  // const { dictionary } = useContext(StateContext);

  // const t = i18n.translator(() => dictionary(), i18n.resolveTemplate) as Translator;

  let historyToggle!: HTMLInputElement;

  const toggleHistory = (ev: Event): void => {
    if (ev.target != null && ev.target instanceof HTMLInputElement) {
      props.setNewConfig(`debug`, `historyVisualizer`, ev.target.checked);
    }
  };

  createEffect(() => {
    historyToggle.checked = props.newConfig.debug.historyVisualizer;
  });

  return (
    <>
      <label>
        show history visualizer:
        <input type="checkbox" onChange={(ev) => toggleHistory(ev)} ref={historyToggle} />
      </label>
    </>
  );
};

export default CategoryDebug;