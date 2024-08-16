import { VincentBaseTool } from "@renderer/api/VincentBaseTool";
import getCursorPositionOnCanvas from "@renderer/util/getCursorPositionOnCanvas";
import { createSignal, JSXElement } from "solid-js";
import style from './PaintbrushOLD.module.css';
import { state } from "@renderer/state/StateController";
import { commitCanvasChange } from "@renderer/util/commitCanvasChange";

class PaintbrushToolOld extends VincentBaseTool {
  drawing = false;

  selectionArea: ImageData | null = null;

  lastPosX = 0;
  lastPosY = 0;
  lastSize = 0;

  bbox = {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  };

  cursorElem!: HTMLDivElement;

  getBrushSize;
  setBrushSize;
  getBrushColor;
  setBrushColor;
  getCursorVisible;
  setCursorVisible;

  constructor() {
    super({
      name: `paintbrushold`,
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
  }

  _startDrawing(ev: PointerEvent): void {
    const selectCtx = state.canvas.selection!.getContext(`2d`);

    if (selectCtx == null) {
      throw new Error(`could not get main/selection canvas context2d`);
    }

    const selectData = selectCtx.getImageData(0, 0, state.canvas.selection!.width, state.canvas.selection!.height);

    let found = false;

    for (const int of selectData.data) {
      if (int !== 0) {
        console.debug(`data found`);
        this.selectionArea = selectData;
        found = true;
        break;
      }
    }

    if (!found) {
      this.selectionArea = null;
      console.debug(`no selection data found`);
    }

    const curPos = getCursorPositionOnCanvas(ev.pageX,  ev.pageY);
    this.bbox.top = curPos.y;
    this.bbox.left = curPos.x;
    this.bbox.right = curPos.x;
    this.bbox.bottom = curPos.y;
    
    this.lastPosX = curPos.x;
    this.lastPosY = curPos.y;

    this.drawing = true;
    this._updateCursor(ev);
  }

  _finishDrawing(): void {
    if (!this.drawing) return;
    this.drawing = false;

    commitCanvasChange();
  }

  async _masktest(): Promise<void> {
    if (this.selectionArea == null) return;
    const ctxMain = state.canvas.main!.getContext(`2d`);
    const ctxCommitted = state.canvas.committed!.getContext(`2d`);

    if (ctxMain == null || ctxCommitted == null) {
      throw new Error(`could not get canvas context2d`);
    }

    const canvasData = ctxMain.getImageData(0, 0, state.canvas.main!.width, state.canvas.main!.height);
    const committedData = ctxCommitted.getImageData(0, 0, state.canvas.main!.width, state.canvas.main!.height);

    for (let i = 0; i < this.selectionArea.data.length; i++) {
      if (canvasData.data[i] !== committedData.data[i]) {
        const mixMain = Math.min(canvasData.data[i], this.selectionArea.data[i]);
        const mixCommitted = Math.min(committedData.data[i], 255 - this.selectionArea.data[i]);
        const added = Math.min(Math.max(mixMain, mixCommitted), mixMain + mixCommitted);

        //const lerp = canvasData.data[i] + (this.selectionArea.data[i] - canvasData.data[i]) * (this.selectionArea.data[i] / 255);

        canvasData.data[i] = added;
      }
    }

    ctxMain.reset();
    ctxMain.putImageData(canvasData, 0, 0);
  }

  // TODO: use coalesced events
  // see: https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/getCoalescedEvents
  _updateCursor(ev: PointerEvent): void {
    this.cursorElem.style.top = ev.clientY + `px`;
    this.cursorElem.style.left = ev.clientX + `px`;
    this.cursorElem.style.width = (this.getBrushSize() * state.canvas.scale) + `px`;
    this.cursorElem.style.height = (this.getBrushSize() * state.canvas.scale) + `px`;

    const curPos = getCursorPositionOnCanvas(ev.pageX,  ev.pageY);
    let curSize = this.getBrushSize();

    // console.debug(curPos);

    // ev.pressure is always either 0 or 0.5 for other pointer types
    // so we only use it if an actual pen is being used
    if (ev.pointerType === `pen`) {
      curSize = ev.pressure * this.getBrushSize();
    }

    // console.debug(this.drawing);

    if (this.drawing) {
      const ctx = state.canvas.main!.getContext(`2d`);

      if (ctx == null) {
        throw new Error(`could not get canvas context2d!`);
      }

      ctx.globalCompositeOperation = `source-over`;

      const dx = (this.lastPosX - curPos.x);
      const dy = (this.lastPosY - curPos.y);
      const steps = Math.hypot(dx, dy);

      for (let i = 1; i < steps; i++) {
        const stepLengthX = dx * (i / steps);
        const stepLengthY = dy * (i / steps);

        const mx = this.lastPosX - stepLengthX;
        const my = this.lastPosY - stepLengthY;
        const ms = ((this.lastSize) - (curSize)) * (1 - (i / steps)) + (curSize);

        ctx.beginPath();
        ctx.fillStyle = this.getBrushColor();
        ctx.arc(mx, my, ms / 2, 0, 2 * Math.PI);
        ctx.fill();
      }
      
      // draw end circle
      ctx.beginPath();
      ctx.fillStyle = this.getBrushColor();
      ctx.arc(curPos.x, curPos.y, curSize / 2, 0, 2 * Math.PI);
      ctx.fill();

      if (this.selectionArea != null) {
        this._masktest();
      }
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

export default new PaintbrushToolOld();