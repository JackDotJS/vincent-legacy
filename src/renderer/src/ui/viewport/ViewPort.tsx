import { createSignal, JSXElement, onMount, useContext } from 'solid-js';
import { StateContext } from '../../state/StateController';

import style from './ViewPort.module.css';

const ViewPort = (): JSXElement => {
  const { state, setState } = useContext(StateContext);

  const [ brushSize, setBrushSize ] = createSignal(10);
  const [ cursorVisible, setCursorVisible ] = createSignal(false);
  const [ drawing, setDrawing ] = createSignal(false);
  const [ brushColor, setBrushColor ] = createSignal(`#000000`);
  const [ eraserMode, setEraserMode ] = createSignal(false);
  const [ rotation, setRotation ] = createSignal<number>(0);
  const [ scale, setScale ] = createSignal<number>(1);

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

  const translatePoint = (
    absPointX: number, 
    absPointY: number, 
    centerX: number, 
    centerY: number, 
    rotationDegrees: number
  ): { x: number, y: number} => {
    // Get coordinates relative to center point
    absPointX -= centerX;
    absPointY -= centerY;
    
    // Convert degrees to radians
    const radians = rotationDegrees * (Math.PI / 180);
    
    // Translate rotation
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    let x = (absPointX * cos) + (absPointY * sin);
    let y = (-absPointX * sin) + (absPointY * cos);
    
    // Round to nearest hundredths place
    x = Math.floor(x * 100) / 100;
    y = Math.floor(y * 100) / 100;
    
    return {x, y};
  };

  const getTransform = (matrix: string): { scale: number, angle: number } => {
    const values = matrix
      .split(`(`)[1]
      .split(`)`)[0]
      .split(`,`);

    const a = parseFloat(values[0]);
    const b = parseFloat(values[1]);
    // const c = parseFloat(values[2]);
    // const d = parseFloat(values[3]);

    const scale = Math.sqrt(a*a + b*b);

    const angle = Math.atan2(b, a) * (180 / Math.PI);

    return { scale, angle };
  };

  const getCursorPositionOnCanvas = (absX: number, absY: number): { x: number, y: number} => {
    // we get the rect of the parent container instead
    // of the canvas element since rects include css
    // transforms, which is exaclty what we dont want
    // in this particular case. i think it's pretty
    // safe to assume the viewport itself won't be
    // getting any fancy transformations in the near
    // future
    const parentRect = canvasWrapperElem.offsetParent!.getBoundingClientRect();

    const canvasWidth = canvasElem.offsetWidth * scale();
    const canvasHeight = canvasElem.offsetHeight * scale();

    const scaledOffsetLeft = canvasWrapperElem.offsetLeft - ((canvasWidth - canvasElem.offsetWidth) / 2);
    const scaledOffsetTop = canvasWrapperElem.offsetTop - ((canvasHeight - canvasElem.offsetHeight) / 2);
    
    const canvasLeft = parentRect.left + scaledOffsetLeft;
    const canvasTop = parentRect.top + scaledOffsetTop;

    // console.debug(canvasElem.offsetHeight, canvasHeight, canvasWrapperElem.offsetTop, scaledOffsetTop);

    const cstyle = window.getComputedStyle(canvasWrapperElem);
    const transform = getTransform(cstyle.getPropertyValue(`transform`));

    const convertedRot = translatePoint(
      absX, 
      absY, 
      canvasLeft + (canvasWidth / 2),
      canvasTop + (canvasHeight / 2),
      transform.angle
    );

    // console.debug(`translatePoint:`, convertedRot);

    return {
      x: (convertedRot.x + (canvasWidth / 2)) / scale(),
      y: (convertedRot.y + (canvasHeight / 2)) / scale()
    };
  };

  const updateCursor = (ev: PointerEvent): void => {
    cursorElem.style.top = ev.pageY + `px`;
    cursorElem.style.left = ev.pageX + `px`;
    cursorElem.style.width = (brushSize() * scale()) + `px`;
    cursorElem.style.height = (brushSize() * scale()) + `px`;

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

  onMount(() => {
    setState(`canvas`, canvasElem);
    setState(`hiddenCanvas`, hiddenCanvasElem);

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
      <div 
        class={style.brushCursor}
        classList={{ [style.cursorVisible]: cursorVisible() }}
        ref={cursorElem}
      />
      <div 
        class={style.canvasWrapper}
        ref={canvasWrapperElem}
        style={{ transform: `scale(${scale()}) rotate(${rotation()}deg)` }}
      >
        <canvas
          width={600}
          height={400}
          class={style.canvas}
          onPointerDown={(ev) => startDrawing(ev)}
          onPointerEnter={() => setCursorVisible(true)}
          onPointerLeave={() => setCursorVisible(false)}
          ref={canvasElem}
        />
        <canvas 
          width={600}
          height={400}
          class={style.hiddenCanvas}
          ref={hiddenCanvasElem}
        />
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
          <input type="number" value={scale()} min="0.25" max="8" onInput={(ev) => !isNaN(ev.target.valueAsNumber) ? setScale(ev.target.valueAsNumber) : null} />
          <input type="range" min="0.25" max="32" step="0.25" value={scale()} onInput={(ev) => setScale(ev.target.valueAsNumber)} />
        </label>
      </div>
    </div>
  );
};

export default ViewPort;
