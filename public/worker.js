// @ts-check
/// <reference no-default-lib="false"/>
/// <reference lib="ES2015" />
/// <reference lib="webworker" />
(() => {
  /** @type {ServiceWorkerGlobalScope} */
  // @ts-ignore
  const self = globalThis.self;

  self.addEventListener("install", (event) => {
    console.log("WORKER: install event in progress.");
    self.skipWaiting();
  });

  self.addEventListener("activate", (event) => {
    console.log("WORKER: activate event in progress.");
  });

  self.addEventListener("fetch", (event) => {
    console.log("WORKER: Fetching", event.request);
    //   event.respondWith("hello");
    console.log(event.request.method);
    if (event.request.method === "POST") {
      console.log("Intercepted");

      event.respondWith(
        new Response("<h1>Hello!</h1>", {
          headers: { "Content-Type": "text/html" },
        }),
      );
    }
  });
})();
