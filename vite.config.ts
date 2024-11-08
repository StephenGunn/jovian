import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    port: 42069
  },
  optimizeDeps: {
    exclude: ["@resvg/resvg-js"]
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
