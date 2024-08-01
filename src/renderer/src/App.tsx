import { JSXElement } from 'solid-js';
import { StateController } from './state/StateController';
import './util/keyComboListener';
import OptionsWrapper from './components/options/OptionsWrapper';
import MenuBar from './components/MenuBar';
import ViewPort from './components/viewport/ViewPort';
import HistoryDebugger from './components/debug/HistoryDebugger';

const App = (): JSXElement => {
  return (
    <StateController>
      <MenuBar/>
      <ViewPort />
      <HistoryDebugger />
      <OptionsWrapper/>
    </StateController>
  );
};

export default App;
