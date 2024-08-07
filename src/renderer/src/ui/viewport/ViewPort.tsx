import { createEffect, createSignal, JSXElement, onMount, useContext } from 'solid-js';
import { StateContext } from '../../state/StateController';
import { subscribeEvent } from '@renderer/state/GlobalEventEmitter';
import getCursorPositionOnCanvas from '@renderer/util/getCursorPositionOnCanvas';

import style from './ViewPort.module.css';

const ViewPort = (): JSXElement => {
  const { state, setState } = useContext(StateContext);

  const [ brushSize, setBrushSize ] = createSignal(10);
  const [ cursorVisible, setCursorVisible ] = createSignal(false);
  const [ drawing, setDrawing ] = createSignal(false);
  const [ brushColor, setBrushColor ] = createSignal(`#000000`);
  const [ eraserMode, setEraserMode ] = createSignal(false);
  const [ rotation, setRotation ] = createSignal<number>(0);

  let lastPosX = 0;
  let lastPosY = 0;
  let lastSize = brushSize();

  const bbox = {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  };

  let canvasElem!: HTMLCanvasElement;
  let hiddenCanvasElem!: HTMLCanvasElement;

  let cursorElem!: HTMLDivElement;
  let canvasWrapperElem!: HTMLDivElement;

  let viewportElem!: HTMLDivElement;

  const updateCursor = (ev: PointerEvent): void => {
    cursorElem.style.top = ev.clientY + `px`;
    cursorElem.style.left = ev.clientX + `px`;
    cursorElem.style.width = (brushSize() * state.canvas.scale) + `px`;
    cursorElem.style.height = (brushSize() * state.canvas.scale) + `px`;

    const curPos = getCursorPositionOnCanvas(ev.pageX,  ev.pageY);
    let curSize = brushSize();

    // console.debug(curPos);

    // ev.pressure is always either 0 or 0.5 for other pointer types
    // so we only use it if an actual pen is being used
    if (ev.pointerType === `pen`) {
      curSize = ev.pressure * brushSize();
    }

    if (drawing()) {
      // update bounding box data
      // FIXME: needs to be corrected with new cursor position logic
      const brushMargin = ((curSize / 2) + 1);
      const maxTop = (curPos.y - brushMargin);
      const maxLeft = (curPos.x - brushMargin);
      const maxRight = (curPos.x + brushMargin);
      const maxBottom = (curPos.y + brushMargin);

      if (maxTop < bbox.top) bbox.top = maxTop;
      if (maxLeft < bbox.left) bbox.left = maxLeft;
      if (maxRight > bbox.right) bbox.right = maxRight;
      if (maxBottom > bbox.bottom) bbox.bottom = maxBottom;

      const ctx = canvasElem.getContext(`2d`);

      if (ctx != null) {
        if (eraserMode()) {
          ctx.globalCompositeOperation = `destination-out`;
        } else {
          ctx.globalCompositeOperation = `source-over`;
        }

        const dx = (lastPosX - curPos.x);
        const dy = (lastPosY - curPos.y);
        const steps = Math.hypot(dx, dy);

        for (let i = 1; i < steps; i++) {
          const stepLengthX = dx * (i / steps);
          const stepLengthY = dy * (i / steps);

          const mx = lastPosX - stepLengthX;
          const my = lastPosY - stepLengthY;
          const ms = ((lastSize) - (curSize)) * (1 - (i / steps)) + (curSize);

          ctx.beginPath();
          ctx.fillStyle = brushColor();
          ctx.arc(mx, my, ms / 2, 0, 2 * Math.PI);
          ctx.fill();
        }
        
        // draw end circle
        ctx.beginPath();
        ctx.fillStyle = brushColor();
        ctx.arc(curPos.x, curPos.y, curSize / 2, 0, 2 * Math.PI);
        ctx.fill();
      }
    }

    lastPosX = curPos.x;
    lastPosY = curPos.y;
    lastSize = curSize;
  };

  const startDrawing = (ev: PointerEvent): void => {
    const curPos = getCursorPositionOnCanvas(ev.pageX,  ev.pageY);
    bbox.top = curPos.y;
    bbox.left = curPos.x;
    bbox.right = curPos.x;
    bbox.bottom = curPos.y;

    lastPosX = curPos.x;
    lastPosY = curPos.y;

    setDrawing(true);
    updateCursor(ev);
  };

  const finishDrawing = (): void => {
    if (!drawing()) return;
    setDrawing(false);

    const ctxMain = canvasElem.getContext(`2d`);
    const ctxHidden = hiddenCanvasElem.getContext(`2d`);

    if (ctxMain == null || ctxHidden == null) return;

    // clamp bounding box to canvas bounds
    bbox.top = Math.min(canvasElem.height, Math.max(bbox.top, 0));
    bbox.left = Math.min(canvasElem.width, Math.max(bbox.left, 0));
    bbox.right = Math.min(canvasElem.width, Math.max(bbox.right, 0));
    bbox.bottom = Math.min(canvasElem.height, Math.max(bbox.bottom, 0));

    const bboxWidth = Math.abs(bbox.right - bbox.left);
    const bboxHeight = Math.abs(bbox.bottom - bbox.top);

    if (bboxWidth !== 0 && bboxHeight !== 0) {
      const beforeData = ctxHidden.getImageData(
        bbox.left, 
        bbox.top, 
        bboxWidth, 
        bboxHeight
      );
  
      ctxHidden.putImageData(
        ctxMain.getImageData(
          bbox.left,
          bbox.top,
          bboxWidth,
          bboxHeight
        ), bbox.left, bbox.top
      );
  
      const afterData = ctxHidden.getImageData(
        bbox.left, 
        bbox.top, 
        bboxWidth, 
        bboxHeight
      );

      state.history.addHistoryStep({
        type: `canvas`,
        data: {
          before: beforeData, 
          after: afterData
        },
        x: bbox.left,
        y: bbox.top
      });
    }
  };

  const forceCentered = (): void => {
    viewportElem.scrollTop = (viewportElem.scrollHeight - viewportElem.offsetHeight) / 2;
    viewportElem.scrollLeft = (viewportElem.scrollWidth - viewportElem.offsetWidth) / 2;
  };

  const updateScale = (newValue: number): void => {
    if (isNaN(newValue)) return;

    const oldWidth = (canvasElem.width * state.canvas.scale) + viewportElem.clientWidth;
    const oldScrollLeft = viewportElem.scrollLeft;
    const oldMaxScrollLeft = oldWidth - viewportElem.clientWidth;

    const oldHeight = (canvasElem.height * state.canvas.scale) + viewportElem.clientHeight;
    const oldScrollTop = viewportElem.scrollTop;
    const oldMaxScrollTop = oldHeight - viewportElem.clientHeight;

    const newWidth = (canvasElem.width * newValue) + viewportElem.clientWidth;
    const newMaxScrollLeft = newWidth - viewportElem.clientWidth;

    const newHeight = (canvasElem.height * newValue) + viewportElem.clientHeight;
    const newMaxScrollTop = newHeight - viewportElem.clientHeight;

    setState(`canvas`, `scale`, newValue);

    viewportElem.scrollTop = newMaxScrollTop * (oldScrollTop / oldMaxScrollTop);
    viewportElem.scrollLeft = newMaxScrollLeft * (oldScrollLeft / oldMaxScrollLeft);
  };

  // const updateRotation = (newValue: number): void => {
    // TODO: this function will be responsible for updating
    // the canvas rotation with special logic to ensure the 
    // pan position is relatively the same.
    //
    // in other words, rotate the canvas around the center 
    // of the viewport instead of the center of the canvas.
  // };

  onMount(() => {
    setState(`canvas`, `main`, canvasElem);
    setState(`canvas`, `hidden`, hiddenCanvasElem);
    setState(`canvas`, `wrapper`, canvasWrapperElem);

    canvasWrapperElem.style.margin = `${viewportElem.offsetHeight / 2}px ${viewportElem.offsetWidth / 2}px`;

    forceCentered();

    window.addEventListener(`pointermove`, updateCursor);

    window.addEventListener(`pointerup`, finishDrawing);

    window.addEventListener(`pointerout`, (ev: PointerEvent) => {
      if (ev.pointerType === `pen`) finishDrawing();
    });

    window.addEventListener(`pointerleave`, (ev: PointerEvent) => {
      if (ev.pointerType === `pen`) finishDrawing();
    });

    window.addEventListener(`pointercancel`, finishDrawing);

    subscribeEvent(`viewport.resetTransform`, null, () => {
      forceCentered();
      setRotation(0);
    });
  });

  createEffect(() => {
    rotation();
    state.canvas.scale;

    const canvasRect = canvasElem.getBoundingClientRect();
    const addedWidth = canvasRect.width - canvasElem.offsetWidth;
    const addedHeight = canvasRect.height - canvasElem.offsetHeight;

    console.debug(addedWidth, addedHeight);

    const hWidth = (viewportElem.offsetWidth + addedWidth) / 2;
    const hHeight = (viewportElem.offsetHeight + addedHeight) / 2;

    canvasWrapperElem.style.margin = `${hHeight}px ${hWidth}px`;
  });

  return (
    <>
      <div class={style.viewport} ref={viewportElem}>
        <div 
          class={style.brushCursor}
          classList={{ [style.cursorVisible]: cursorVisible() }}
          ref={cursorElem}
        />
        <div 
          class={style.canvasWrapper}
          ref={canvasWrapperElem}
          style={{ 
            transform: `rotate(${rotation()}deg)`,
            margin: `${viewportElem.offsetHeight / 2}px ${viewportElem.offsetWidth / 2}px`
          }}
        >
          <canvas
            width={600}
            height={400}
            class={style.canvas}
            style={{ 
              width: `${canvasElem.width * state.canvas.scale}px`,
              height: `${canvasElem.height * state.canvas.scale}px` 
            }}
            onPointerDown={(ev) => startDrawing(ev)}
            onPointerEnter={() => setCursorVisible(true)}
            onPointerLeave={() => setCursorVisible(false)}
            ref={canvasElem}
          />
          <canvas 
            width={600}
            height={400}
            class={style.hiddenCanvas}
            style={{ 
              width: `${canvasElem.width * state.canvas.scale}px`,
              height: `${canvasElem.height * state.canvas.scale}px` 
            }}
            ref={hiddenCanvasElem}
          />
        </div>
      </div>
      <div class={style.tempControls}>
        <label>
          brush size: 
          <input type="number" value={brushSize()} onChange={(ev) => setBrushSize(parseInt(ev.target.value))} />
        </label>
        <label>
          brush color: 
          <input type="color" value={brushColor()} onChange={(ev) => setBrushColor(ev.target.value)} />
        </label>
        <label>
          eraser mode: 
          <input type="checkbox" onChange={(ev) => setEraserMode(ev.target.checked)} />
        </label>
        <label>
          rotate: 
          <input type="number" value={rotation()} onInput={(ev) => !isNaN(ev.target.valueAsNumber) ? setRotation(ev.target.valueAsNumber) : null} />
          <input type="range" min="-180" max="180" value={rotation()} onInput={(ev) => setRotation(ev.target.valueAsNumber)} />
        </label>
        <label>
          scale: 
          <input type="number" value={state.canvas.scale} min="0.25" max="8" onInput={(ev) => updateScale(ev.target.valueAsNumber)} />
          <input type="range" min="0.25" max="32" step="0.25" value={state.canvas.scale} onInput={(ev) => updateScale(ev.target.valueAsNumber)} />
        </label>
      </div>
    </>
  );
};

export default ViewPort;
