import * as esbuild from "esbuild";
import fs from "fs";
import * as dtsBundler from "dts-bundle-generator";

async function main() {
  const packageJSON = JSON.parse(fs.readFileSync("./package.json", "utf-8"));

  const res = await esbuild.build({
    entryPoints: ["./src/lib/web.ts", "./src/lib/server.ts"],
    bundle: true,
    platform: "node",
    outdir: "./lib/",
    assetNames: "[name]",
    outExtension: { ".js": ".cjs" },
    sourcemap: false,
    target: "node12",
    external: Object.keys(packageJSON.dependencies ?? {}),
  });

  if (res.errors.length || res.warnings.length) {
    console.log([...res.errors, ...res.warnings]);
  }

  const esmResult = await esbuild.build({
    entryPoints: ["./src/lib/web.ts", "./src/lib/server.ts"],
    bundle: true,
    platform: "node",
    format: "esm",
    outdir: "./lib/",
    assetNames: "[name]",
    outExtension: { ".js": ".js" },
    sourcemap: false,
    target: "node12",
    external: Object.keys(packageJSON.dependencies ?? {}),
  });

  if (esmResult.errors.length || esmResult.warnings.length) {
    console.log([...esmResult.errors, ...esmResult.warnings]);
  }

  const dtsconfig = [
    {
      filePath: "src/lib/web.ts",
      output: "lib/web.d.ts",
      allowedTypesLibraries: [
        "node",
        "jest",
        "express",
        "lean-jsx-types/global",
      ],
    },
    {
      filePath: "src/lib/server.ts",
      output: "lib/server.d.ts",
      allowedTypesLibraries: [
        "node",
        "jest",
        "express",
        "lean-jsx-types/global",
      ],
    },
  ];
  const bundle = dtsBundler.generateDtsBundle(dtsconfig, {
    preferredConfigPath: "./tsconfig.json",
  });

  bundle.forEach((code, ind) => {
    console.log(`Saving ${dtsconfig[ind].output}...`);
    fs.writeFile(dtsconfig[ind].output, code, (err) =>
      err ? console.error(err) : "",
    );
  });

  console.log("Build complete");
}

main();
