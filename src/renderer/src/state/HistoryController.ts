import { state } from './StateController';
import { subscribeEvent } from './GlobalEventEmitter';

interface BaseHistoryItem {
  type: `canvas` | `text` | `number` | `select` | `checkbox` | `radio` | `slider`,
}

interface CanvasChange extends BaseHistoryItem {
  type: `canvas`,
  data: {
    before: ImageData,
    after: ImageData
  },
  x: number,
  y: number
}

interface TextChange extends BaseHistoryItem {
  type: `text`
  data: {
    before: string,
    after: string,
  },
  target: HTMLInputElement
}

interface NumberChange extends BaseHistoryItem {
  type: `number`,
  data: {
    before: number,
    after: number
  },
  target: HTMLInputElement
}

interface SelectChange extends BaseHistoryItem {
  type: `select`,
  data: {
    before: string,
    after: string
  },
  target: HTMLSelectElement
}

interface CheckBoxChange extends BaseHistoryItem {
  type: `checkbox`,
  data: {
    before: boolean,
    after: boolean
  },
  target: HTMLInputElement
}

interface RadioChange extends BaseHistoryItem {
  type: `radio`,
  data: {
    before: boolean,
    after: boolean
  },
  target: HTMLInputElement
}

interface SliderChange extends BaseHistoryItem {
  type: `slider`,
  data: {
    before: number,
    after: number
  },
  target: HTMLInputElement
}

export type HistoryItem = 
  CanvasChange 
  | TextChange 
  | NumberChange 
  | SelectChange 
  | CheckBoxChange 
  | RadioChange 
  | SliderChange;

const history: HistoryItem[] = [];
let historyStep: number = -1;
let repeaterMode = `reverse`;

export const addHistoryStep = (data: HistoryItem): void => {
  // FIXME: overwrite logic can get fucked up a bit if 
  // the user has performed a redo beforehand.
  if (
    historyStep > -1 
    && history.length > historyStep 
    && repeaterMode === `reverse`
  ) {
    console.debug(`overwriting history`);
    history.splice(historyStep);
  } else {
    historyStep++;
  }

  repeaterMode = `forward`;
  history.push(data);
};

const updateData = (
  newData: HistoryItem[`data`][`before`] | HistoryItem[`data`][`after`], 
  historyItem: HistoryItem
): void => {
  if (historyItem.type === `canvas`) {
    const ctxMain = state.canvas!.getContext(`2d`);
    const ctxHidden = state.hiddenCanvas!.getContext(`2d`);

    if (ctxMain == null || ctxHidden == null) return;
    ctxMain.putImageData(newData as ImageData, historyItem.x, historyItem.y);
    ctxHidden.putImageData(newData as ImageData, historyItem.x, historyItem.y);
  }
};

subscribeEvent(`generic.undo`, null, () => {
  if ((historyStep - 1) < 0 && repeaterMode === `reverse`) {
    console.debug(`reached end of undo history`);
    return;
  }

  if (repeaterMode === `reverse`) {
    historyStep--;
  } else {
    repeaterMode = `reverse`;
  }

  const historyItem = history[historyStep];
  console.debug(historyStep, historyItem);

  updateData(historyItem.data.before, historyItem);
});

subscribeEvent(`generic.redo`, null, () => {
  if ((historyStep + 1) === history.length && repeaterMode === `forward`) {
    console.debug(`reached end of redo history`);
    return;
  }

  if (repeaterMode === `forward`) {
    historyStep++;
  } else {
    repeaterMode = `forward`;
  }

  const historyItem = history[historyStep];
  console.debug(historyStep, historyItem);

  updateData(historyItem.data.after, historyItem);
});