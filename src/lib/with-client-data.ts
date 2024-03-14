import type { WebContext } from "lean-jsx-types/events";

/**
 * Utility that allows component developers to explicitely pass data to the browser
 * for a given event handler (e.g. onclick) in a JSX element.
 *
 * @param data the data to pass to the browser
 * @param handler - a function that receives two parameters (on the client side):
 * - The Event object from the listener.
 * - A context object with access to the server-passed data and LeanJSX client utilities.
 * @returns a web action handler, used internall by LeanJSX
 *  during render.
 */
export function withClientData<
  Ev extends Event,
  Data extends Record<string, unknown>,
>(
  data: Data,
  handler: (
    this: Element | null,
    ev: Ev,
    webContext: WebContext<Data>,
  ) => unknown,
): SXL.WebHandler<Ev, Data> {
  return {
    handler: handler,
    data,
  };
}

/**
 * Utility that allows using the client-context-defined utilities.
 * Like `withClientData`, but for cases where no data is passed from the server to the client.
 * @param handler - a function that receives two parameters (on the client side):
 * - The Event object from the listener.
 * - A context object with access to LeanJSX client utilities.
 * @returns a web action handler, used internall by LeanJSX
 *  during render.
 */
export function withClientContext<Ev extends Event>(
  handler: (
    this: Element | null,
    ev: Ev,
    webContext: WebContext<object>,
  ) => unknown,
): SXL.WebHandler<Ev, object> {
  return {
    handler: handler,
    data: {},
  };
}
