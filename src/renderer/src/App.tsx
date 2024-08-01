import { JSXElement } from 'solid-js';
import { StateController } from './state/StateController';
import './util/keyComboListener';
import OptionsWrapper from './ui/options/OptionsWrapper';
import MenuBar from './ui/MenuBar';
import ViewPort from './ui/viewport/ViewPort';
import HistoryDebugger from './ui/debug/HistoryDebugger';
import ModalBase from './ui/modal/ModalBase';

const App = (): JSXElement => {
  return (
    <StateController>
      <MenuBar/>
      <ViewPort/>
      <HistoryDebugger/>
      <OptionsWrapper/>
      <ModalBase/>
    </StateController>
  );
};

export default App;
