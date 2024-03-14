/// <reference types="svelte" />
/// <reference types="vite/client" />

/// <reference types="lean-jsx-types/global" />
/// <reference lib="dom" />

/**
 * Add TypeScript support for custom imported types.
 */
declare module "*.svelte" {
    const content: SvelteComponent;
    export default content;
}
