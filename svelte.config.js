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
      mode: "auto",
      directives: {
        "script-src": [
          "self",
          "https://stats.craftroulette.live",
          "https://challenges.cloudflare.com",
          "unsafe-inline" // needed for Turnstile
        ],
        "frame-src": [
          "self",
          "https://challenges.cloudflare.com" // needed for Turnstile iframe
        ],
        "style-src": [
          "self",
          "unsafe-inline" // needed for Turnstile styles
        ]
      },
      reportOnly: {
        "script-src": [
          "self",
          "https://stats.craftroulette.live",
          "https://challenges.cloudflare.com",
          "unsafe-inline"
        ],
        "frame-src": ["self", "https://challenges.cloudflare.com"],
        "style-src": ["self", "unsafe-inline"],
        "report-uri": ["/"]
      }
    }
  }
};

export default config;
