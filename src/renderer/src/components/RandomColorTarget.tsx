import { JSXElement, onMount } from "solid-js";
import style from './RandomColorTarget.module.css';
import { subscribeEvent } from "../state/GlobalEventEmitter";
import getKeyCombo from "@renderer/util/getKeyCombo";

const RandomColorTarget = (): JSXElement => {
  let target!: HTMLDivElement;

  // TODO: make a util function for this
  const getBindsString = (): string => {
    const binds: string[] = getKeyCombo(`test.randomColor`);
    
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