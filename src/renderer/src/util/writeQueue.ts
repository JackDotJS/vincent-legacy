// import { writeBinaryFile, writeTextFile } from "@tauri-apps/api/fs";
// import { BinaryFileContents, FsOptions } from "@tauri-apps/api/fs";

// interface QueueItem {
//   path: string,
//   data: string | BinaryFileContents,
//   options?: FsOptions
// }

// class WriteQueue {
//   queueActive = false;
//   queue: QueueItem[] = [];

//   async _processNextQueueItem(): Promise<void> {
//     this.queueActive = true;

//     if (this.queue.length === 0) {
//       this.queueActive = false;
//       return;
//     }

//     const item = this.queue[0];

//     try {
//       if (typeof item.data === `string`) {
//         await writeTextFile(item.path, item.data, item.options);
//       } else {
//         await writeBinaryFile(item.path, item.data, item.options);
//       }

//       console.debug(`wrote item to disk: ${item.path}`, item.options);
//     }
//     catch (err) {
//       console.error(err);
//       console.debug(`failed to write item to disk: ${item.path}`, item.options);
//     }

//     this.queue.shift();

//     this._processNextQueueItem();
//   }

//   // TODO: figure out a way to make this a promise 
//   // that returns when the given file is written
//   add(path: string, data: string | BinaryFileContents, options?: FsOptions ): void {
//     this.queue.push({ path, data, options });
//     this._processNextQueueItem();
//   }
// }

// export const writeQ = new WriteQueue();