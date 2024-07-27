import { JSXElement, useContext } from 'solid-js';
import { StateContext } from './state/StateController';
import * as i18n from '@solid-primitives/i18n';
import OptionsWrapper from './components/options/OptionsWrapper';
import RandomColorTarget from './components/RandomColorTarget';
import MenuBar from './components/MenuBar';
import { DropDownCollection } from './components/common/DropDownCollection';
import DropDown from './components/common/DropDown';

const App = (): JSXElement => {
  const { dictionary } = useContext(StateContext);

  const t = i18n.translator(() => dictionary(), i18n.resolveTemplate) as Translator;

  return (
    <>
      <MenuBar/>
      <h1>{t(`helloworld`)}</h1>
      <RandomColorTarget/>
      <DropDownCollection>
        <DropDown label="Menu1">
          <button>test</button>
        </DropDown>
        <DropDown label="Menu2">
          <button>test2</button>
        </DropDown>
      </DropDownCollection>
      <OptionsWrapper/>
    </>
  );
};

export default App;
