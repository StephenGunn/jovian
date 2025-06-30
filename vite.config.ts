import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vitest/config";
import { sveltePhosphorOptimize } from "phosphor-svelte/vite";
import { svelte_component_to_image } from "svelte-component-to-image/vite";

export default defineConfig({
  plugins: [sveltePhosphorOptimize() as any, sveltekit(), svelte_component_to_image()],
  server: {
    port: 42069
  },
  test: {
    include: ["src/**/*.{test,spec}.{js,ts}"]
  }
});
