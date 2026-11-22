import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const layers = [
  "app",
  "views",
  "widgets",
  "features",
  "entities",
  "shared",
  "server",
];

export default defineConfig({
  resolve: {
    alias: Object.fromEntries(
      layers.map((layer) => [
        `@${layer}`,
        fileURLToPath(new URL(`./src/${layer}`, import.meta.url)),
      ]),
    ),
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
