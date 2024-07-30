import { createSignal, JSXElement, onMount } from 'solid-js';

import style from './ViewPort.module.css';
import { subscribeEvent } from '@renderer/state/GlobalEventEmitter';

interface HistoryItem {
  data: ImageData,
  x: number,
  y: number
}

const ViewPort = (): JSXElement => {
  const [ brushSize, setBrushSize ] = createSignal(10);
  const [ cursorVisible, setCursorVisible ] = createSignal(false);
  const [ drawing, setDrawing ] = createSignal(false);
  const [ brushColor, setBrushColor ] = createSignal(`#000000`);
  const [ eraserMode, setEraserMode ] = createSignal(false);
  const [ historyStep, setHistoryStep ] = createSignal(0);

  let lastPosX = 0;
  let lastPosY = 0;
  let lastSize = brushSize();

  const bbox = {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  };

  const history: HistoryItem[] = [];

  let canvasElem!: HTMLCanvasElement;
  let preCanvasElem!: HTMLCanvasElement;
  let debugCanvasElem!: HTMLCanvasElement;

  let cursorElem!: HTMLDivElement;
  let canvasWrapperElem!: HTMLDivElement;
  let widthElem!: HTMLInputElement;
  let heightElem!: HTMLInputElement;

  const validateNumber = (value: string): number => {
    const parsed = parseInt(value);
    if (isNaN(parsed)) return 0;
    return parsed;
  };

  const setWidth = (value: string): void => {
    const valAsNumber = validateNumber(value);
    canvasElem.width = valAsNumber;
    canvasElem.style.width = valAsNumber + `px`;
    preCanvasElem.width = valAsNumber;
    preCanvasElem.style.width = valAsNumber + `px`;
    canvasElem.width = valAsNumber;
    canvasElem.style.width = valAsNumber + `px`;
  };

  const setHeight = (value: string): void => {
    const valAsNumber = validateNumber(value);
    canvasElem.height = valAsNumber;
    canvasElem.style.height = valAsNumber + `px`;
    preCanvasElem.height = valAsNumber;
    preCanvasElem.style.height = valAsNumber + `px`;
    canvasElem.height = valAsNumber;
    canvasElem.style.height = valAsNumber + `px`;
  };

  const updateCursor = (ev: PointerEvent): void => {
    cursorElem.style.top = ev.pageY + `px`;
    cursorElem.style.left = ev.pageX + `px`;
    cursorElem.style.width = brushSize() + `px`;
    cursorElem.style.height = brushSize() + `px`;

    // console.debug(ev.pageX, ev.pageY);
    const canvasBox = canvasElem.getBoundingClientRect();

    const curPosX = ev.pageX - canvasBox.left;
    const curPosY = ev.pageY - canvasBox.top;
    let curSize = brushSize();

    // ev.pressure is always either 0 or 0.5 for other pointer types
    // so we only use it if an actual pen is being used
    if (ev.pointerType === `pen`) {
      curSize = ev.pressure * brushSize();
    }

    if (drawing()) {
      // update bounding box data

      const brushMargin = ((curSize / 2) + 1);
      const maxTop = (curPosY - brushMargin);
      const maxLeft = (curPosX - brushMargin);
      const maxRight = (curPosX + brushMargin);
      const maxBottom = (curPosY + brushMargin);

      if (maxTop < bbox.top) bbox.top = maxTop;
      if (maxLeft < bbox.left) bbox.left = maxLeft;
      if (maxRight > bbox.right) bbox.right = maxRight;
      if (maxBottom > bbox.bottom) bbox.bottom = maxBottom;

      const ctx = preCanvasElem.getContext(`2d`);

      if (ctx != null) {
        if (eraserMode()) {
          ctx.globalCompositeOperation = `destination-out`;
        } else {
          ctx.globalCompositeOperation = `source-over`;
        }

        const dx = (lastPosX - curPosX);
        const dy = (lastPosY - curPosY);
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
        ctx.arc(curPosX, curPosY, curSize / 2, 0, 2 * Math.PI);
        ctx.fill();
      }
    }

    lastPosX = curPosX;
    lastPosY = curPosY;
    lastSize = curSize;
  };

  const startDrawing = (ev: PointerEvent): void => {
    const canvasBox = canvasElem.getBoundingClientRect();
    bbox.top = ev.pageY - canvasBox.top;
    bbox.left = ev.pageX - canvasBox.left;
    bbox.right = ev.pageX - canvasBox.left;
    bbox.bottom = ev.pageY - canvasBox.top;

    setDrawing(true);
    updateCursor(ev);
  };

  const finishDrawing = (): void => {
    if (!drawing()) return;
    setDrawing(false);

    const ctxMain = canvasElem.getContext(`2d`);
    const ctxPre = preCanvasElem.getContext(`2d`);
    const ctxDebug = debugCanvasElem.getContext(`2d`);

    if (ctxMain == null || ctxPre == null || ctxDebug == null) return;

    // clamp bounding box to canvas bounds
    bbox.top = Math.min(canvasElem.height, Math.max(bbox.top, 0));
    bbox.left = Math.min(canvasElem.width, Math.max(bbox.left, 0));
    bbox.right = Math.min(canvasElem.width, Math.max(bbox.right, 0));
    bbox.bottom = Math.min(canvasElem.height, Math.max(bbox.bottom, 0));

    const bboxWidth = Math.abs(bbox.right - bbox.left);
    const bboxHeight = Math.abs(bbox.bottom - bbox.top);

    const beforeData = ctxMain.getImageData(
      bbox.left, 
      bbox.top, 
      bboxWidth, 
      bboxHeight
    );

    ctxMain.drawImage(preCanvasElem, 0, 0);

    // const afterData = ctxMain.getImageData(
    //   bbox.left, 
    //   bbox.top, 
    //   bboxWidth, 
    //   bboxHeight
    // );

    if (bboxWidth !== 0 && bboxHeight !== 0) {
      ctxDebug.clearRect(0, 0, debugCanvasElem.width, debugCanvasElem.height);

      addHistoryStep(beforeData, bbox.left, bbox.top);
      // history.push({
      //   data: afterData,
      //   x: bbox.left, 
      //   y: bbox.top
      // });

      ctxDebug.putImageData(beforeData, 0, 0);

      ctxDebug.beginPath();
      ctxDebug.lineWidth = 1;
      ctxDebug.strokeStyle = `#FF0000`;
      ctxDebug.rect(
        0, 
        0, 
        bboxWidth,
        bboxHeight
      );
      ctxDebug.stroke();
    }

    ctxPre.clearRect(0, 0, preCanvasElem.width, preCanvasElem.height);
  };

  const addHistoryStep = (data: ImageData, x: number, y: number): void => {
    if (history.length > (historyStep() + 1)) {
      console.debug(`overwriting history`);
      history.splice(historyStep() + 1);
    }

    setHistoryStep((old) => old + 1);

    history.push({ data, x, y });
  };

  onMount(() => {
    widthElem.value = canvasElem.width.toString();
    heightElem.value = canvasElem.height.toString();

    subscribeEvent(`generic.undo`, null, () => {
      // if ((historyStep() - 1) < 0) return;
  
      setHistoryStep((old) => old - 1);
  
      const newData = history[historyStep()];

      const ctx = canvasElem.getContext(`2d`);

      if (ctx != null) {
        ctx.putImageData(newData.data, newData.x, newData.y);
      }
    });
  
    subscribeEvent(`generic.redo`, null, () => {
      // if ((historyStep() + 1) === history.length) return;
  
      setHistoryStep((old) => old + 1);
  
      const newData = history[historyStep()];

      const ctx = canvasElem.getContext(`2d`);

      if (ctx != null) {
        ctx.putImageData(newData.data, newData.x, newData.y);
      }
    });

    canvasElem.addEventListener(`pointerdown`, startDrawing);

    window.addEventListener(`pointermove`, (ev) => {
      updateCursor(ev);
    });

    window.addEventListener(`pointerup`, finishDrawing);

    window.addEventListener(`pointerout`, (ev: PointerEvent) => {
      if (ev.pointerType === `pen`) finishDrawing();
    });

    window.addEventListener(`pointerleave`, (ev: PointerEvent) => {
      if (ev.pointerType === `pen`) finishDrawing();
    });

    window.addEventListener(`pointercancel`, finishDrawing);
  });

  return (
    <div class={style.viewport}>
      <div class={style.tempControls}>
        <h4>WARNING: CHANGING CANVAS SIZE WILL RESET CANVAS DATA</h4>
        <label>
          width:
          <input type="number" onChange={(ev) => setWidth(ev.target.value)} ref={widthElem} />
        </label>
        <label>
          height: 
          <input type="number" onChange={(ev) => setHeight(ev.target.value)} ref={heightElem} />
        </label>
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
      </div>
      <div 
        class={style.canvasWrapper}
        ref={canvasWrapperElem}
      >
        <div 
          class={style.brushCursor}
          classList={{ [style.cursorVisible]: cursorVisible() }}
          ref={cursorElem}
        />
        <canvas 
          width={600} 
          height={400} 
          class={style.preCanvas}
          ref={preCanvasElem}
        />
        <canvas 
          width={600} 
          height={400} 
          class={style.canvas}
          onPointerEnter={() => setCursorVisible(true)}
          onPointerLeave={() => setCursorVisible(false)}
          ref={canvasElem}
        />
        <canvas 
          width={600} 
          height={400} 
          class={style.debugCanvas}
          ref={debugCanvasElem}
        />
      </div>
    </div>
  );
};

export default ViewPort;
