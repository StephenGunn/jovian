<script lang="ts">
  import { browser } from "$app/environment";
  import { enhance } from "$app/forms";
  import { page } from "$app/stores";
  import type { Themes } from "$lib/types/schema";
  import type { SubmitFunction } from "@sveltejs/kit";

  let theme: { theme: Themes } = $state({ theme: $page.data.theme });
  $inspect(theme);

  const setTheme = async (theme: Themes) => {
    document.documentElement.setAttribute("data-theme", theme);
  };

  const toggleTheme = () => {
    if (theme.theme === "dark") {
      theme.theme = "light";
      setTheme("light");
    } else {
      theme.theme = "dark";
      setTheme("dark");
    }
    return theme.theme;
  };

  const handleSubmit: SubmitFunction = async () => {
    toggleTheme();
    setTheme(theme.theme);
  };

  if (browser && $page.data.theme === "system") {
    const dark_mode_query = window.matchMedia("(prefers-color-scheme: dark)");

    if (dark_mode_query.matches) {
      theme.theme = "dark";
    } else {
      theme.theme = "light";
    }

    dark_mode_query.addEventListener("change", (event) => {
      if (event.matches) {
        theme.theme = "dark";
      } else {
        theme.theme = "light";
      }
    });
  }
</script>

<form method="POST" use:enhance={handleSubmit}>
  <button
    formaction="/?/setTheme&theme={theme.theme === 'light'
      ? 'dark'
      : 'light'}&redirect={$page.url.pathname}"
    class="theme-toggle"
    class:theme-toggle--toggled={theme.theme === "light"}
    title="Toggle theme"
    aria-label="Toggle theme"
    tabindex="0"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      class="theme-toggle__within"
      height="1.25rem"
      width="1.25rem"
      viewBox="0 0 32 32"
      fill="currentColor"
    >
      <clipPath id="theme-toggle__within__clip">
        <path d="M0 0h32v32h-32ZM6 16A1 1 0 0026 16 1 1 0 006 16" />
      </clipPath>
      <g clip-path="url(#theme-toggle__within__clip)">
        <path
          d="M30.7 21.3 27.1 16l3.7-5.3c.4-.5.1-1.3-.6-1.4l-6.3-1.1-1.1-6.3c-.1-.6-.8-.9-1.4-.6L16 5l-5.4-3.7c-.5-.4-1.3-.1-1.4.6l-1 6.3-6.4 1.1c-.6.1-.9.9-.6 1.3L4.9 16l-3.7 5.3c-.4.5-.1 1.3.6 1.4l6.3 1.1 1.1 6.3c.1.6.8.9 1.4.6l5.3-3.7 5.3 3.7c.5.4 1.3.1 1.4-.6l1.1-6.3 6.3-1.1c.8-.1 1.1-.8.7-1.4zM16 25.1c-5.1 0-9.1-4.1-9.1-9.1 0-5.1 4.1-9.1 9.1-9.1s9.1 4.1 9.1 9.1c0 5.1-4 9.1-9.1 9.1z"
        />
      </g>
      <path
        class="theme-toggle__within__circle"
        d="M16 7.7c-4.6 0-8.2 3.7-8.2 8.2s3.6 8.4 8.2 8.4 8.2-3.7 8.2-8.2-3.6-8.4-8.2-8.4zm0 14.4c-3.4 0-6.1-2.9-6.1-6.2s2.7-6.1 6.1-6.1c3.4 0 6.1 2.9 6.1 6.2s-2.7 6.1-6.1 6.1z"
      />
      <path
        class="theme-toggle__within__inner"
        d="M16 9.5c-3.6 0-6.4 2.9-6.4 6.4s2.8 6.5 6.4 6.5 6.4-2.9 6.4-6.4-2.8-6.5-6.4-6.5z"
      />
    </svg>
  </button>
</form>

<style>
  button {
    margin: 0;
    color: var(--primary);
  }
  svg {
    will-change: transform;
    shape-rendering: geometricPrecision;
    image-rendering: optimizeSpeed;
    min-width: 1.25rem;
    min-height: 1.25rem;
  }
  .theme-toggle {
    --theme-toggle__within--duration: 500ms;
  }
  .theme-toggle__within * {
    transform-origin: center;
    will-change: transform;
    transition: transform calc(var(--theme-toggle__within--duration))
      cubic-bezier(0.25, 0.1, 0.25, 1);
  }
  .theme-toggle.theme-toggle--toggled:not(label)
    .theme-toggle__within
    .theme-toggle__within__circle {
    transform: scale(1.5);
  }

  .theme-toggle--toggled.theme-toggle .theme-toggle__within .theme-toggle__within__inner {
    transform: translate3d(3px, -3px, 0) scale(1.2);
  }
  .theme-toggle--toggled:not(label).theme-toggle .theme-toggle__within g path {
    transform: scale(0.65);
  }
  .theme-toggle {
    border: none;
    background: 0 0;
    cursor: pointer;
  }
  @media (prefers-reduced-motion: reduce) {
    .theme-toggle:not(.theme-toggle--force-motion) * {
      transition: none !important;
    }
  }
</style>
