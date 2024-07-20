import { IpcMainInvokeEvent, app } from 'electron';
import { writeQ } from '../writeQueue';

export default (event: IpcMainInvokeEvent, ...args: unknown[]): Promise<undefined|Error> => {
  console.debug(event);

  console.debug(args[0]);

  return writeQ.add(`${app.getPath(`userData`)}/config.json`, JSON.stringify(args[0]));
};