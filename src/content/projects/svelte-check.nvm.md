---
title: Svelte-Check.nvim
description:
  A Neovim plugin that integrates Svelte-Check into the editor and populates the quickfix
  list with it's results.
date: "2024-11-01"
categories:
  - devtools
  - lua
  - neovim
  - open source
published: true
project_status: "Live"
repo_url: "https://github.com/StephenGunn/sveltecheck.nvim"
---

<script lang="ts">
    import MediaPlayer from '$lib/layout/MediaPlayer.svelte';
    import ProjectLinks from '$lib/layout/ProjectLinks.svelte';
</script>

<ProjectLinks repo="https://github.com/StephenGunn/sveltecheck.nvim" />

## Svelte-Check.nvim

A Neovim plugin that runs `svelte-check` asynchronously, displays a spinner while running,
and populates the quickfix list with the results.

I use this tool to quickly check my SvelteKit projects for errors and warnings. I use it
many times a day when developing SvelteKit projects.

<MediaPlayer video="https://github.com/StephenGunn/sveltecheck.nvim/assets/7240548/99c3549e-2c54-4c1a-ab70-16d463e3e4ad" />

Inspired by [dmmulroy/tsc.nvim](https://github.com/dmmulroy/tsc.nvim)

## How to use

There are instructions in the [ README ](https://github.com/StephenGunn/sveltecheck.nvim)
on the GitHub repository. Please let me know if you if you have any issues.
