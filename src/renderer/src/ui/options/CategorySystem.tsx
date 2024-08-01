import { JSXElement, useContext } from 'solid-js';
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

  return (
    <>
      <button onClick={() => props.setNewConfig(reconcile(defaultConfig))}>{t(`options.system.resetOptions`)}</button>
    </>
  );
};

export default CategorySystem;