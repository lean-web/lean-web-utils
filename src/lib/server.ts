import {
  refetchElement,
  update,
  replaceWith,
  withClientData,
  isPureActionHandler,
  isWebHandler,
} from "./actions";
import type {
  WebActions as IWebActions,
  RefetchState,
} from "lean-jsx-types/lib/events";

export { withClientData, isPureActionHandler, isWebHandler };
//
export class WebActions implements IWebActions {
  refetchElement = refetchElement;
  update = update;
  replaceWith = replaceWith;
}
