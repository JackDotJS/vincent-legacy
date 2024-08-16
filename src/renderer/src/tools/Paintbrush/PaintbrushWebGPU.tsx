import { VincentBaseTool } from "@renderer/api/VincentBaseTool";
import getCursorPositionOnCanvas from "@renderer/util/getCursorPositionOnCanvas";
import { createSignal, JSXElement } from "solid-js";
import style from './Paintbrush.module.css';
import { state } from "@renderer/state/StateController";
// import { commitCanvasChange } from "@renderer/util/commitCanvasChange";

import shaderCode from './Paintbrush.wgsl?raw';

class PaintbrushTool extends VincentBaseTool {
  drawing = false;

  selectionArea: ImageData | null = null;

  lastPosX = 0;
  lastPosY = 0;
  lastSize = 0;

  cursorElem!: HTMLDivElement;

  getBrushSize;
  setBrushSize;
  getBrushColor;
  setBrushColor;
  getCursorVisible;
  setCursorVisible;

  shaderModule: GPUShaderModule;
  renderPipeline: GPURenderPipeline;
  uniformBufferSize =
    4 * 4 + // color
    2 * 4 + // scale
    2 * 4; // position
  uniformBuffer: GPUBuffer;
  bindGroup: GPUBindGroup;

  constructor() {
    super({
      name: `paintbrush`,
      namespace: `vincent`,
      category: `drawing`
    });

    const [ brushSize, setBrushSize ] = createSignal<number>(10);
    const [ brushColor, setBrushColor ] = createSignal<string>(`#000000`);
    const [ cursorVisible, setCursorVisible ] = createSignal<boolean>(false);
    this.getBrushSize = brushSize;
    this.setBrushSize = setBrushSize;
    this.getBrushColor = brushColor;
    this.setBrushColor = setBrushColor;
    this.getCursorVisible = cursorVisible;
    this.setCursorVisible = setCursorVisible;

    const shaderModule = state.gpu.device!.createShaderModule({
      label: `red tri shader`,
      code: shaderCode
    });

    const pipeline = state.gpu.device!.createRenderPipeline({
      label: `red tri pipeline`,
      layout: `auto`,
      vertex: { 
        module: shaderModule
      },
      fragment: { 
        module: shaderModule,
        targets: [
          { 
            format: state.gpu.canvasFormat!
          }
        ]
      }
    });
    
    const uniformBuffer = state.gpu.device!.createBuffer({
      label: `paintbrush uniform buffer`,
      size: this.uniformBufferSize,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });

    const bindGroup = state.gpu.device!.createBindGroup({
      label: `paintbrush bindgroup`,
      layout: pipeline.getBindGroupLayout(0),
      entries: [
        {
          binding: 0,
          resource: {
            buffer: uniformBuffer
          }
        }
      ]
    });
    
    this.shaderModule = shaderModule;
    this.renderPipeline = pipeline;
    this.uniformBuffer = uniformBuffer;
    this.bindGroup = bindGroup;
  }

  _startDrawing(ev: PointerEvent): void {
    const curPos = getCursorPositionOnCanvas(ev.pageX,  ev.pageY);
    this.lastPosX = curPos.x;
    this.lastPosY = curPos.y;

    this.drawing = true;
    this._updateCursor(ev);
  }

  _finishDrawing(): void {
    if (!this.drawing) return;
    this.drawing = false;

    // commitCanvasChange();
  }

  // async _masktest(): Promise<void> {
  // }

