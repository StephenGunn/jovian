import adapter from "@sveltejs/adapter-vercel";
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
          "https://vercel.live", // Added Vercel's domain
          "unsafe-inline" // needed for Turnstile
        ],
        "frame-src": [
          "self",
          "https://challenges.cloudflare.com", // needed for Turnstile iframe
          "https://vercel.live"
        ],
        "style-src": [
          "self",
          "unsafe-inline" // needed for Turnstile styles
        ],
        "connect-src": [
          "self",
          "https://public.api.bsky.app", // Allow Bluesky API requests
          "https://stats.craftroulette.live",
          "wss://multiplayer.jovianmoon.io",
          "https://vercel.live"
        ]
      },
      reportOnly: {
        "script-src": [
          "self",
          "https://stats.craftroulette.live",
          "https://challenges.cloudflare.com",
          "https://vercel.live", // Added Vercel's domain
          "unsafe-inline"
        ],
        "frame-src": ["self", "https://challenges.cloudflare.com"],
        "style-src": ["self", "unsafe-inline"],
        "connect-src": [
          "self",
          "https://public.api.bsky.app" // Allow Bluesky API requests
        ],
        "report-uri": ["/"]
      }
    }
  }
};

export default config;
