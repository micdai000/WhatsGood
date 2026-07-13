import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "node",
      include: ["src/**/*.test.ts"],
      coverage: {
        provider: "v8",
        reporter: ["text", "html"],
        include: ["src/lib/**/*.ts", "src/services/**/*.ts"],
        exclude: ["**/*.test.ts"],
      },
    },
  }),
);
