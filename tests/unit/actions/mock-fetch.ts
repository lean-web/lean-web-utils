/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { TextDecoderStream, ReadableStream } from "stream/web";

function buildBody(responseHTML: string): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(
        Uint8Array.from(
          Array.from(responseHTML).map((letter) => letter.charCodeAt(0)),
        ),
      );
      controller.close();
    },
  });
}

function buildHeaders(): Response["headers"] {
  return {
    append: function (name: string, value: string): void {
      throw new Error("Function not implemented.");
    },
    delete: function (name: string): void {
      throw new Error("Function not implemented.");
    },
    get: function (name: string): string | null {
      throw new Error("Function not implemented.");
    },
    getSetCookie: function (): string[] {
      throw new Error("Function not implemented.");
    },
    has: function (name: string): boolean {
      throw new Error("Function not implemented.");
    },
    set: function (name: string, value: string): void {
      throw new Error("Function not implemented.");
    },
    forEach: function (
      callbackfn: (value: string, key: string, parent: Headers) => void,
      thisArg?: any,
    ): void {
      throw new Error("Function not implemented.");
    },
  } as Response["headers"];
}

function buildResponse(responseHTML: string): Response {
  return {
    body: buildBody(responseHTML),
    headers: buildHeaders(),
    ok: false,
    redirected: false,
    status: 0,
    statusText: "",
    type: "default",
    url: "",
    clone: function (): Response {
      throw new Error("Function not implemented.");
    },
    bodyUsed: false,
    arrayBuffer: function (): Promise<ArrayBuffer> {
      throw new Error("Function not implemented.");
    },
    blob: function (): Promise<Blob> {
      throw new Error("Function not implemented.");
    },
    formData: function (): Promise<FormData> {
      throw new Error("Function not implemented.");
    },
    json: function (): Promise<any> {
      throw new Error("Function not implemented.");
    },
    text: function (): Promise<string> {
      return Promise.resolve(responseHTML);
    },
  };
}

export interface FetchMockData {
  requests: string[];
  responses: string[];
}

export function mockFetch(
  handler: (url: string, init?: RequestInit) => string,
): FetchMockData {
  const mockData: FetchMockData = { requests: [], responses: [] };
  window.TextDecoderStream = TextDecoderStream;
  window.fetch = (url, init?: RequestInit) => {
    if (typeof url !== "string") {
      throw new Error(
        `Unsupported fetch parameter: ${
          typeof url === "object" ? JSON.stringify(url) : url
        }`,
      );
    }
    mockData.requests.push(url);
    const responseHTML = handler(url);
    mockData.responses.push(responseHTML);
    return Promise.resolve(buildResponse(responseHTML));
  };
  return mockData;
}
