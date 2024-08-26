import { replyRefetch, type EventDetails } from "./actions";
import type { LeanJSXDocument } from "./web";

export interface DynamicDataComponent extends Partial<HTMLElement> {
  "data-id": string;
}

function errorToHtml(err: Error) {
  if (!err.stack) {
    return `<div  style="background-color:red;font-size: 12px; margin:1em;">${err.message}</div>`;
  }
  return `<details style="background-color:red;font-size: 12px; margin:1em;">
      <summary>${err.message}</summary>
      <ul>
      ${err.stack
        ?.split("\n")
        .map((row) => `<li>${row}</li>`)
        .join("")}
      </ul>
      </details>`;
}

async function fetchData(dataId: string) {
  try {
    const response = await fetch(`/components/${dataId}`);
    if (response.status === 500) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
      const err: Error = await response.json();
      return errorToHtml(err);
    }
    return response.text();
  } catch (err) {
    if (err instanceof Error) {
      return errorToHtml(err);
    }
    throw err;
  }
}

/**
 * A native web component for asynchronous/dynamic rendering.
 *
 * Not meant to be used directly by developers, as it should be accessed
 * through {@link GetDynamicComponent}
 */
export class DynamicComponent
  extends HTMLElement
  implements DynamicDataComponent
{
  "data-id": string;
  domParser: DOMParser;

  isLoading = false;

  constructor() {
    super();
    this.domParser = new DOMParser();
  }

  static get observedAttributes() {
    return ["data-id"];
  }

  updateFromString(data: string) {
    const responseDOM = this.domParser.parseFromString(data, "text/html");
    const fragment = responseDOM.createDocumentFragment();

    for (const child of Array.from(
      responseDOM.body.querySelectorAll("script"),
    )) {
      if ((child as Element).tagName === "SCRIPT") {
        const scriptElement = document.createElement("script");
        scriptElement.type = "application/javascript";
        scriptElement.textContent = child.textContent;
        fragment.appendChild(scriptElement);
      }
    }

    Array.from(responseDOM.body.childNodes).forEach((child) => {
      if ((child as Element).tagName === "SCRIPT") {
      } else {
        fragment.appendChild(child);
      }
    });

    this.replaceChildren(...Array.from(fragment.childNodes));
  }

  connectedCallback() {
    // Prevent triggering the data fetch again
    // if it's already in progress
    if (this.isLoading) {
      return;
    }

    const dataId = this.getAttribute("data-id");
    if (!dataId) {
      return;
    }

    this.isLoading = true;
    void fetchData(dataId)
      .then((data) => {
        this.updateFromString(data);

        // this.innerHTML = data;
        (document as LeanJSXDocument).addEventListener(
          "refetch",
          this.onReload.bind(this),
          false,
        );
        // this.replaceChildren(fragment);
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  disconnectedCallback() {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    (document as LeanJSXDocument).removeEventListener(
      "refetch",
      this.onReload.bind(this),
      false,
    );
  }

  async onReload(e: CustomEvent<EventDetails>) {
    const dataId = this.getAttribute("data-id");

    if (!dataId) {
      return;
    }

    const url = new URL(`${window.location.origin}/${dataId}`);

    if (e.detail.id === url.pathname?.replace("/", "")) {
      Object.entries(e.detail.queryParams).forEach(([key, value]) => {
        url.searchParams.append(key, `${value}`);
      });
      const newData = await fetchData(url.pathname.slice(1) + url.search);
      this.updateFromString(newData);

      replyRefetch(e, true);
    }
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === "data-id" && oldValue !== newValue) {
      this.connectedCallback();
    }
  }

  static register() {
    if (!customElements.get("dynamic-component")) {
      customElements.define("dynamic-component", DynamicComponent);
    }
  }
}
