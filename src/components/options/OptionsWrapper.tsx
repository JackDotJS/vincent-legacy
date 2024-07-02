import { useContext } from 'solid-js';
import { StateContext } from '../../state/StateController';
import * as i18n from '@solid-primitives/i18n';
import style from './OptionsWrapper.module.css';

const OptionsWrapper = () => {
  const { state, setState, setConfig, dictionary } = useContext(StateContext);

  const t = i18n.translator(() => dictionary(), i18n.resolveTemplate);

  return (
    <div class={style.optionsWrapper} classList={{ [style.visible]: state.optionsOpen }}>
      <h1>{t(`options.title`)}</h1>
      <button onClick={() => setState(`optionsOpen`, false) }>{t(`generic.close`)}</button>
      <button onClick={() => setConfig(`locale`, `en_US`)}>set language en_US</button>
      <button onClick={() => setConfig(`locale`, `en_GB`)}>set language en_GB</button>
    </div>
  );
};

export default OptionsWrapper;