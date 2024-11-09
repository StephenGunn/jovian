---
title: Svelte Component To Image
description:
  A project that converts a Svelte component to an image using Satori and Resvg.
date: "2024-11-01"
categories:
  - sveltekit
  - typescript
  - npm package
  - open source
published: true
project_status: "Live"
repo_url: "https://github.com/StephenGunn/svelte-component-to-image"
---

<script lang="ts">
  import Demo from '$lib/components/projects/ImageDemo.svelte';
</script>

## Svelte Component To Image

A package for easily rendering .png images from svelte components in SvelteKit. Inspired
by Vercel's
[`OG Image Generation`](https://vercel.com/docs/concepts/functions/edge-functions/og-image-generation)
tool.

Good for rendering dynamic Open Graph images quickly and effeciently without having to use
canvas.

I had been using node-canvas to render social share images but hated working with it's
API. When I saw Vercel's OG Image Generation tool I knew I had to make a similar tool for
SvelteKit.

## Features

- Renders a normal svelte component as a png
- Component props are supported for dynamic image generation
- Use basic CSS like flexbox and absolute positioning
  ([See valid CSS](https://github.com/vercel/satori#css))
- Lightweight and fast (doesn't use canvas or puppeteer)
- Load custom fonts: tff, otf, woff accepted (woff2 not accepted currently)

## Demo

Check it out in action.

<Demo />
