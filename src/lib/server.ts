import {
  refetchAPIC,
  update,
  replaceAPIC,
  isPureActionHandler,
  isWebHandler,
  updateContentWithResponse,
  urlForComponent,
} from "./actions";
import type { WebActions as IWebActions } from "lean-jsx-types/events";
export { withClientData } from "./with-client-data";
export { refetchAPIC, updateContentWithResponse, replaceAPIC, urlForComponent };

export { isPureActionHandler, isWebHandler, update };

export class WebActions implements IWebActions {
  refetchAPIC = refetchAPIC;
  replaceAPIC = replaceAPIC;
  urlForComponent = urlForComponent;
}
