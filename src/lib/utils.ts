/**
 * Asserts that an HTML node is an HTML Element
 * @param node
 * @returns
 */
export function isElement(node: Node): node is Element {
  return "tagName" in node;
}

/**
 * Given an HTML string, replace the content of an element.
 *
 * @param data - the HTML string
 * @param domParser - An instance of DOMParser to use for parsing data
 * @param element - the element we will replace
 * @param onlyReplaceContent - if true, only the element's children will be replaced. If false, the whole element will be replaced.
 */
export function updateFromString(
  data: string,
  domParser: DOMParser,
  element: Element,
  onlyReplaceContent: boolean,
) {
  const responseDOM = domParser.parseFromString(data, "text/html");

  // TODO: validate data to be valid HTML
  const errorNode = responseDOM.querySelector("parsererror");
  if (errorNode) {
    throw errorNode;
  }
  const fragment = responseDOM.createDocumentFragment();

  Array.from(responseDOM.body.childNodes).forEach((child) => {
    if (isElement(child) && child.tagName !== "SCRIPT") {
      fragment.appendChild(child);
    }
  });

  for (const child of Array.from(responseDOM.body.querySelectorAll("script"))) {
    if (child.tagName === "SCRIPT") {
      const scriptElement = document.createElement("script");
      scriptElement.type = "application/javascript";
      scriptElement.textContent = child.textContent;
      const actionScriptId = child.getAttribute("data-action-script");
      if (actionScriptId) {
        scriptElement.setAttribute("data-action-script", actionScriptId);
      }
      fragment.appendChild(scriptElement);
    }
  }

  if (onlyReplaceContent) {
    element.replaceChildren(fragment);
  } else {
    element.replaceWith(fragment);
  }
}
