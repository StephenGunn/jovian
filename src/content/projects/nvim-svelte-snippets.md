---
title: nvim-svelte-snippets
description:
  A collection of useful snippets for Svelte(Kit) development in Neovim using LuaSnip with
  TypeScript support.
date: "2025-03-01"
categories:
  - devtools
  - lua
  - neovim
  - open source
published: true
project_status: "Live"
repo_url: "https://github.com/nvim-svelte/nvim-svelte-snippets"
---

<script lang="ts">
    import MediaPlayer from '$lib/layout/MediaPlayer.svelte';
    import ProjectLinks from '$lib/layout/ProjectLinks.svelte';
</script>

<ProjectLinks repo="https://github.com/nvim-svelte/nvim-svelte-snippets" />

## nvim-svelte-snippets

I created a Neovim plugin for Svelte and SvelteKit snippets since we don't have the same
snippets available in VSCode.

<MediaPlayer video="https://github.com/user-attachments/assets/1e475ee6-d00d-4360-ba2b-3254bd8c1c3b" />

The plugin:

- Detects the correct load function types based on filename (+page.ts vs +page.server.ts)
- Only loads SvelteKit snippets in SvelteKit projects by default
- Includes snippets for Svelte blocks and SvelteKit TypeScript files
- Works with LuaSnip and lazy.nvim

Available snippets include Svelte template blocks (if, each, await), a page template, and
TypeScript helpers for routes, endpoints, and actions.
