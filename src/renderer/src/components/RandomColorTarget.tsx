import { JSXElement, onMount } from "solid-js";
import style from './RandomColorTarget.module.css';
import { subscribeEvent } from "../util/GlobalEventEmitter";


const RandomColorTarget = (): JSXElement => {
  let target!: HTMLDivElement;

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
      [Shift + Ctrl + C] here for a random color
    </div>
  );
};

export default RandomColorTarget;