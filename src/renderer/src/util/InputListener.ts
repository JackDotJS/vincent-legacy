import { createUniqueId } from "solid-js";
import { state } from "../state/StateController";

interface InputListener {
  listenerId: string,
  callback: (keycombo: string[]) => void
}

const kblayout = await navigator.keyboard.getLayoutMap();

const listeners: InputListener[] = [];

let currentTarget: Element = document.body;
let currentKeyCombo: string[] = [];
let preventAllDefaults: boolean = false;

const emitKeyCombo = (keycombo = currentKeyCombo): void => {
  for (const listener of listeners) {
    listener.callback(keycombo);
  }

  if (!state.optionsOpen) {
    // TODO: go through keymappings list and emit for each match
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
      output = `shift`;
      break;
    case `ControlLeft`:
    case `ControlRight`:
      output = `ctrl`;
      break;
    case `AltLeft`:
    case `AltRight`:
      output = `alt`;
      break;
    case `MetaLeft`:
    case `MetaRight`:
      output = `meta`;
      break;
  }

  return output;
};

const translateMouseButton = (input: number): string => {
  let output = `unknown`;

  switch (input) {
    case 0:
      output = `leftmouse`;
      break;
    case 1:
      output = `middlemouse`;
      break;
    case 2:
      output = `rightmouse`;
      break;
    case 3:
      output = `back`;
      break;
    case 4:
      output = `forward`;
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

  const keycode = kblayout.get(ev.code) ?? ev.code;
  const keycodeTranslated = translateKey(keycode);

  currentKeyCombo.push(keycodeTranslated.toLowerCase());

  if (![`shift`, `ctrl`, `alt`, `meta`].includes(keycodeTranslated)) emitKeyCombo();
});

window.addEventListener(`keyup`, (ev: KeyboardEvent) => {
  if (preventAllDefaults && ev.cancelable && !ev.defaultPrevented) {
    ev.preventDefault();
  }

  const keycode = kblayout.get(ev.code) ?? ev.code;
  const keycodeTranslated = translateKey(keycode);

  removeFromCombo(keycodeTranslated);
});

window.addEventListener(`mousedown`, (ev: MouseEvent) => {
  if (preventAllDefaults && ev.cancelable && !ev.defaultPrevented) {
    ev.preventDefault();
  }

  const translated = translateMouseButton(ev.button);

  currentKeyCombo.push(translated.toLowerCase());

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

  console.debug(ev.deltaX, ev.deltaY, ev.deltaZ);

  let direction = ``;

  if (ev.deltaX > 0) {
    direction = `mwheelright`;
  } else if (ev.deltaX < 0) {
    direction = `mwheelleft`;
  }

  if (ev.deltaY > 0) {
    direction = `mwheeldown`;
  } else if (ev.deltaY < 0) {
    direction = `mwheelup`;
  }

  const modifiedKeyCombo = [...currentKeyCombo, direction];

  emitKeyCombo(modifiedKeyCombo);
});

window.addEventListener(`blur`, () => {
  currentKeyCombo = [];
});

export const onKeyCombo = (callback: () => void): string => {
  const listenerId = createUniqueId();

  listeners.push({
    listenerId,
    callback
  });

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