  // TODO: use coalesced events
  // see: https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/getCoalescedEvents
  _updateCursor(ev: PointerEvent): void {
    this.cursorElem.style.top = ev.clientY + `px`;
    this.cursorElem.style.left = ev.clientX + `px`;
    this.cursorElem.style.width = (this.getBrushSize() * state.canvas.scale) + `px`;
    this.cursorElem.style.height = (this.getBrushSize() * state.canvas.scale) + `px`;

    const curPos = getCursorPositionOnCanvas(ev.pageX,  ev.pageY);
    let curSize = this.getBrushSize();

    const col = this.getBrushColor() as string;
    const hexVals = col.substring(1).match(/.{2}/g) ?? [];
    const rawColors: number[] = [];

    for (const hex of hexVals) {
      rawColors.push(parseInt(hex, 16) / 255);
    }

    // console.debug(curPos);

    // ev.pressure is always either 0 or 0.5 for other pointer types
    // so we only use it if an actual pen is being used
    if (ev.pointerType === `pen`) {
      curSize = ev.pressure * this.getBrushSize();
    }

    if (this.drawing) {
      const ctx = state.canvas.main!.getContext(`webgpu`);
      if (ctx == null) {
        throw new Error(`could not get webgpu context`);
      }

      const aspect = state.canvas.main!.width / state.canvas.main!.height;
      const uniformValues = new Float32Array(this.uniformBufferSize / 4);

      // set color
      uniformValues.set([
        rawColors[0], 
        rawColors[1], 
        rawColors[2], 
        1
      ], 0);

      // set scale
      const temp = curSize / state.canvas.main!.height;
      uniformValues.set([temp / aspect, temp], 4);
      
      // set position
      uniformValues.set([curPos.gpuX, curPos.gpuY], 6);

      state.gpu.device!.queue.writeBuffer(this.uniformBuffer, 0, uniformValues);

      const currentTexture = ctx.getCurrentTexture();

      const renderpass: GPURenderPassDescriptor = {
        label: `paintbrush renderpass`,
        colorAttachments: [
          {
            view: currentTexture.createView(),
            loadOp: `load`,
            storeOp: `store`
          }
        ]
      };

      const encoder = state.gpu.device!.createCommandEncoder({
        label: `red tri encoder`
      });

      const pass = encoder.beginRenderPass(renderpass);
      pass.setPipeline(this.renderPipeline);
      pass.setBindGroup(0, this.bindGroup);
      pass.draw(6);
      pass.end();

      const cbuffer = encoder.finish();
      state.gpu.device!.queue.submit([ cbuffer ]);
    }

    this.lastPosX = curPos.x;
    this.lastPosY = curPos.y;
    this.lastSize = curSize;
  }

  // pointerEnter(ev: PointerEvent): void {
    
  // }

  pointerDown(ev: PointerEvent): void {
    if (state.canvas.wrapper?.contains(ev.target as Element)) {
      this._startDrawing(ev);
    }
  }

  pointerMove(ev: PointerEvent): void {
    this._updateCursor(ev);
    if (state.canvas.wrapper?.contains(ev.target as Element)) {
      this.setCursorVisible(true);
    } else {
      this.setCursorVisible(false);
    }
  }

  pointerChange(ev: PointerEvent): void {
    this._updateCursor(ev);
  }

  pointerUp(): void {
    this._finishDrawing();
  }

  pointerOut(ev: PointerEvent): void {
    if (ev.pointerType === `pen`) this._finishDrawing();
  }

  pointerLeave(ev: PointerEvent): void {
    if (ev.pointerType === `pen`) this._finishDrawing();
  }

  pointerCancel(): void {
    this._finishDrawing();
  }

  getOptionsComponent(): JSXElement {
    return (
      <>
        <label>
          brush size: 
          <input type="number" value={this.getBrushSize()} onChange={(ev) => this.setBrushSize(parseInt(ev.target.value))} />
        </label>
        <label>
          brush color: 
          <input type="color" value={this.getBrushColor()} onChange={(ev) => this.setBrushColor(ev.target.value)} />
        </label>
      </>
    );
  }

  getWidgets(): JSXElement {
    return (
      <div 
        class={style.brushCursor}
        classList={{ [style.cursorVisible]: this.getCursorVisible() }}
        ref={this.cursorElem}
      />
    );
  }
}

export default new PaintbrushTool();