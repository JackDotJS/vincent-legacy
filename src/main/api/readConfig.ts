import { IpcMainInvokeEvent, app } from 'electron';
import { existsSync } from 'fs';
import defaultConfig from '../../common/defaultConfig.json';
import { readFile } from 'fs/promises';

export default async (event: IpcMainInvokeEvent): Promise<typeof defaultConfig> => {
  event; // stfu eslint
  // console.debug(event);

  const cfgFileLoc = `${app.getPath(`userData`)}/config.json`;

  if (!existsSync(cfgFileLoc)) {
    return defaultConfig;
  } else {
    try {
      const configFile = await readFile(cfgFileLoc, { encoding: `utf8` });
      const parsed = JSON.parse(configFile);
      return parsed;
    }
    catch(err) {
      console.error(err);
      return defaultConfig;
    }    
  }
};