import { createEffect, onMount, useContext } from 'solid-js';
import { StateContext } from './state/StateController';
import * as i18n from '@solid-primitives/i18n';

const App = () => {
  const { state, setState, config, setConfig, dictionary } = useContext(StateContext);

  const t = i18n.translator(() => dictionary(), i18n.resolveTemplate);

  return (
    <>
      <h1>{t(`helloworld`)}</h1>
      <button>(TODO) open settings window</button>
      <button onClick={() => setConfig(`locale`, `en_US`)}>set language en_US</button>
      <button onClick={() => setConfig(`locale`, `en_GB`)}>set language en_GB</button>
    </>
  );
};

export default App;
