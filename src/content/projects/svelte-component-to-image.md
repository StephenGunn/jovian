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
  import ProjectLinks from '$lib/layout/ProjectLinks.svelte';
</script>

<ProjectLinks repo="https://github.com/StephenGunn/svelte-component-to-image" />

## Svelte Component To Image

A package for easily rendering .png images from svelte components in SvelteKit. Inspired
by Vercel's
[`OG Image Generation`](https://vercel.com/docs/concepts/functions/edge-functions/og-image-generation)
tool for NextJs.

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

Check it out in action. The image below is generated from
[this Svelte Component](https://github.com/StephenGunn/jovian/blob/main/src/lib/to-image/DemoImage.svelte).

<Demo />

## Usage

Please check out the [ NPM package ](https://www.npmjs.com/svelte-component-to-image) or
the [ Github Repo ](https://github.com/StephenGunn/svelte-component-to-image) for more
information on how to use it in your project.

Make sure to read the documentation, there are some quirks about what markup and CSS
[Satori](https://github.com/vercel/satori) supports.

## Troubleshooting

If you have any issues please raise them on the Github Repo and I will get back to you as
quickly as I can.
