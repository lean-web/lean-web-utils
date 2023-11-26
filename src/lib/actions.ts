import { EventHandlerKeys } from "./eventHandlerMap";

export interface WebActions {
    refetchElement: (
      id: string,
      queryParams: Record<string, string | number | boolean>,
    ) => Promise<boolean | RefetchState>;
    update: <T extends keyof JSX.IntrinsicElements>(
      id: string,
      params: JSX.IntrinsicElements[T],
    ) => void;
  }


interface WebContext<Data> {
    data: Data;
    actions: WebActions;
}

export interface EventDetails {
    id: string;
    queryParams: Record<string, string | number | boolean>;
    eventId: string;
}

interface EventReply {
    success: boolean
}

type RefetchState = 'TIMEOUT' | 'ERROR' | 'IGNORED'

function timeout<T>(time:number, promise: Promise<T>): Promise<T | RefetchState> {
    const timeoutPromise: Promise<'TIMEOUT'> = new Promise((resolve) => {
        setTimeout(() => resolve('TIMEOUT'), time)
    })
    return Promise.race([timeoutPromise, promise])
}

export async function refetchElement(
  id: string,
  queryParams: Record<string, string | number | boolean>,
  options?: {
    timeout: number,
    ignoreResponse: boolean
  }
): Promise<boolean | RefetchState> {
    const eventId = `${new Date().getTime()}`
  const event = new CustomEvent("refetch", { detail: { id, queryParams, eventId } });

  const response: Promise<boolean> = options?.ignoreResponse ? Promise.resolve(true) : new Promise((resolve, reject) => {
    // @ts-expect-error: Need to add more custom events to the global types
    document.addEventListener(eventId, (ev: CustomEvent<EventReply>) => {
        if (ev.detail.success) {
            resolve(true);
        } else {
            reject(false)
        }
    })
  })
  document.dispatchEvent(event);
  return await timeout(options?.timeout ?? 5000, response)
}

export function replyRefetch(ev: CustomEvent<EventDetails>, success:boolean) {
    const event = new CustomEvent(ev.detail.eventId, { detail: { success} });
  document.dispatchEvent(event);
}

export function update<T extends keyof JSX.IntrinsicElements>(
  id: string,
  props: JSX.IntrinsicElements[T],
) {
  const element = document.getElementById(id);
  if (!element) {
    console.warn(`Tried to update element with id ${id}, but it doesn't exist`);
    return;
  }

  Object.entries(props).forEach(([name, value]) =>
    element.setAttribute(
      name,
      typeof value === "object" ? JSON.stringify(value) : `${value}`,
    ),
  );
}


/**
 * Utility that allows component developers to explicitely pass data to the browser
 * for a given event handler (e.g. onclick) in a JSX element.
 *
 * @param data the data to pass to the browser
 * @param handler the original handler
 * @returns a web action handler, used internall by LeanJSX
 *  during render.
 */
export function webAction<
  Ev extends UIEvent,
  Data extends Record<string, unknown>,
>(
  data: Data,
  handler: (
    this: Element | null,
    ev?: Ev,
    webContext?: WebContext<Data>,
  ) => unknown,
): SXL.WebHandler<Ev, Data> {
  return {
    handler: handler,
    data,
  };
}

/**
 * Checks if a property tuple is a web handler with data.
 * @param pair [key, value]
 * @returns true if value is a web handler
 */
export function isWebHandler(
  pair: [key: string, value: unknown],
): pair is [string, SXL.WebHandler<Event, Record<string, unknown>>] {
  const [key, value] = pair;
  if (!value || !key || !(key in EventHandlerKeys)) {
    return false;
  }
  if (typeof value === "object") {
    return "handler" in value && "data" in value;
  }
  return false;
}

/**
 * Checks if a property tuple is a pure function (no external data used)
 * @param pair [key, value]
 * @returns true if the event handler is a pure function
 */
export function isPureActionHandler(
  pair: [key: string, value: unknown],
): pair is [
  keyof GlobalEventHandlers,
  NonNullable<GlobalEventHandlers[keyof GlobalEventHandlers]>,
] {
  const [key, value] = pair;
  return key in EventHandlerKeys && typeof value === "function";
}
