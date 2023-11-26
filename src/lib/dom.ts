
/**
 * Observe the document for a DOM element to be created.
 * @param selector - the query selector for the element to wait for.
 * @returns a promise containing the element.
 */
export function waitForElement(selector: string): Promise<Element> {
    let resolved = false;
    let observer: MutationObserver | null = null;
    const TIMEOUT = 5000;
    return new Promise((resolve, reject) => {
        const element = document.querySelector(selector)
      if (element) {
        return resolve(element);
      }
  
      // add a timeout to clean the observer in case
      // the element is never added to the document
      const timeout = setTimeout(() => {
        if (resolved === false && observer) {
          observer?.disconnect();
          reject()
        }
      }, TIMEOUT);
  
      observer = new MutationObserver((_) => {
        if (document.querySelector(selector)) {
          observer?.disconnect();
          clearTimeout(timeout);
          resolved = true;
          const resolvedElement = document.querySelector(selector)
          if (!resolvedElement) {
            reject();
            return;
          }
          resolve(resolvedElement);
        }
      });
  
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    });
  }
  
  /**
   * Helper function to add event listeners to elements.
   * If the element does not exist, it observes the document and sets the
   * event listener once the element is added.
   * @param querySelector
   * @param event
   * @param handler
   */
  export function addEventListener(
    querySelector: string,
    event: string,
    handler: () => unknown,
  ) {
    const element = document.querySelector(querySelector);
    if (!element) {
      void waitForElement(querySelector).then((elm) => {
        elm.addEventListener(event, handler);
      }).catch(() => {
        console.warn(
            `Tried to attach ${event} event to element "${querySelector}", but the element does not exist or took too long to be rendered.`,
          );
      });
    } else {
      element.addEventListener(event, handler);
    }
  }
  