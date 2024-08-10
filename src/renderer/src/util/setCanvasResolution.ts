import { state } from "@renderer/state/StateController"; 

export const setCanvasResolution = (width: number, height: number): void => {
  state.canvas.main!.width = width;
  state.canvas.main!.height = height;

  state.canvas.committed.width = width;
  state.canvas.committed.height = height;

  state.canvas.selection!.width = width;
  state.canvas.selection!.height = height;
  
  state.canvas.committedSelection.width = width;
  state.canvas.committedSelection.height = height;
};