import { JSXElement, useContext } from 'solid-js';
import { StateContext } from '../state/StateController';
import * as i18n from '@solid-primitives/i18n';
import { DropDownCollection } from './common/DropDownCollection';
import DropDownMenu from './common/DropDownMenu';
import MenuButton from './common/MenuButton';
import SubMenu from './common/SubMenu';
import { IconArrowBackUp, IconArrowForwardUp, IconDeviceFloppy, IconExternalLink, IconFilePlus, IconFolderOpen, IconPlaceholder, IconPower, IconSettings } from '@tabler/icons-solidjs';

const MenuBar = (): JSXElement => {
  const { dictionary } = useContext(StateContext);

  const t = i18n.translator(() => dictionary(), i18n.resolveTemplate) as Translator;

  return (
    <DropDownCollection>
      <DropDownMenu label="File">
        <MenuButton 
          label="New..." 
          actionId="file.new"
          icon={IconFilePlus}
        />
        <MenuButton
          label="Open..."
          icon={IconFolderOpen}
        />
        <SubMenu label="Open Recent">
          <MenuButton label="example1.vnct" />
          <MenuButton label="example2.vnct" />
          <MenuButton label="example3.vnct" />
        </SubMenu>
        <SubMenu label="submenu test">
          <MenuButton label="example1.vnct" icon={IconPlaceholder} />
          <MenuButton label="example2.vnct" />
          <MenuButton label="example3.vnct" />
        </SubMenu>
        <SubMenu label="submenu test2">
          <SubMenu label="Open Recent">
            <MenuButton label="example1.vnct" />
            <MenuButton label="example2.vnct" />
            <MenuButton label="example3.vnct" />
          </SubMenu>
          <SubMenu label="submenu test">
            <MenuButton label="example1.vnct" icon={IconPlaceholder} />
            <MenuButton label="example2.vnct" />
            <MenuButton label="example3.vnct" />
          </SubMenu>
        </SubMenu>
        <MenuButton 
          label="Save"
          icon={IconDeviceFloppy}
        />
        <MenuButton label="Save As..." />
        
        <MenuButton
          label="Exit"
          actionId="app.exit"
          icon={IconPower}
        />
      </DropDownMenu>
      <DropDownMenu label="Edit">
        <MenuButton
          label="Undo"
          actionId="history.undo"
          icon={IconArrowBackUp}
        />
        <MenuButton 
          label="Redo"
          actionId="history.redo"
          icon={IconArrowForwardUp}
        />
        <MenuButton 
          label={t(`options.title`)}
          actionId="menu.options.open"
          icon={IconSettings}
        />
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
        <MenuButton 
          label={t(`menubar.help.github`)} 
          actionId="www.github"
          icon={IconExternalLink}
          iconPos="right"
        />
      </DropDownMenu>
    </DropDownCollection>
  );
};

export default MenuBar;
