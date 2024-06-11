import { EventHandlerKeys } from "./eventHandlerMap";
import { updateFromString } from "./utils";
import type { APICRequest } from "lean-jsx-types/events";

class APICActionError extends Error {
  cause: unknown;
  constructor(message: string, error: unknown) {
    super(message);
    this.name = this.constructor.name;
    if (!error) throw new Error("APICActionError requires a message and error");
    this.cause = error;
    this.message = message;
  }
}

export interface EventDetails {
  id: string;
  queryParams: Record<string, string | number | boolean>;
  eventId: string;
}

interface EventReply {
  success: boolean;
}

type RefetchState = "TIMEOUT" | "ERROR" | "IGNORED";

function timeout<T>(
  time: number,
  promise: Promise<T>,
): Promise<T | RefetchState> {
  const timeoutPromise: Promise<"TIMEOUT"> = new Promise((resolve) => {
    setTimeout(() => resolve("TIMEOUT"), time);
  });
  return Promise.race([timeoutPromise, promise]);
}

/**
 * Create a URL for the given path, relative to the current base domain.
 * @param path - the relative path
 * @returns - a fully formed URL to the relative path.
 */
function getURL(path: string): URL {
  return new URL(`${window.location.origin}/${path}`);
}

/**
 * Given a function that returns a promise, return a decorated version of that same function which will behave as follows:
 *
 * - The first time the decorated function is called, it will call the original function and return a promise.
 * - Subsequent calls to the decorated function will return an empty promise if they are made before the previous response completes.
 * - Once the promise is resolved, the decorated call will again call the original function on invocation.
 *
 * @param fn the original function
 * @returns a decorated version that debounces calls.
 */
function debouncePromise<P, F extends (...arg: any[]) => Promise<P>, Args>(
  fn: F,
) {
  let loading = false;

  return (...arg: Parameters<typeof fn>): Promise<P | undefined> => {
    if (loading) {
      return Promise.resolve(undefined);
    }
    loading = true;
    return fn(...arg).finally(() => (loading = false));
  };
}

// create a debounced version of "updateContentWith"
const updateContentWith_ = debouncePromise(updateContentWith);

/**
 * Replace a given API component with another.
 *
 * @param replacedId the ID for the component to replace.
 * @param replacementId the ID for the component to use as a replacement.
 * @param queryParams The query parameters used in the call for the "replacementId" component.
 * @param options Request options
 * @returns
 */
export async function replaceAPIC(
  replacedId: string,
  replacementId: string,
  queryParams: Record<string, string | number | boolean>,
  options?: APICRequest,
): Promise<boolean | RefetchState> {
  await updateContentWith_(
    urlForComponent(replacementId),
    `[ref=${replacedId}]`,
    queryParams,
    options,
  );
  return Promise.resolve(true);
}

/**
 * Reload an API component.
 * @param id the ID of the component to reload
 * @param queryParams the query parameters to use in the request to fetch the component contents.
 * @param options options for the request
 * @returns
 */
export async function refetchAPIC(
  id: string,
  queryParams: Record<string, string | number | boolean>,
  options?: APICRequest,
): Promise<boolean | RefetchState> {
  const url = urlForComponent(id);
  await updateContentWith_(url, `[ref=${id}]`, queryParams, options);
  return Promise.resolve(true);
}

