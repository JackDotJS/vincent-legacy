import { VincentBaseTool } from "@renderer/api/VincentBaseTool";
import getCursorPositionOnCanvas from "@renderer/util/getCursorPositionOnCanvas";
import { createSignal, JSXElement } from "solid-js";
import style from './Paintbrush.module.css';
import { state } from "@renderer/state/StateController";

class PaintbrushTool extends VincentBaseTool {
  drawing = false;

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
  }

  _startDrawing(ev: PointerEvent): void {
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

    const ctxMain = state.canvas.main!.getContext(`2d`);
    const ctxHidden = state.canvas.hidden!.getContext(`2d`);

    if (ctxMain == null || ctxHidden == null) {
      throw new Error(`could not get canvas context2d!`);
    }

    // clamp bounding box to canvas bounds
    this.bbox.top = Math.min(state.canvas.main!.height, Math.max(this.bbox.top, 0));
    this.bbox.left = Math.min(state.canvas.main!.width, Math.max(this.bbox.left, 0));
    this.bbox.right = Math.min(state.canvas.main!.width, Math.max(this.bbox.right, 0));
    this.bbox.bottom = Math.min(state.canvas.main!.height, Math.max(this.bbox.bottom, 0));

    const bboxWidth = Math.abs(this.bbox.right - this.bbox.left);
    const bboxHeight = Math.abs(this.bbox.bottom - this.bbox.top);

    if (bboxWidth !== 0 && bboxHeight !== 0) {
      const beforeData = ctxHidden.getImageData(
        this.bbox.left, 
        this.bbox.top, 
        bboxWidth, 
        bboxHeight
      );
  
      ctxHidden.putImageData(
        ctxMain.getImageData(
          this.bbox.left,
          this.bbox.top,
          bboxWidth,
          bboxHeight
        ), this.bbox.left, this.bbox.top
      );
  
      const afterData = ctxHidden.getImageData(
        this.bbox.left, 
        this.bbox.top, 
        bboxWidth, 
        bboxHeight
      );

      state.history.addHistoryStep({
        type: `canvas`,
        data: {
          before: beforeData, 
          after: afterData
        },
        x: this.bbox.left,
        y: this.bbox.top
      });
    }
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
      const brushMargin = ((curSize / 2) + 1);
      const maxTop = (curPos.y - brushMargin);
      const maxLeft = (curPos.x - brushMargin);
      const maxRight = (curPos.x + brushMargin);
      const maxBottom = (curPos.y + brushMargin);

      if (maxTop < this.bbox.top) this.bbox.top = maxTop;
      if (maxLeft < this.bbox.left) this.bbox.left = maxLeft;
      if (maxRight > this.bbox.right) this.bbox.right = maxRight;
      if (maxBottom > this.bbox.bottom) this.bbox.bottom = maxBottom;

      const ctx = state.canvas.main!.getContext(`2d`);

      if (ctx == null) {
        throw new Error(`could not get canvas context2d!`);
      }

      ctx.globalCompositeOperation = `source-over`;

      // if (eraserMode()) {
      //   ctx.globalCompositeOperation = `destination-out`;
      // }

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