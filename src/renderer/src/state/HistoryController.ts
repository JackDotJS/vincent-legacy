import { state } from './StateController';
import { subscribeEvent } from './GlobalEventEmitter';
import { Accessor, createSignal, Setter } from 'solid-js';

type RepeaterMode = `forward`|`reverse`;

class HistoryController {
  getStep: Accessor<number>;
  setStep: Setter<number>;
  getRepeaterMode: Accessor<RepeaterMode>;
  setRepeaterMode: Setter<RepeaterMode>;
  getHistory: Accessor<HistoryItem[]>;
  setHistory: Setter<HistoryItem[]>;

  constructor() {
    const [ history, setHistory ] = createSignal<HistoryItem[]>([]);
    this.getHistory = history;
    this.setHistory = setHistory;

    const [ step, setStep ] = createSignal<number>(-1);
    this.getStep = step;
    this.setStep = setStep;

    const [ repeaterMode, setRepeaterMode ] = createSignal<RepeaterMode>(`forward`);
    this.getRepeaterMode = repeaterMode;
    this.setRepeaterMode = setRepeaterMode;


    // eslint-disable-next-line solid/reactivity 
    subscribeEvent(`generic.undo`, null, () => {
      if ((this.getStep() - 1) < 0 && this.getRepeaterMode() === `reverse`) {
        console.debug(`reached end of undo history`);
        return;
      }
    
      if (this.getRepeaterMode() === `reverse`) {
        this.setStep(old => old - 1);
      } else {
        this.setRepeaterMode(`reverse`);
      }
    
      const historyItem = history()[this.getStep()];
      console.debug(this.getStep(), historyItem);
    
      this.updateData(historyItem.data.before, historyItem);
    });
    
    // eslint-disable-next-line solid/reactivity 
    subscribeEvent(`generic.redo`, null, () => {
      if ((this.getStep() + 1) === history().length && this.getRepeaterMode() === `forward`) {
        console.debug(`reached end of redo history`);
        return;
      }
    
      if (this.getRepeaterMode() === `forward`) {
        this.setStep(old => old + 1);
      } else {
        this.setRepeaterMode(`forward`);
      }
    
      const historyItem = history()[this.getStep()];
      console.debug(this.getStep(), historyItem);
    
      this.updateData(historyItem.data.after, historyItem);
    });
  }

  addHistoryStep(data: HistoryItem): void {
    // FIXME: overwrite logic can get fucked up a bit if 
    // the user has performed a redo beforehand.
    if (
      this.getStep() > -1 
      && (this.getHistory().length > (this.getStep() + 1) || this.getRepeaterMode() === `reverse`)
    ) {
      console.debug(`overwriting history`);
      this.setHistory((old) => {
        old.splice(this.getStep());
        return old;
      });
    } else {
      this.setStep(old => old + 1);
    }
  
    this.setRepeaterMode(`forward`);
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