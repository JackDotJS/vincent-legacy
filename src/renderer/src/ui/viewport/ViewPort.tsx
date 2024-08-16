import { createEffect, createSignal, For, JSXElement, onMount, useContext } from 'solid-js';
import { StateContext } from '../../state/StateController';
import { subscribeEvent } from '@renderer/state/GlobalEventEmitter';

import style from './ViewPort.module.css';
import { VincentBaseTool } from '@renderer/api/VincentBaseTool';

const ViewPort = (): JSXElement => {
  const { state, setState } = useContext(StateContext);

  const [ rotation, setRotation ] = createSignal<number>(0);
  const [ toolWidgets, setToolWidgets ] = createSignal<JSXElement>(``);
  const [ tempOptions, setTempOptions ] = createSignal<JSXElement>(``);

  let canvasElem!: HTMLCanvasElement;
  let selectionCanvasElem!: HTMLCanvasElement;
  let canvasWrapperElem!: HTMLDivElement;
  let viewportElem!: HTMLDivElement;

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

  onMount(async () => {
    setState(`canvas`, `main`, canvasElem);
    setState(`canvas`, `selection`, selectionCanvasElem);
    setState(`canvas`, `wrapper`, canvasWrapperElem);

    canvasWrapperElem.style.margin = `${viewportElem.offsetHeight / 2}px ${viewportElem.offsetWidth / 2}px`;

    forceCentered();

    viewportElem.addEventListener(`pointerenter`, (ev: PointerEvent) => {
      state.tools.list[state.tools.selected].pointerEnter(ev);
    });

    viewportElem.addEventListener(`pointerdown`, (ev: PointerEvent) => {
      state.tools.list[state.tools.selected].pointerDown(ev);
    });

    window.addEventListener(`pointermove`, (ev) => {
      state.tools.list[state.tools.selected].pointerMove(ev);
    });

    window.addEventListener(`pointerrawupdate`, (ev) => {
      state.tools.list[state.tools.selected].pointerChange(ev as PointerEvent);
    });

    window.addEventListener(`pointerup`, (ev) => {
      state.tools.list[state.tools.selected].pointerUp(ev);
    });

    window.addEventListener(`pointerout`, (ev: PointerEvent) => {
      state.tools.list[state.tools.selected].pointerOut(ev);
    });

    window.addEventListener(`pointerleave`, (ev: PointerEvent) => {
      state.tools.list[state.tools.selected].pointerLeave(ev);
    });

    window.addEventListener(`pointercancel`, (ev) => {
      state.tools.list[state.tools.selected].pointerCancel(ev);
    });

    subscribeEvent(`viewport.resetTransform`, null, () => {
      forceCentered();
      setRotation(0);
    });

    // red triangle test (context2d)

    // const ctx = canvasElem.getContext(`2d`);
    // if (ctx == null) {
    //   throw new Error(`could not get context 2d`);
    // }

    // ctx.beginPath();
    // ctx.fillStyle = `#FF0000`;
    // ctx.moveTo(canvasElem.width * 0.5, canvasElem.height * 0.25);
    // ctx.lineTo(canvasElem.width * 0.75, canvasElem.height * 0.75);
    // ctx.lineTo(canvasElem.width * 0.25, canvasElem.height * 0.75);
    // ctx.closePath();
    // ctx.fill();


    // webgpu test
    const adapter = state.gpu.adapter as GPUAdapter;
    const device = state.gpu.device as GPUDevice;

    console.debug(adapter, device, await adapter.requestAdapterInfo());

    const ctx = canvasElem.getContext(`webgpu`);
    if (ctx == null) {
      throw new Error(`could not get context webgpu`);
    }
    
    ctx.configure({
      device,
      format: state.gpu.canvasFormat!,
      alphaMode: `premultiplied`,
      usage: 
        GPUTextureUsage.TEXTURE_BINDING | 
        GPUTextureUsage.STORAGE_BINDING |
        GPUTextureUsage.RENDER_ATTACHMENT
    });

    // initalize canvases with webgl
    // const ctx = canvasElem.getContext(`webgl2`);
    // const ctx2 = selectionCanvasElem.getContext(`webgl2`);
    // if (ctx == null || ctx2 == null) {
    //   throw new Error(`could not get webgl context`);
    // }
  });

  createEffect(() => {
    state.tools.selected;
    const currentTool = state.tools.list[state.tools.selected];
    setToolWidgets(currentTool.getWidgets());
    setTempOptions(currentTool.getOptionsComponent());
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
        <div class={style.widgetsWrapper}>
          {toolWidgets()}
        </div>
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
            ref={canvasElem}
          />
          <canvas
            width={600}
            height={400}
            class={style.selectionCanvas}
            ref={selectionCanvasElem}
          />
        </div>
      </div>
      <div class={style.tempControls}>
        <select onChange={(ev) => setState(`tools`, `selected`, parseInt(ev.target.value))}>
          <For each={state.tools.list}>
            {(item: VincentBaseTool, index) => {
              return (
                <option value={index()}>{item.name}</option>
              );
            }}
          </For>
        </select>
        {tempOptions()}
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
