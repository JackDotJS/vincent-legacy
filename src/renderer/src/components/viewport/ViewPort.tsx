import { createSignal, JSXElement, onMount } from 'solid-js';

import style from './ViewPort.module.css';

const ViewPort = (): JSXElement => {
  const [ brushSize, setBrushSize ] = createSignal(10);
  const [ cursorVisible, setCursorVisible ] = createSignal(false);
  const [ drawing, setDrawing ] = createSignal(false);
  const [ brushColor, setBrushColor ] = createSignal(`#000000`);
  const [ eraserMode, setEraserMode ] = createSignal(false);

  let lastPosX = 0;
  let lastPosY = 0;
  let lastSize = brushSize();

  let cursorElem!: HTMLDivElement;
  let canvasElem!: HTMLCanvasElement;
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
  };

  const setHeight = (value: string): void => {
    const valAsNumber = validateNumber(value);
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
      const ctx = canvasElem.getContext(`2d`);

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

  onMount(() => {
    widthElem.value = canvasElem.width.toString();
    heightElem.value = canvasElem.height.toString();

    canvasElem.addEventListener(`pointerdown`, (ev) => {
      setDrawing(true);
      updateCursor(ev);
    });

    window.addEventListener(`pointermove`, (ev) => {
      updateCursor(ev);
    });

    window.addEventListener(`pointerup`, () => {
      setDrawing(false);
    });

    window.addEventListener(`pointerout`, (ev: PointerEvent) => {
      if (ev.pointerType === `pen`) setDrawing(false);
    });

    window.addEventListener(`pointerleave`, (ev: PointerEvent) => {
      if (ev.pointerType === `pen`) setDrawing(false);
    });

    window.addEventListener(`pointercancel`, () => {
      setDrawing(false);
    });
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
        onPointerEnter={() => setCursorVisible(true)}
        onPointerLeave={() => setCursorVisible(false)}
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
          class={style.canvas}
          ref={canvasElem}
        />
      </div>
    </div>
  );
};

export default ViewPort;
