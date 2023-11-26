import "./app.css";
import App from "./App.svelte";
import { registerSimpleComponent, registerSvelteComponent } from "../lib/web";

// const app = new App({
//   target: document.getElementById("app"),
// });

registerSvelteComponent({
  name: "my-app",
  svelteComponent: App,
  propNames: ["name", "address"],
});

registerSimpleComponent<{
  name: string;
  address: { street: string; zip: string };
}>({
  name: "greeting-card",
  propNames: ["name", "address"],
  render: (root, props) => {
    root.innerHTML = `<div>${props.name}</div>`;
  },
});

interface HeaderMenu {
  name: string;
  address?: {
    street: string;
    zip: string;
  };
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    // we override the IntinsicElements interface to include the web component dynamic-component
    interface IntrinsicElements extends SXL.IntrinsicElements {
      "greeting-card": SXL.IntrinsicDynamicComponent<HeaderMenu>;
    }
  }
}

const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("worker.js", {
        scope: "./",
      });
      if (registration.installing) {
        console.log("Service worker installing");
      } else if (registration.waiting) {
        console.log("Service worker installed");
      } else if (registration.active) {
        console.log("Service worker active");
      }
    } catch (error) {
      if (error) {
        console.error(`Registration failed with ${JSON.stringify(error)}`);
      }
    }
  }
};

void registerServiceWorker();
