---
title: "SSR Theme Switching Without Flash in SvelteKit"
description:
  "How to implement theme switching that avoids flash when users prefer the opposite of
  their system theme"
date: "2025-9-13"
categories:
  - sveltekit
  - ssr
  - "dark light mode"
published: true
---

This is a response to
[a Reddit thread](https://www.reddit.com/r/sveltejs/comments/1nfttkz/how_to_implement_lightdark_theme_the_svelte_way/)
where u/xGanbattex asked about my SSR-based theme implementation.

I also implemented this approach on a
[ SvelteLab project ](https://www.sveltelab.dev/x2pg1m16pa3o39x) if you want to check it
out in action.

## Why SSR is needed

If someone has their system set to dark mode but prefers light mode on your site (saved in
localStorage), they'll see a flash on every page load. The browser initially renders with
the system preference, then JavaScript kicks in, reads localStorage, and switches themes.
Even if it's milliseconds, it's noticeable.

The only way to completely avoid this is to know their preference server-side and inject
it before the HTML reaches the browser.

## Implementation

> note: I've only included the bare-bones to get this working...

### Server action for the cookie

```typescript
// +page.server.ts
export const actions = {
  setTheme: async ({ url, cookies }) => {
    const theme = url.searchParams.get("theme");
    const redirectTo = url.searchParams.get("redirect");

    cookies.set("theme", theme, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      httpOnly: true,
      secure: true,
      sameSite: "lax"
    });

    redirect(303, redirectTo || "/");
  }
};
```

### The key part - hooks.server.ts

This injects the theme into the HTML before the browser parses it:

```typescript
// hooks.server.ts
export const handle: Handle = async ({ event, resolve }) => {
  const theme = event.cookies.get("theme") || "system";
  event.locals.theme = theme;

  return resolve(event, {
    transformPageChunk: ({ html }) => {
      return html.replace('data-theme=""', `data-theme="${theme}"`);
    }
  });
};
```

### HTML template

```html
<!-- app.html -->
<html lang="en" data-theme=""></html>
```

### CSS with system detection

```css
/* Default to light theme */
:root {
  --bg: white;
  --font-color: black;
}

/* System dark mode (when data-theme is not set or is 'system') */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg: black;
    --font-color: white;
  }
}

/* Explicit theme overrides */
:root[data-theme="light"] {
  --bg: white;
  --font-color: black;
}

:root[data-theme="dark"] {
  --bg: black;
  --font-color: white;
}
```

### Toggle component with enhanced form (Svelte 5)

The key here is using SvelteKit's `enhance` to avoid full page reload:

```svelte
<script lang="ts">
  import { enhance } from "$app/forms";
  import { page } from "$app/state";

  let { theme }: { theme: "light" | "dark" | "system" } = $props();

  let newTheme = $derived(theme === "light" ? "dark" : "light");
</script>

<form
  method="POST"
  action="/?/setTheme&theme={newTheme}&redirect={page.url.pathname}"
  use:enhance={() => {
    // Optimistically update the theme
    document.documentElement.setAttribute("data-theme", newTheme);

    return async ({ update }) => {
      // Apply the form response
      await update({ reset: false });
    };
  }}
>
  <button type="submit" aria-label="Toggle theme">
    {theme === "light" ? "🌙" : "☀️"}
  </button>
</form>
```

The `enhance` function does two important things:

1. Immediately updates the theme attribute for instant feedback
2. Prevents the page refresh while still setting the cookie server-side

## How it all works together

1. User clicks toggle → form submits with `enhance`
2. Theme updates instantly on client (no refresh)
3. Server action sets cookie for persistence
4. Next page load reads cookie in `hooks.server.ts`
5. Theme is injected into HTML before browser renders
6. Zero flash, even when preference differs from system

This approach gives you the best of both worlds: instant client-side updates and
zero-flash SSR. The theme preference persists across sessions and works even with
JavaScript disabled (though without the instant update).

Hope this helps! Let me know if you need any clarification on the implementation.
