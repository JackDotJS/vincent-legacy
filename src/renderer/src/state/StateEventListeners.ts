import { subscribeEvent } from "../state/GlobalEventEmitter";
import { setState } from "./StateController";

subscribeEvent(`file.new`, null, () => {
  setState(`modal`, `contents`, `newFile`);
  setState(`modal`, `open`, true);
});

subscribeEvent(`menu.options.open`, null, () => {
  setState(`optionsOpen`, true);
});

subscribeEvent(`app.exit`, null, () => {
  // TODO: check for unsaved changes
  window.close();
});

subscribeEvent(`www.github`, null, () => {
  window.open(`https://github.com/JackDotJS/vincent`);
});