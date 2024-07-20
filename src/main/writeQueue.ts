import { ObjectEncodingOptions } from "fs";
import { writeFile } from "fs/promises";

interface QueueItem {
  path: string,
  data: string | DataView,
  resolve: (value?: Error) => void,
  options?: ObjectEncodingOptions
}

class WriteQueue {
  queueActive = false;
  queue: QueueItem[] = [];

  async _processNextQueueItem(): Promise<void> {
    this.queueActive = true;

    if (this.queue.length === 0) {
      this.queueActive = false;
      return;
    }

    const item = this.queue[0];

    try {
      await writeFile(item.path, item.data, item.options);
      console.debug(`wrote item to disk: ${item.path}`, item.options);
      item.resolve();
    }
    catch (err) {
      console.error(err);
      console.debug(`failed to write item to disk: ${item.path}`, item.options);
      item.resolve(err as Error);
    }

    this.queue.shift();

    this._processNextQueueItem();
  }

  add(path: string, data: string | DataView, options?: ObjectEncodingOptions ): Promise<undefined|Error> {
    return new Promise((resolve) => {
      this.queue.push({ path, data, resolve, options });
      this._processNextQueueItem();
    });
  }
}

export const writeQ = new WriteQueue();