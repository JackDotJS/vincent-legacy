import { JSXElement, useContext } from 'solid-js';
import { StateContext } from '../state/StateController';
import * as i18n from '@solid-primitives/i18n';
import { DropDownCollection } from './common/DropDownCollection';
import DropDown from './common/DropDown';

const MenuBar = (): JSXElement => {
  const { setState, dictionary } = useContext(StateContext);

  const t = i18n.translator(() => dictionary(), i18n.resolveTemplate) as Translator;

  return (
    <>
      <DropDownCollection>
        <DropDown label="File">
          <button>New</button>
          <button>Save</button>
          <button>Save As</button>
        </DropDown>
        <DropDown label="Edit">
          <button onClick={() => setState(`optionsOpen`, true) }>{t(`options.title`)}</button>
        </DropDown>
        <DropDown label="View">
          {/** todo */}
        </DropDown>
        <DropDown label="Image">
          {/** todo */}
        </DropDown>
        <DropDown label="Layers">
          {/** todo */}
        </DropDown>
        <DropDown label="Effects">
          {/** todo */}
        </DropDown>
        <DropDown label="Help">
          <button onClick={() => window.location.replace(`https://github.com/JackDotJS/vincent`)} >GitHub</button>
        </DropDown>
      </DropDownCollection>
    </>
  );
};

export default MenuBar;
