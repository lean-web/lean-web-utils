interface CustomEventMap {
    lean: CustomEvent<
        {
            id: string;
            queryParams: Record<string, string | number | boolean>;
        } & Record<string, string | number | boolean>
    >;
    refetch: CustomEvent<unknown>;
}

export function registerSimpleComponent<T extends Record<string, unknown>>({
    name,
    propNames,
    render,
}: {
    name: string;
    propNames: Array<keyof T>;
    render: (element: ShadowRoot, attributes: T) => void;
}) {
    customElements.define(
        name,
        class extends HTMLElement {
            domParser: DOMParser;
            _propNames: Array<keyof T>;
            root: ShadowRoot;

            static get observedAttributes() {
                return propNames;
            }

            getAttributes(): T {
                return Object.fromEntries(
                    propNames
                        .filter(
                            (name): name is string => typeof name === "string",
                        )
                        .map((name) => {
                            const value = this.getAttribute(name);
                            if (!value) {
                                return [name, undefined];
                            }
                            try {
                                const attribute = JSON.parse(
                                    value.replace(/'/g, '"'),
                                ) as object;
                                return [name, attribute];
                            } catch (_err) {
                                return [name, value];
                            }
                        }),
                ) as T;
            }

            updateWithString(data: string) {
                const responseDOM = this.domParser.parseFromString(
                    data,
                    "text/html",
                );
                const fragment = responseDOM.createDocumentFragment();

                Array.from(responseDOM.body.childNodes).forEach((child) => {
                    if ((child as Element).tagName === "SCRIPT") {
                        const scriptElement = document.createElement("script");
                        scriptElement.type = "application/javascript";
                        scriptElement.textContent = child.textContent;
                        fragment.appendChild(scriptElement);
                    } else {
                        fragment.appendChild(child);
                    }
                });

                this.replaceChildren(...Array.from(fragment.childNodes));
            }

            constructor() {
                super();
                this.domParser = new DOMParser();
                // Create the shadow root.
                this.root = this.attachShadow({ mode: "open" });
                this._propNames = propNames;
                render(this.root, this.getAttributes());
            }

            attributeChangedCallback(
                name: string,
                oldValue: string,
                newValue: string,
            ) {
                if (name !== "id" && oldValue !== newValue) {
                    render(this.root, this.getAttributes());
                }
            }
        },
    );
}

export function registerJSComponent<T extends Record<string, unknown>>({
    name,
    propNames,
    render,
}: {
    name: string;
    propNames: Array<keyof T>;
    render: (element: ShadowRoot, attributes: T) => void;
}) {
    customElements.define(
        name,
        class extends HTMLElement {
            domParser: DOMParser;
            _propNames: Array<keyof T>;
            root: ShadowRoot;

            static get observedAttributes() {
                return propNames;
            }

            getAttributes(): T {
                return Object.fromEntries(
                    propNames
                        .filter(
                            (name): name is string => typeof name === "string",
                        )
                        .map((name) => {
                            const value = this.getAttribute(name);
                            if (!value) {
                                return [name, undefined];
                            }
                            try {
                                const attribute = JSON.parse(
                                    value.replace(/'/g, '"'),
                                ) as object;
                                return [name, attribute];
                            } catch (_err) {
                                return [name, value];
                            }
                        }),
                ) as T;
            }

            updateWithString(data: string) {
                const responseDOM = this.domParser.parseFromString(
                    data,
                    "text/html",
                );
                const fragment = responseDOM.createDocumentFragment();

                Array.from(responseDOM.body.childNodes).forEach((child) => {
                    if ((child as Element).tagName === "SCRIPT") {
                        const scriptElement = document.createElement("script");
                        scriptElement.type = "application/javascript";
                        scriptElement.textContent = child.textContent;
                        fragment.appendChild(scriptElement);
                    } else {
                        fragment.appendChild(child);
                    }
                });

                this.replaceChildren(...Array.from(fragment.childNodes));
            }

            constructor() {
                super();
                this.domParser = new DOMParser();
                // Create the shadow root.
                this.root = this.attachShadow({ mode: "open" });
                this._propNames = propNames;
                render(this.root, this.getAttributes());
            }

            attributeChangedCallback(
                name: string,
                oldValue: string,
                newValue: string,
            ) {
                if (name !== "id" && oldValue !== newValue) {
                    render(this.root, this.getAttributes());
                }
            }
        },
    );
}
