import defaultConfig from '../defaultConfig.json';
// import { writeFileSync } from 'fs';
import { IpcMainEvent, app } from 'electron';

export default (event: IpcMainEvent, ...args: unknown[]): void => {
  event; // stfu typescript

  const equalTypes = typeof args[0] === typeof defaultConfig;
  
  console.debug(typeof defaultConfig);
  console.debug(typeof args[0]);
  console.debug(equalTypes);
  
  //console.debug(config);
  console.debug(app.getPath(`userData`));
};