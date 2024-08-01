import { For, JSXElement, useContext } from 'solid-js';
import { StateContext } from '../../state/StateController';
import style from './HistoryDebugger.module.css';

const HistoryDebugger = (): JSXElement => {
  const { state } = useContext(StateContext);

  return (
    <div class={style.debugWrapper}>
      <div class={style.debugInfo}>
        <span>history length: {state.history.getHistory().length}</span>
        <span>current step index: {state.history.getStep()}</span>
        <span>repeater mode: {state.history.getRepeaterMode()}</span>
      </div>
      <div class={style.historyItemList}>
        <For each={state.history.getHistory()}>
          {(item: HistoryItem, index) => {
            const isCurrentStep = (): boolean => index() === state.history.getStep();

            if (item.type === `canvas`) {
              const newCanvasElem1 = document.createElement(`canvas`);
              const newCanvasElem2 = document.createElement(`canvas`);

              newCanvasElem1.classList.add(`before`);
              newCanvasElem2.classList.add(`after`);

              newCanvasElem1.width = item.data.before.width;
              newCanvasElem1.height = item.data.before.height;

              newCanvasElem2.width = item.data.after.width;
              newCanvasElem2.height = item.data.after.height;

              const ctx1 = newCanvasElem1.getContext(`2d`);
              const ctx2 = newCanvasElem2.getContext(`2d`);
              if (ctx1 != null) {
                ctx1.putImageData(item.data.before, 0, 0);
              }

              if (ctx2 != null) {
                ctx2.putImageData(item.data.after, 0, 0);
              }

              return (
                <div 
                  class={style.historyItem} 
                  classList={{ [style.currentStep]: isCurrentStep() }}
                >
                  <div class={style.before}>{newCanvasElem1}</div>
                  <div class={style.after}>{newCanvasElem2}</div>
                </div>
              );
            }

            return (
              <div 
                class={style.historyItem} 
                classList={{ [style.currentStep]: isCurrentStep() }}
              >
                <span class={style.unknown}>
                  no visualizer for HistoryItem type: {item.type}
                </span>
              </div>
            );
          }}
        </For>
      </div>
      
    </div>
  );
};

export default HistoryDebugger;
