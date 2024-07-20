import { app, IpcMainInvokeEvent } from 'electron';
import { existsSync, readdirSync } from 'fs';
import path from 'path';

export default async (event: IpcMainInvokeEvent): Promise<string[]> => {
  console.debug(event);

  const result: string[] = [];

  const localeDir = path.join(app.getAppPath(), `resources`, `locale`);

  if (!existsSync(localeDir)) {
    throw new Error(`locale directory missing, this really shouldn't happen!`)
  }

  const locales = readdirSync(localeDir, { withFileTypes: true });

  for (const entry of locales) {
    if (!entry.isFile()) continue;

    result.push(entry.name);
  }

  return result;
};