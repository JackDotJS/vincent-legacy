import { subscribeEvent } from "../state/GlobalEventEmitter";
import { setState } from "./StateController";

subscribeEvent(`menu.options.open`, null, () => {
  setState(`optionsOpen`, true);
});

subscribeEvent(`app.exit`, null, () => {
  window.close();
});