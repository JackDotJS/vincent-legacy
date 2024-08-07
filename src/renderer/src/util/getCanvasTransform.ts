import { state } from "@renderer/state/StateController";

const getCanvasTransform = (): { a: number, b: number, c: number, d: number } => {
  const canvasStyle = window.getComputedStyle(state.canvas.wrapper!);
  const matrix = canvasStyle.getPropertyValue(`transform`);

  const values = matrix
    .split(`(`)[1]
    .split(`)`)[0]
    .split(`,`);

  const a = parseFloat(values[0]);
  const b = parseFloat(values[1]);
  const c = parseFloat(values[2]);
  const d = parseFloat(values[3]);

  return { a, b, c, d };
};

export default getCanvasTransform;