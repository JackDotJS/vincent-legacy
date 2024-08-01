import { state } from './StateController';
import { subscribeEvent } from './GlobalEventEmitter';
import { Accessor, createSignal, Setter } from 'solid-js';

type RepeaterMode = `forward`|`reverse`;

class HistoryController {
  step: number = -1;
  repeaterMode: RepeaterMode = `reverse`;
  getHistory: Accessor<HistoryItem[]>;
  setHistory: Setter<HistoryItem[]>;

  constructor() {
    const [ history, setHistory ] = createSignal<HistoryItem[]>([]);
    this.getHistory = history;
    this.setHistory = setHistory;

    // eslint-disable-next-line solid/reactivity 
    subscribeEvent(`generic.undo`, null, () => {
      if ((this.step - 1) < 0 && this.repeaterMode === `reverse`) {
        console.debug(`reached end of undo history`);
        return;
      }
    
      if (this.repeaterMode === `reverse`) {
        this.step--;
      } else {
        this.repeaterMode = `reverse`;
      }
    
      const historyItem = history()[this.step];
      console.debug(this.step, historyItem);
    
      this.updateData(historyItem.data.before, historyItem);
    });
    
    // eslint-disable-next-line solid/reactivity 
    subscribeEvent(`generic.redo`, null, () => {
      if ((this.step + 1) === history().length && this.repeaterMode === `forward`) {
        console.debug(`reached end of redo history`);
        return;
      }
    
      if (this.repeaterMode === `forward`) {
        this.step++;
      } else {
        this.repeaterMode = `forward`;
      }
    
      const historyItem = history()[this.step];
      console.debug(this.step, historyItem);
    
      this.updateData(historyItem.data.after, historyItem);
    });
  }

  addHistoryStep(data: HistoryItem): void {
    // FIXME: overwrite logic can get fucked up a bit if 
    // the user has performed a redo beforehand.
    if (
      this.step > -1 
      && (this.getHistory().length > (this.step + 1) || this.repeaterMode === `reverse`)
    ) {
      console.debug(`overwriting history`);
      this.setHistory((old) => {
        old.splice(this.step);
        return old;
      });
    } else {
      this.step++;
    }
  
    this.repeaterMode = `forward`;
    this.setHistory((old) => [...old, data]);
  }

  updateData(
    newData: HistoryItem[`data`][`before`] | HistoryItem[`data`][`after`], 
    historyItem: HistoryItem
  ): void {
    if (historyItem.type === `canvas`) {
      const ctxMain = state.canvas!.getContext(`2d`);
      const ctxHidden = state.hiddenCanvas!.getContext(`2d`);
  
      if (ctxMain == null || ctxHidden == null) return;
      ctxMain.putImageData(newData as ImageData, historyItem.x, historyItem.y);
      ctxHidden.putImageData(newData as ImageData, historyItem.x, historyItem.y);
    }
  }
}

export default (new HistoryController());