import { JSXElement, useContext } from 'solid-js';
import { StateContext } from './state/StateController';
import * as i18n from '@solid-primitives/i18n';
import OptionsWrapper from './components/options/OptionsWrapper';
import RandomColorTarget from './components/RandomColorTarget';

const App = (): JSXElement => {
  const { setState, config, dictionary } = useContext(StateContext);

  const t = i18n.translator(() => dictionary(), i18n.resolveTemplate) as Translator;

  return (
    <>
      <OptionsWrapper/>
      <h1>{t(`helloworld`)}</h1>
      <button onClick={() => setState(`optionsOpen`, true) }>{t(`options.title`)}</button>
      <h1>electron test</h1>
      <button onClick={() => window.electron.pingTest()}>ping</button>
      <button onClick={() => console.debug(config)}>print config to console</button>
      <RandomColorTarget/>
    </>
  );
};

export default App;
