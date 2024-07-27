import { JSXElement, onMount, useContext } from "solid-js";
import style from './RandomColorTarget.module.css';
import { subscribeEvent } from "../util/GlobalEventEmitter";
import { StateContext } from "@renderer/state/StateController";

const kblayout = await navigator.keyboard.getLayoutMap();

const RandomColorTarget = (): JSXElement => {
  let target!: HTMLDivElement;

  const { config } = useContext(StateContext);

  // TODO: make a util function for this
  const getBindsString = (): string => {
    const binds: string[] = [];

    for (const item of config.keymap) {
      if (item.enabled && item.action === `test.randomColor`) {
        const translated: string[] = [];

        for (const key of item.keyCombo) {
          translated.push(kblayout.get(key) ?? key);
        }

        binds.push(translated.join(` + `).toUpperCase());
      }
    }
    
    if (binds.length === 0) {
      return `<NOT BOUND>`;
    } else {
      return `[${binds.join(`] OR [`)}]`;
    }
  };

  onMount(() => {
    subscribeEvent(`test.randomColor`, target, () => {
      const r = Math.floor(Math.random() * 255);
      const g = Math.floor(Math.random() * 255);
      const b = Math.floor(Math.random() * 255);
      target.style.borderColor = `rgba(${r}, ${g}, ${b})`;
    });
  });

  return (
    <div class={style.randomColorTarget} ref={target}>
      {getBindsString()} here for a random color
    </div>
  );
};

export default RandomColorTarget;