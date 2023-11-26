import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { dts } from "rollup-plugin-dts";
import alias from "rollup-plugin-alias";
import analyze from "rollup-plugin-analyzer";

/**
 * NodeJS, server-side dependencies:
 */
const cjsInput = {
  web: "src/lib/web.ts",
  server: "src/lib/server.ts",
};

const esInput = {
  web: "src/lib/web.ts",
  server: "src/lib/server.ts",
};

/**
 * Browser-side dependencies
 */
const iifeInput = {
  web: "src/lib/web.ts",
};

/**
 * External dependencies:
 */
const external = [
  "lean-jsx/lib/web/sxl.js",
  "body-parser",
  "pino",
  "raw-body",
  "express",
  "compression",
  "stream",
];

/**
 * Alias (as configured in tsconfig.json)
 */
const aliasConfig = alias({
  "@/": ["./src/"],
  "@/*": ["./src/*"],
});

const tsConfig = {
  exclude: ["tests/**"],
  noEmit: true,
  tsconfig: "./tsconfig.json",
  sourceMap: true,
};

export default [
  {
    input: cjsInput,
    output: {
      dir: "lib",
      format: "cjs",
      entryFileNames: "[name].js",
      sourcemap: true,
    },
    plugins: [
      typescript(tsConfig),
      nodeResolve({ preferBuiltins: true }),
      commonjs(),
      json(),
      aliasConfig,
      analyze(),
    ],
    external,
  },
  {
    input: esInput,
    output: {
      dir: "lib",
      format: "es",
      entryFileNames: "[name].mjs",
      sourcemap: true,
    },
    plugins: [
      typescript(tsConfig),
      nodeResolve({ preferBuiltins: true }),
      commonjs(),
      json(),
      aliasConfig,
      analyze(),
    ],
    external,
  },
  // Generate .d.ts files:
  {
    input: cjsInput,
    output: {
      dir: "lib",
      format: "es",
      entryFileNames: "[name].d.ts",
      sourcemap: true,
    },
    plugins: [typescript(tsConfig), dts(), analyze()],
    external,
  },
  {
    input: iifeInput,
    output: {
      dir: "lib",
      format: "iife",
      entryFileNames: "[name].js",
      name: "sxl",
      sourcemap: true,
    },
    plugins: [
      typescript(tsConfig),
      nodeResolve({ preferBuiltins: true }),
      commonjs(),
      json(),
      aliasConfig,
      analyze(),
    ],
    external,
  },
];
