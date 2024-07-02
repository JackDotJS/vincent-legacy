import { useContext } from 'solid-js';
import { StateContext } from './state/StateController';
import * as i18n from '@solid-primitives/i18n';
import OptionsWrapper from './components/options/OptionsWrapper';

const App = () => {
  const { setState, dictionary } = useContext(StateContext);

  const t = i18n.translator(() => dictionary(), i18n.resolveTemplate);

  return (
    <>
      <OptionsWrapper/>
      <h1>{t(`helloworld`)}</h1>
      <button onClick={() => setState(`optionsOpen`, true) }>{t(`options.title`)}</button>
    </>
  );
};

export default App;
