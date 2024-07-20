import { app, IpcMainInvokeEvent } from 'electron';
import { existsSync, readFileSync } from 'fs';
import defaultConfig from '../../common/defaultConfig.json';
import { deepmerge } from 'deepmerge-ts';
import path from 'path';

const localeDir = path.join(app.getAppPath(), `resources`, `locale`);

console.debug(localeDir);

if (!existsSync(localeDir)) {
  throw new Error(`locale directory missing, this really shouldn't happen!`)
}

const defaultDictionaryFile = readFileSync(
  `${localeDir}/${defaultConfig.locale}.json`,
  { encoding: `utf-8` }
);

const defaultDictionary = JSON.parse(defaultDictionaryFile);

export default async (event: IpcMainInvokeEvent, langCode: string): Promise<object> => {
  console.debug(event);

  const newDictionaryFile = readFileSync(`${localeDir}/${langCode}.json`, { encoding: `utf-8` });
  const newDictionary = JSON.parse(newDictionaryFile);

  const mergedDicts = deepmerge(defaultDictionary as object, newDictionary as object);

  return mergedDicts;
};