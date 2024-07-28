import { createUniqueId } from "solid-js";
import { config, state } from "../state/StateController";
import { emit } from "../state/GlobalEventEmitter";

interface InputListener {
  listenerId: string,
  callback: (keyCombo: string[]) => void
}

const listeners: InputListener[] = [];

let currentTarget: Element = document.body;
let currentKeyCombo: string[] = [];
let preventAllDefaults: boolean = false;

const emitKeyCombo = (newKeyCombo = currentKeyCombo): void => {
  for (const listener of listeners) {
    listener.callback(newKeyCombo);
  }

  //console.debug(`new keyCombo`, keycombo, listeners);

  console.debug(`options open state: `, state.optionsOpen);

  if (!state.optionsOpen) {
    console.debug(config.keymap, newKeyCombo);
    for (const kmItem of config.keymap) {
      if (!kmItem.enabled) continue;
      // bunch of checks to see if both arrays have the same
      // values, but not necessarily in the same order
      if (kmItem.keyCombo.length !== newKeyCombo.length) continue;
      if (!kmItem.keyCombo.every((key) => newKeyCombo.includes(key))) continue;
      if (!newKeyCombo.every((key) => kmItem.keyCombo.includes(key))) continue;

      emit(kmItem.action, currentTarget);
    }
  }
};

const removeFromCombo = (input: string): void => {
  for (let i = 0; i < currentKeyCombo.length; i++) {
    if (currentKeyCombo[i] === input) {
      currentKeyCombo.splice(i, 1);
      break;
    }
  }
};

const translateKey = (input: string): string => {
  let output = input;

  switch (input) {
    case `ShiftLeft`:
    case `ShiftRight`:
      output = `Shift`;
      break;
    case `ControlLeft`:
    case `ControlRight`:
      output = `Ctrl`;
      break;
    case `AltLeft`:
    case `AltRight`:
      output = `Alt`;
      break;
    case `MetaLeft`:
    case `MetaRight`:
      output = `Meta`;
      break;
  }

  return output;
};

const translateMouseButton = (input: number): string => {
  let output = `Unknown`;

  switch (input) {
    case 0:
      output = `LeftMouse`;
      break;
    case 1:
      output = `MiddleMouse`;
      break;
    case 2:
      output = `RightMouse`;
      break;
    case 3:
      output = `Back`;
      break;
    case 4:
      output = `Forward`;
      break;
  }

  return output;
};

window.addEventListener(`click`, (ev: MouseEvent) => {
  if (ev.target == null) return;
  currentTarget = ev.target as Element;

  console.debug(`new keycombo target:`, currentTarget);
});

window.addEventListener(`contextmenu`, (ev: MouseEvent) => {
  if (preventAllDefaults && ev.cancelable && !ev.defaultPrevented) {
    ev.preventDefault();
  }
});

window.addEventListener(`keydown`, (ev: KeyboardEvent) => {
  if (preventAllDefaults && ev.cancelable && !ev.defaultPrevented) {
    ev.preventDefault();
  }
  
  if (ev.repeat) return;

  const keycode = translateKey(ev.code);

  if (keycode === `Escape` || keycode === `Meta`) return;

  currentKeyCombo.push(keycode);

  if (![`Shift`, `Ctrl`, `Alt`].includes(keycode)) emitKeyCombo();
});

window.addEventListener(`keyup`, (ev: KeyboardEvent) => {
  if (preventAllDefaults && ev.cancelable && !ev.defaultPrevented) {
    ev.preventDefault();
  }

  const keycode = translateKey(ev.code);

  removeFromCombo(keycode);
});

window.addEventListener(`mousedown`, (ev: MouseEvent) => {
  if (preventAllDefaults && ev.cancelable && !ev.defaultPrevented) {
    ev.preventDefault();
  }

  const translated = translateMouseButton(ev.button);

  currentKeyCombo.push(translated);

  emitKeyCombo();
});

window.addEventListener(`mouseup`, (ev: MouseEvent) => {
  if (preventAllDefaults && ev.cancelable && !ev.defaultPrevented) {
    ev.preventDefault();
  }

  const translated = translateMouseButton(ev.button);
  removeFromCombo(translated);
});

window.addEventListener(`wheel`, (ev: WheelEvent) => {
  if (preventAllDefaults && ev.cancelable && !ev.defaultPrevented) {
    ev.preventDefault();
  }

  // console.debug(ev.deltaX, ev.deltaY, ev.deltaZ);

  let direction = ``;

  if (ev.deltaX > 0) {
    direction = `MWheelRight`;
  } else if (ev.deltaX < 0) {
    direction = `MWheelLeft`;
  }

  if (ev.deltaY > 0) {
    direction = `MWheelDown`;
  } else if (ev.deltaY < 0) {
    direction = `MWheelUp`;
  }

  const modifiedKeyCombo = [...currentKeyCombo, direction];

  emitKeyCombo(modifiedKeyCombo);
});

window.addEventListener(`blur`, () => {
  currentKeyCombo = [];
  console.debug(`window lost focus`);
});

window.addEventListener(`focus`, () => {
  currentKeyCombo = [];
  console.debug(`window gained focus`);
});

export const onKeyCombo = (callback: InputListener[`callback`]): string => {
  const listenerId = createUniqueId();

  listeners.push({
    listenerId,
    callback
  });

  console.debug(`keycombo listener registered:`, listenerId);
  return listenerId;
};

export const offKeyCombo = (listenerId: string): boolean => {
  let success = false;

  for (let i = 0; i < listeners.length; i++) {
    if (listeners[i].listenerId === listenerId) {
      listeners.splice(i, 1);
      success = true;
      break;
    }
  }

  return success;
};

export const disableDefaults = (): void => {
  preventAllDefaults = true;
};

export const enableDefaults = (): void => {
  preventAllDefaults = false;
};