export function replyRefetch(ev: CustomEvent<EventDetails>, success: boolean) {
  const event = new CustomEvent(ev.detail.eventId, { detail: { success } });
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
 * Checks if a property tuple is a web handler (with or without data).
 * @param pair [key, value]
 * @returns true if value is a web handler
 */
export function isWebHandler(
  pair: [key: string, value: SXL.Props<object>[keyof SXL.Props<object>]],
): pair is [string, SXL.WebHandler<Event, Record<string, unknown>>] {
  const [key, value] = pair;
  if (value === null) {
    return false;
  }
  if (typeof value === "object") {
    return "handler" in value && "data" in value;
  }
  if (typeof value === "function") {
    return true;
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

/**
 *  Given the URL for a component API endpoint (which returns HTML), and an element selector,
 * fetch the HTML from the URL and update the first element that matches that query selector
 *
 * e.g.: updateContentWith("http://localhost:5173/components/product-list", "#product-list");
 *
 * @param url
 * @param elSelector
 * @returns an empty promise that completes when the update is complete
 */
export async function updateContentWith(
  url: URL,
  elSelector: string,
  queryParams?: Record<string, string | number | boolean>,
  options?: APICRequest,
): Promise<void> {
  const element = document.querySelector(elSelector);
  if (!element) {
    console.warn(
      `Could not find element ${elSelector}, which is expected to be updated`,
    );
  }
  const { onlyReplaceContent, streamResponse, noCache, ...fetchOptions } =
    options ?? {
      onlyReplaceContent: true,
      streamResponse: false,
    };
  if (queryParams) {
    Object.entries(queryParams).forEach(([key, value]) => {
      url.searchParams.append(key, `${value}`);
    });
  }
  const response = await fetch(url.toString(), {
    cache: fetchOptions.cache ?? noCache ? "reload" : "default",
    ...fetchOptions,
  });
  if (!response.body) {
    return;
  }
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  const domParser = new DOMParser();

  let html = "";

  while (true) {
    try {
      const { value, done } = await reader.read();
      if (done) break;
      html += value;
      if (value.includes("<!-- ASYNC -->") && streamResponse) {
        const element = document.querySelector(elSelector);

        if (element) {
          updateFromString(
            html,
            domParser,
            element,
            onlyReplaceContent ?? true,
          );
        } else {
          console.warn("Could not find element", element);
        }
      }
    } catch (err) {
      throw new APICActionError("Failed to update AIC", err);
    }
  }

  if (element) {
    updateFromString(
      html,
      domParser,
      element,
      options?.onlyReplaceContent ?? true,
    );
  } else {
    console.warn("Could not find element", element);
  }
}

/**
 * Given an API Component ID, get the DOM element where it was rendered, if exists.
 * @param id string
 * @returns the API Component element
 */
export function getElementByAPICId(id: string): Element | null {
  return document.querySelector(`[ref=${id}]`);
}

/**
 *  Given the URL for a component API endpoint (which returns HTML), and an element selector,
 * fetch the HTML from the URL and update the first element that matches that query selector
 *
 * e.g.: updateContentWith("http://localhost:5173/components/product-list", "#product-list");
 *
 * @param url
 * @param elSelector
 * @returns an empty promise that completes once the update is finished
 */
export async function updateContentWithResponse(
  replacedId: string,
  response: Response,
  options?: APICRequest,
): Promise<void> {
  const element = document.querySelector(`[ref=${replacedId}]`);
  if (!element) {
    console.warn(
      `Could not find component ${replacedId}, which is expected to be updated`,
    );
  }
  if (!response.body) {
    return;
  }
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  const domParser = new DOMParser();

  let html = "";

  while (true) {
    try {
      const { value, done } = await reader.read();
      if (done) break;
      html += value;
      if (
        value.includes("<!-- ASYNC -->") // &&
        //   (options?.streamResponse ?? false)
      ) {
        if (element) {
          updateFromString(
            html,
            domParser,
            element,
            options?.onlyReplaceContent ?? true,
          );
        } else {
          console.warn("Could not find element", element);
        }
      }
    } catch (err) {
      throw new APICActionError("Failed to update AIC", err);
    }
  }

  if (element) {
    updateFromString(
      html,
      domParser,
      element,
      options?.onlyReplaceContent ?? true,
    );
  } else {
    console.warn("Could not find element", element);
  }
}

export function urlForComponent(componentId: string): URL {
  return getURL(`components/${componentId}`);
}
