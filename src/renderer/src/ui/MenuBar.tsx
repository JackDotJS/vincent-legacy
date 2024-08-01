import { JSXElement, useContext } from 'solid-js';
import { StateContext } from '../state/StateController';
import * as i18n from '@solid-primitives/i18n';
import { DropDownCollection } from './common/DropDownCollection';
import DropDownMenu from './common/DropDownMenu';
import MenuButton from './common/MenuButton';
import SubMenu from './common/SubMenu';

const MenuBar = (): JSXElement => {
  const { dictionary } = useContext(StateContext);

  const t = i18n.translator(() => dictionary(), i18n.resolveTemplate) as Translator;

  return (
    <DropDownCollection>
      <DropDownMenu label="File">
        <MenuButton label="New..." actionId="file.new" />
        <MenuButton label="Open..." />
        <SubMenu label="Open Recent">
          <MenuButton label="example1.vnct" />
          <MenuButton label="example2.vnct" />
          <MenuButton label="example3.vnct" />
          <SubMenu label="submenu test">
            <MenuButton label="test1" />
            <MenuButton label="test2" />
            <MenuButton label="test3" />
          </SubMenu>
          <SubMenu label="submenu test2">
            <MenuButton label="test1" />
            <MenuButton label="test2" />
            <MenuButton label="test3" />
          </SubMenu>
        </SubMenu>
        <MenuButton label="Save" />
        <MenuButton label="Save As..." />
        
        <MenuButton label="Exit" actionId="app.exit"/>
      </DropDownMenu>
      <DropDownMenu label="Edit">
        <MenuButton label="Undo" actionId="history.undo" />
        <MenuButton label="Redo" actionId="history.redo" />
        <MenuButton label={t(`options.title`)} actionId="menu.options.open"/>
      </DropDownMenu>
      <DropDownMenu label="View">
        {/** todo */}
      </DropDownMenu>
      <DropDownMenu label="Image">
        {/** todo */}
      </DropDownMenu>
      <DropDownMenu label="Layers">
        {/** todo */}
      </DropDownMenu>
      <DropDownMenu label="Effects">
        {/** todo */}
      </DropDownMenu>
      <DropDownMenu label="Help">
        <MenuButton label={t(`menubar.help.github`)} actionId="www.github"/>
      </DropDownMenu>
    </DropDownCollection>
  );
};

export default MenuBar;
