import adapter from "@sveltejs/adapter-node";
import markdown from "./src/lib/markdown/index.js";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: [".svelte", ".md"],
  preprocess: [vitePreprocess(), markdown()],
  alias: {
    $components: "src/lib/components",
    $posts: "src/content/posts",
    $stores: "src/lib/stores",
    $styles: "src/lib/styles"
  },
  kit: {
    adapter: adapter(),
    csp: {
      mode: "auto",
      directives: {
        "script-src": [
          "self",
          "https://stats.craftroulette.live",
          "https://challenges.cloudflare.com",
          "https://static.cloudflareinsights.com",
          "unsafe-inline" // needed for Turnstile
        ],
        "object-src": ["none"],
        "base-uri": ["self"],
        "frame-ancestors": ["none"],
        "frame-src": [
          "self",
          "https://challenges.cloudflare.com" // needed for Turnstile iframe
        ],
        "style-src": [
          "self",
          "unsafe-inline" // needed for Turnstile styles
        ],
        "connect-src": [
          "self",
          "https://public.api.bsky.app", // Allow Bluesky API requests
          "https://stats.craftroulette.live",
          "https://static.cloudflareinsights.com",
          "https://cloudflareinsights.com",
          "wss://multiplayer.jovianmoon.io"
        ]
      },
      reportOnly: {
        "script-src": [
          "self",
          "https://stats.craftroulette.live",
          "https://challenges.cloudflare.com",
          "https://static.cloudflareinsights.com",
          "unsafe-inline"
        ],
        "frame-src": ["self", "https://challenges.cloudflare.com"],
        "style-src": ["self", "unsafe-inline"],
        "connect-src": [
          "self",
          "https://stats.craftroulette.live",
          "https://public.api.bsky.app", // Allow Bluesky API requests
          "https://static.cloudflareinsights.com",
          "https://cloudflareinsights.com",
          "wss://multiplayer.jovianmoon.io"
        ],
        "report-uri": ["/__csp-report"]
      }
    }
  }
};

export default config;
