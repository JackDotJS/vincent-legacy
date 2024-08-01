import { subscribeEvent } from "../state/GlobalEventEmitter";
import { setState } from "./StateController";
import NewFileModal from "../ui/modal/ModalNewFile";

subscribeEvent(`file.new`, null, () => {
  setState(`modalContents`, NewFileModal);
  setState(`modalOpen`, true);
});

subscribeEvent(`menu.options.open`, null, () => {
  setState(`optionsOpen`, true);
});

subscribeEvent(`app.exit`, null, () => {
  // TODO: check for unsaved changes
  window.close();
});

subscribeEvent(`openurl.github`, null, () => {
  window.open(`https://github.com/JackDotJS/vincent`);
});