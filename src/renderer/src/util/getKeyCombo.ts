import { config } from "../state/StateController";

const kblayout = await navigator.keyboard.getLayoutMap();

const getKeyCombo = (actionId: string): string[] => {
  const allBinds: string[] = [];

  for (const item of config.keymap) {
    if (item.enabled && item.action === actionId) {
      const translated: string[] = [];

      for (const key of item.keyCombo) {
        translated.push(kblayout.get(key) ?? key);
      }

      allBinds.push(translated.join(` + `).toUpperCase());
    }
  }

  return allBinds;
};

export default getKeyCombo;