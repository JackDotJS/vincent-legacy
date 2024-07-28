import { createUniqueId } from "solid-js";

export interface Listener {
  listenerId: string,
  actionId: string,
  target: Element|null,
  callback: (target?: Element) => void
}

const listeners: Listener[] = [];

export const emit = (actionId: string, target?: Element): void => {
  for (const listener of listeners) {
    if (actionId === listener.actionId) {
      if (listener.target != null && target != null) {
        if (listener.target.contains(target)) {
          listener.callback(target);
        }
        continue;
      }
      listener.callback(target);
    }
  }
};

export const subscribeEvent = (actionId: string, target: Element|null, callback: () => void): string => {
  const listenerId = createUniqueId();
  listeners.push({ listenerId, actionId, target, callback });
  console.debug(`event listener registered: `, listenerId, target);
  return listenerId;
};

export const unsubscribeEvent = (listenerId: string): boolean => {
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