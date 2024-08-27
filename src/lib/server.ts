import {
    refetchAPIC,
    update,
    replaceAPIC,
    isPureActionHandler,
    isWebHandler,
    updateContentWithResponse,
    getElementByAPICId,
    urlForComponent,
} from "./actions";
import type { IWebActions } from "lean-jsx-types/events";

export { isPureActionHandler, isWebHandler, update };

export class WebActions implements IWebActions {
    refetchAPIC = refetchAPIC;
    replaceAPIC = replaceAPIC;
    urlForComponent = urlForComponent;
    getElementByAPICId = getElementByAPICId;
}
