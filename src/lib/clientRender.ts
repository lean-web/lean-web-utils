/// <reference types="lean-jsx-types/global" />
/// <reference lib="dom" />

import { isFunctionNode, isStaticNode } from "./jsx_parse_utils";

type TagChildren = string | HTMLElement | (HTMLElement | Node)[];

export function tagP<T extends keyof JSX.IntrinsicElements>(
    type: T,
    props: JSX.IntrinsicElements[T],
    children?: TagChildren,
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
    children?: TagChildren,
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
): Node | null {
    if (
        typeof element === "string" ||
        typeof element === "number" ||
        typeof element === "boolean"
    ) {
        return document.createTextNode(`${element}`);
    }

    const { children: _, ...props } = element.props;
    const children = element.children;
    if (typeof element.type === "string") {
        return tagP(
            element.type as keyof SXL.IntrinsicElements,
            props,
            children
                ?.map((child) => {
                    if (Array.isArray(child)) {
                        return tag(
                            "div",
                            child
                                .map((c) => clientRender(c))
                                .map((el) => el as Node)
                                .filter((el) => !!el),
                        );
                    } else {
                        return clientRender(child);
                    }
                })
                .filter((el) => !!el)
                .map((el) => el as Node),
        );
    } else if (isFunctionNode(element)) {
        const child = element.type(element.props);

        if (isStaticNode(child) || isFunctionNode(child)) {
            return clientRender(child);
        }
    }
    return null;
}
