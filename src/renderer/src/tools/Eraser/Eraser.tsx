import { VincentBaseTool } from "@renderer/api/VincentBaseTool";
import getCursorPositionOnCanvas from "@renderer/util/getCursorPositionOnCanvas";
import { createSignal, JSXElement } from "solid-js";
import style from './Eraser.module.css';
import { state } from "@renderer/state/StateController";
import { commitCanvasChange } from "@renderer/util/commitCanvasChange";

class EraserTool extends VincentBaseTool {
  drawing = false;

  lastPosX = 0;
  lastPosY = 0;
  lastSize = 0;

  cursorElem!: HTMLDivElement;

  getBrushSize;
  setBrushSize;
  getCursorVisible;
  setCursorVisible;

  constructor() {
    super({
      name: `eraser`,
      namespace: `vincent`,
      category: `drawing`
    });

    const [ brushSize, setBrushSize ] = createSignal<number>(10);
    const [ cursorVisible, setCursorVisible ] = createSignal<boolean>(false);
    this.getBrushSize = brushSize;
    this.setBrushSize = setBrushSize;
    this.getCursorVisible = cursorVisible;
    this.setCursorVisible = setCursorVisible;
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

    commitCanvasChange();
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
      // update bounding box data
      // FIXME: needs to be corrected with new cursor position logic
      const ctx = state.canvas.main!.getContext(`2d`);

      if (ctx == null) {
        throw new Error(`could not get canvas context2d!`);
      }

      ctx.globalCompositeOperation = `destination-out`;

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
        ctx.fillStyle = `#000000`;
        ctx.arc(mx, my, ms / 2, 0, 2 * Math.PI);
        ctx.fill();
      }
      
      // draw end circle
      ctx.beginPath();
      ctx.fillStyle = `#000000`;
      ctx.arc(curPos.x, curPos.y, curSize / 2, 0, 2 * Math.PI);
      ctx.fill();
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

export default new EraserTool();