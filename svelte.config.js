import adapter from "@sveltejs/adapter-vercel";
import markdown from "./src/lib/markdown/index.js";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: [".svelte", ".md"],
  preprocess: [vitePreprocess(), markdown()],
  alias: {
    $components: "./src/lib/components",
    $posts: "./src/content/posts",
    $stores: "./src/lib/stores",
    $styles: "./src/lib/styles"
  },
  kit: {
    adapter: adapter({
      external: ["@resvg/resvg-js"]
    }),
    csp: {
      directives: {
        "script-src": ["self"]
      },
      reportOnly: {
        "script-src": ["self"],
        "report-uri": ["/"]
      }
    }
  }
};

export default config;
