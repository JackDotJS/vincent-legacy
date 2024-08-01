import { createEffect, JSXElement, useContext } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';
import { StateContext } from '../../state/StateController';
import { reconcile, SetStoreFunction } from 'solid-js/store';
import defaultConfig from '../../../../common/defaultConfig.json';

const CategorySystem = (props: { 
  newConfig: VincentConfig, 
  setNewConfig: SetStoreFunction<VincentConfig> 
}): JSXElement => {
  const { dictionary } = useContext(StateContext);

  const t = i18n.translator(() => dictionary(), i18n.resolveTemplate) as Translator;

  let debugToggle!: HTMLInputElement;

  const toggleDebug = (ev: Event): void => {
    if (ev.target != null && ev.target instanceof HTMLInputElement) {
      props.setNewConfig(`debug`, `enabled`, ev.target.checked);
    }
  };

  createEffect(() => {
    debugToggle.checked = props.newConfig.debug.enabled;
  });

  return (
    <>
      <label>
        enable debug mode:
        <input type="checkbox" onChange={(ev) => toggleDebug(ev)} ref={debugToggle} />
      </label>
      <button onClick={() => props.setNewConfig(reconcile(defaultConfig))}>{t(`options.system.resetOptions`)}</button>
    </>
  );
};

export default CategorySystem;