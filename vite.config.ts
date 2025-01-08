import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vitest/config";
import { sveltePhosphorOptimize } from "phosphor-svelte/vite";

export default defineConfig({
  plugins: [sveltePhosphorOptimize(), sveltekit()],
  server: {
    port: 42069
  },
  build: {
    rollupOptions: {
      external: ["@resvg/resvg-js"]
    }
  },
  test: {
    include: ["src/**/*.{test,spec}.{js,ts}"]
  }
});
