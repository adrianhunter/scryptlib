import { defineConfig, Plugin } from "vite";
import pkg from "./package.json" assert { type: "json" };
const externals = Array.from(
  new Set(
    [
      ...Object.keys(pkg.dependencies),
      "shallow-clone",
      "buffer",
      "bsv/ecies",
      "inherits",
      "bs58",
      "clone-deep",
      "base-x",
      "process",
      "kind-of",
      "@discoveryjs/json-ext",
      "chalk",
      // "bsv",
      "path",
      "fs",
      "elliptic",
      "child_process",
      "os",
      "glob",
      "events",
      "url",
      "assert",
      "rimraf",
      "json-bigint",
      "md5",
      "color-name",
      "minimist",
    ],
  ),
);

import fs from "fs/promises";
import path from "path";

function updatePkgJson(): Plugin {
  return {
    "name": "updatePkgJson",
    async "buildEnd"() {
      const files = await fs.readdir("./src");
      const exp: any = {
        ".": {
          "import": `./dist/esm/index.mjs`,
          "require": `./dist/cjs/index.cjs`,
          "types": `./dist/index.d.ts`,
        },
      };
      files.forEach((file) => {
        if (file.endsWith(".ts")) {
          const dir = path.basename(file);
          const rawName = dir.slice(0, dir.length - 3);
          exp[`./${rawName}`] = {
            "import": `./dist/esm/${rawName}.mjs`,
            "require": `./dist/cjs/${rawName}.cjs`,
            "types": `./dist/${rawName}.d.ts`,
          };
        }
      });
      let { default: current } = await import("./package.json", {
        assert: { type: "json" },
      });
      current = JSON.parse(JSON.stringify(current));
      current.exports = exp;

      fs.writeFile("./package.json", JSON.stringify(current, null, 2));
    },
  };
}

export default defineConfig({
  "plugins": [updatePkgJson()],
  "optimizeDeps": {
    "exclude": [...externals],
    "esbuildOptions": {
      "minify": true,
      "minifyIdentifiers": true,
      "minifySyntax": true,
      "minifyWhitespace": true,
      "treeShaking": true,
    },
  },
  "root": "./src/",
  build: {
    rollupOptions: {
      "output": [
        {
          "entryFileNames": (a) => {
            return `${a.name}.cjs`;
          },
          "preserveModulesRoot": "strict",

          "dir": "./dist/cjs",
          "preserveModules": true,
          "esModule": true,
          "format": "cjs",
        },
        {
          "entryFileNames": (a) => {
            return `${a.name}.mjs`;
          },
          "preserveModulesRoot": "strict",

          "dir": "./dist/esm",
          "preserveModules": true,
          "esModule": true,
          "format": "esm",
        },
      ],
      "input": "./src/",
      "preserveEntrySignatures": "exports-only",
      "external": externals,
    },
    "outDir": "./dist",
    "minify": "esbuild",
  },
});
