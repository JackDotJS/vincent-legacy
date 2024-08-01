import { JSXElement, Show, useContext } from 'solid-js';
import { StateContext, StateController } from './state/StateController';
import OptionsWrapper from './ui/options/OptionsWrapper';
import MenuBar from './ui/MenuBar';
import ViewPort from './ui/viewport/ViewPort';
import HistoryDebugger from './ui/debug/HistoryDebugger';
import ModalBase from './ui/modal/ModalBase';
import { Portal } from 'solid-js/web';

const App = (): JSXElement => {
  const { config } = useContext(StateContext);
  
  return (
    <StateController>
      <MenuBar/>
      <ViewPort/>
      <Show when={config.debug.enabled && config.debug.historyVisualizer}>
        <HistoryDebugger/>
      </Show>
      <Portal>
        <OptionsWrapper/>
        <ModalBase/>
      </Portal>
    </StateController>
  );
};

export default App;
