import { state } from "@renderer/state/StateController"; 

export const commitCanvasChange = async (): Promise<void> => {
  const ctxMain = state.canvas.main!.getContext(`2d`);
  const ctxCommitted = state.canvas.committed!.getContext(`2d`);

  if (ctxMain == null || ctxCommitted == null) {
    throw new Error(`could not get canvas context2d!`);
  }

  const canvasWidth = state.canvas.main!.width;
  const canvasHeight = state.canvas.main!.height;

  const mainData = ctxMain.getImageData(0, 0, canvasWidth, canvasHeight);
  const committedData = ctxCommitted.getImageData(0, 0, canvasWidth, canvasHeight);

  const bbox = {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 0,
    height: 0
  };

  let changed = false;
  let lastChangeIndex = -1;

  for (let i = 0; i < mainData.data.length; i++) {
    if (mainData.data[i] !== committedData.data[i]) {
      // divide by 4 since the data array is a continuous sequence of RGBA values
      const pixelIndex = Math.floor(i / 4);

      // skip if we've already detected a change in this pixel
      if (lastChangeIndex === pixelIndex) continue;
      lastChangeIndex = pixelIndex;

      const x = pixelIndex % canvasWidth;
      const y = Math.floor(pixelIndex / canvasWidth);

      // console.debug(`x:`, x, `y:`, y, `mainData:`, mainData.data[i], `committedData:`, committedData.data[i]);

      if (!changed) {
        changed = true;

        // get true inital values
        // because starting at 0 x 0 would result in the top-left of the
        // bounding box being pinned to the top-left of the canvas
        bbox.top = y;
        bbox.left = x;
        bbox.right = x;
        bbox.bottom = y;
      } else {
        if (y < bbox.top) bbox.top = y;
        if (x < bbox.left) bbox.left = x;
        if (x > bbox.right) bbox.right = x;
        if (y > bbox.bottom) bbox.bottom = y;
      }
    }
  }

  // needed to fix bottom-most/right-most pixels being missed in history steps
  bbox.bottom = Math.min(bbox.bottom + 1, canvasHeight);
  bbox.right = Math.min(bbox.right + 1, canvasWidth);

  bbox.width = bbox.right - bbox.left;
  bbox.height = bbox.bottom - bbox.top;

  // console.debug(bbox);

  // in theory, as long as the first condition remains false, these last
  // two conditions should always also be false... but better safe than sorry.
  if (!changed || bbox.width === 0 || bbox.height === 0) return;

  const beforeData = ctxCommitted.getImageData(
    bbox.left, 
    bbox.top, 
    bbox.width, 
    bbox.height
  );

  ctxCommitted.putImageData(
    ctxMain.getImageData(
      bbox.left, 
      bbox.top, 
      bbox.width, 
      bbox.height
    ), bbox.left, bbox.top
  );

  const afterData = ctxCommitted.getImageData(
    bbox.left, 
    bbox.top, 
    bbox.width, 
    bbox.height
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

  // render bounding box for debugging
  // if (config.debug.enabled && config.debug.historyVisualizer) {
  //   ctxMain.lineWidth = 1;
  //   ctxMain.strokeStyle = `#FF0000`;
  //   ctxMain.globalAlpha = 0.5;
  //   // strokes are drawn at the top left of each pixel, which means
  //   // a lineWidth of 1 ends up being 2 pixels wide with a bit of
  //   // transparency. adding these extra numbers to the bounding box
  //   // values fixes this issue.
  //   ctxMain.strokeRect(
  //     bbox.left - 0.5, 
  //     bbox.top - 0.5, 
  //     bbox.width + 1, 
  //     bbox.height + 1
  //   );
  // }
};