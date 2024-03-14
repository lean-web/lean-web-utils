import {
  refetchElement,
  update,
  replaceWith,
  isPureActionHandler,
  isWebHandler,
  updateContentWithResponse,
  urlForComponent,
} from "./actions";
import type { WebActions as IWebActions } from "lean-jsx-types/events";
export { withClientData, withClientContext } from "./with-client-data";

export { isPureActionHandler, isWebHandler, update };
//
export class WebActions implements IWebActions {
  updateContentWithResponse = updateContentWithResponse;
  refetchElement = refetchElement;
  update = update;
  replaceWith = replaceWith;
  urlForComponent = urlForComponent;
}
