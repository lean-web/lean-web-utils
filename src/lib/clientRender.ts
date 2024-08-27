/// <reference types="lean-jsx-types/global" />
/// <reference lib="dom" />

import { isFunctionNode, isStaticNode } from "./jsx_parse_utils";

export function tagP<T extends keyof JSX.IntrinsicElements>(
    type: T,
    props: JSX.IntrinsicElements[T],
    children?: string | HTMLElement | HTMLElement[],
): HTMLElement {
    const element = tag(type, children);
    Object.entries(props).forEach(([k, v]) => {
        if (k === "dataset") {
            Object.entries(v).forEach(([dk, dv]) => {
                element.dataset[dk] = dv as string;
            });
        } else {
            element[k] = v;
        }
    });
    return element;
}

export function tag<T extends keyof JSX.IntrinsicElements>(
    type: T,
    children?: string | HTMLElement | HTMLElement[],
): HTMLElement {
    const element = document.createElement(type);
    if (Array.isArray(children)) {
        children.forEach((child) => element.appendChild(child));
    } else if (children) {
        if (typeof children === "string") {
            element.textContent = children;
        } else {
            element.appendChild(children);
        }
    }
    return element;
}

/**
 * Render lean-jsx parsed JSX into an HTMLElement.
 *
 * Note: Only non-async elements are currently supported.
 *
 * @param element the JSX to parse
 * @returns and HTML element
 */
export function clientRender(
    element: string | number | boolean | SXL.StaticElement,
) {
    // TODO: Write tests
    if (
        typeof element === "string" ||
        typeof element === "number" ||
        typeof element === "boolean"
    ) {
        return `${element}`;
    }
    if (typeof element === "number") {
        return element;
    }

    const { children, ...props } = element.props;
    if (typeof element.type === "string") {
        return tagP(
            element.type as keyof SXL.IntrinsicElements,
            props,
            children?.map((child) => {
                if (Array.isArray(child)) {
                    return tag(
                        "div",
                        child.map((c) => clientRender(c)),
                    );
                } else {
                    return clientRender(child);
                }
            }),
        );
    } else if (isFunctionNode(element)) {
        const child = element.type(element.props);

        if (isStaticNode(child) || isFunctionNode(child)) {
            return clientRender(child);
        }
    }
}
