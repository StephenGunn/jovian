import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vitest/config";
import { svelte_component_to_image } from "svelte-component-to-image/vite";

export default defineConfig({
  plugins: [sveltekit(), svelte_component_to_image()],
  optimizeDeps: {
    exclude: ["phosphor-svelte"]
  },
  server: {
    port: 42069
  },
  test: {
    include: ["src/**/*.{test,spec}.{js,ts}"]
  }
});
