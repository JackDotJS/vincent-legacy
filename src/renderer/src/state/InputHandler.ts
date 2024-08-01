import { Accessor, createSignal, createUniqueId, Setter } from "solid-js";
import { config, state } from "../state/StateController";
import { emit } from "../state/GlobalEventEmitter";

export interface InputListener {
  listenerId: string,
  callback: (keyCombo: string[]) => void
}

class InputHandler {
  getListeners: Accessor<InputListener[]>;
  setListeners: Setter<InputListener[]>;

  getCurrentTarget: Accessor<Element>;
  setCurrentTarget: Setter<Element>;

  getActiveInputs: Accessor<string[]>;
  setActiveInputs: Setter<string[]>;

  getDefaultsPrevented: Accessor<boolean>;
  setDefaultsPrevented: Setter<boolean>;

  constructor() {
    const [ getListeners, setListeners ] = createSignal<InputListener[]>([]);
    const [ getCurrentTarget, setCurrentTarget ] = createSignal<Element>(document.body);
    const [ getActiveInputs, setActiveInputs ] = createSignal<string[]>([]);
    const [ getDefaultsPrevented, setDefaultsPrevented ] = createSignal<boolean>(false);

    this.getListeners = getListeners;
    this.setListeners = setListeners;
    this.getCurrentTarget = getCurrentTarget;
    this.setCurrentTarget = setCurrentTarget;
    this.getActiveInputs = getActiveInputs;
    this.setActiveInputs = setActiveInputs;
    this.getDefaultsPrevented = getDefaultsPrevented;
    this.setDefaultsPrevented = setDefaultsPrevented;

    window.addEventListener(`click`, (ev: MouseEvent) => {
      if (ev.target == null) return;
      setCurrentTarget(ev.target as Element);
    });
    
    window.addEventListener(`contextmenu`, (ev: MouseEvent) => {
      if (getDefaultsPrevented() && ev.cancelable && !ev.defaultPrevented) {
        ev.preventDefault();
      }
    });
    
    window.addEventListener(`keydown`, (ev: KeyboardEvent) => {
      if (getDefaultsPrevented() && ev.cancelable && !ev.defaultPrevented) {
        ev.preventDefault();
      }
      
      if (ev.repeat) return;
    
      const keycode = this.translateKey(ev.code);
    
      if (keycode === `Escape` || keycode === `Meta`) return;
   
      this.addInput(keycode);
    
      if (![`Shift`, `Ctrl`, `Alt`].includes(keycode)) this.emitInputChange();
    });
    
    window.addEventListener(`keyup`, (ev: KeyboardEvent) => {
      if (getDefaultsPrevented() && ev.cancelable && !ev.defaultPrevented) {
        ev.preventDefault();
      }
    
      const keycode = this.translateKey(ev.code);
    
      this.removeInput(keycode);
    });
    
    window.addEventListener(`mousedown`, (ev: MouseEvent) => {
      if (getDefaultsPrevented() && ev.cancelable && !ev.defaultPrevented) {
        ev.preventDefault();
      }
    
      const translated = this.translateMouseButton(ev.button);
    
      this.addInput(translated);
    
      this.emitInputChange();
    });
    
    window.addEventListener(`mouseup`, (ev: MouseEvent) => {
      if (getDefaultsPrevented() && ev.cancelable && !ev.defaultPrevented) {
        ev.preventDefault();
      }
    
      const translated = this.translateMouseButton(ev.button);
      this.removeInput(translated);
    });
    
    window.addEventListener(`wheel`, (ev: WheelEvent) => {
      if (getDefaultsPrevented() && ev.cancelable && !ev.defaultPrevented) {
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
    
      const modifiedKeyCombo = [...getActiveInputs(), direction];
    
      this.emitInputChange(modifiedKeyCombo);
    });
    
    window.addEventListener(`blur`, () => {
      this.setActiveInputs([]);
      console.debug(`window lost focus`);
    });
    
    window.addEventListener(`focus`, () => {
      this.setActiveInputs([]);
      console.debug(`window gained focus`);
    });
  }

  emitInputChange(newKeyCombo = this.getActiveInputs()): void {
    for (const listener of this.getListeners()) {
      listener.callback(newKeyCombo);
    }
  
    if (!state.optionsOpen) {
      // console.debug(config.keymap, newKeyCombo);
      for (const kmItem of config.keymap) {
        if (!kmItem.enabled) continue;
        // bunch of checks to see if both arrays have the same
        // values, but not necessarily in the same order
        if (kmItem.keyCombo.length !== newKeyCombo.length) continue;
        if (!kmItem.keyCombo.every((key) => newKeyCombo.includes(key))) continue;
        if (!newKeyCombo.every((key) => kmItem.keyCombo.includes(key))) continue;
  
        emit(kmItem.action, this.getCurrentTarget());
      }
    }
  }

  translateKey(input: string): string {
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
  }

  translateMouseButton(input: number): string {
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
  }

  addInput(input: string): void {
    this.setActiveInputs(old => [...old, input]);
  }

  removeInput(input: string): void {
    for (let i = 0; i < this.getActiveInputs().length; i++) {
      if (this.getActiveInputs()[i] === input) {
        this.setActiveInputs(old => {
          old.splice(i, 1);
          return old;
        });
        
        break;
      }
    }
  }

  onInputChange = (callback: InputListener[`callback`]): string => {
    const listenerId = createUniqueId();

    this.setListeners(old => [...old, {
      listenerId,
      callback
    }]);
  
    console.debug(`keycombo listener registered:`, listenerId);
    return listenerId;
  };

  offInputChange = (listenerId: string): boolean => {
    let success = false;
  
    for (let i = 0; i < this.getListeners().length; i++) {
      if (this.getListeners()[i].listenerId === listenerId) {
        this.setListeners(old => {
          old.splice(i, 1);
          return old;
        });
        
        success = true;
        break;
      }
    }
  
    return success;
  };
}

export default new InputHandler();