import { state } from "@renderer/state/StateController";
import getCanvasTransform from "./getCanvasTransform";

const getCursorPositionOnCanvas = (absX: number, absY: number): { x: number, y: number} => {
  // we get the rect of the viewport instead of the
  // canvas or its wrapper since rects include css
  // transforms, which is exactly what we dont want.
  // therefore, the viewport gives us the most
  // consistent reference for canvas position since
  // its pretty damn unlikely that the viewport
  // itself is gonna be spinning around.
  const viewport = state.canvas.wrapper!.parentElement!;
  const viewportRect = viewport.getBoundingClientRect();

  const canvasWidth = state.canvas.main!.offsetWidth;
  const canvasHeight = state.canvas.main!.offsetHeight;

  const scaledOffsetLeft = state.canvas.wrapper!.offsetLeft - ((canvasWidth - state.canvas.main!.offsetWidth) / 2);
  const scaledOffsetTop = state.canvas.wrapper!.offsetTop - ((canvasHeight - state.canvas.main!.offsetHeight) / 2);
  
  const canvasLeft = viewportRect.left + scaledOffsetLeft;
  const canvasTop = viewportRect.top + scaledOffsetTop;
  
  const canvasTransform = getCanvasTransform();
  const rotationRadians = Math.atan2(canvasTransform.b, canvasTransform.a);

  // cursor coords relative to canvas center
  const pointX = (absX + viewport.scrollLeft) - (canvasLeft + (canvasWidth / 2));
  const pointY = (absY + viewport.scrollTop) - (canvasTop + (canvasHeight / 2));
  
  // rotate coords with canvas
  const cos = Math.cos(rotationRadians);
  const sin = Math.sin(rotationRadians);
  let x = (pointX * cos) + (pointY * sin);
  let y = (-pointX * sin) + (pointY * cos);

  // correct position when canvas is zoomed in/out
  x = (x + (canvasWidth / 2)) / state.canvas.scale;
  y = (y + (canvasHeight / 2)) / state.canvas.scale;

  // console.debug(x, y);

  return { x, y };
};

export default getCursorPositionOnCanvas;