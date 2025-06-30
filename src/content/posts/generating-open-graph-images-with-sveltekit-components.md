---
title: Generating Open Graph Images with SvelteKit Components
description:
  Create dynamic Open Graph images using SvelteKit components with
  svelte-component-to-image - now with simplified installation!
date: "2025-06-30"
categories:
  - sveltekit
  - svelte 5
  - open graph
published: true
---

<script lang="ts">
  import Demo from '$lib/components/projects/ImageDemo.svelte';
</script>

## Dynamic Open Graph Images Made Simple

Open Graph images are no longer optional—they're essential. Every modern website needs
them for social sharing on Bluesky, Twitter, LinkedIn, Facebook, and other platforms.
Without proper Open Graph images, your shared links look unprofessional and IMHO less
trustworthy.

But here's the exciting part: Open Graph images are another canvas for expressing yourself
and your art through code.
[Svelte Component To Image](https://github.com/StephenGunn/svelte-component-to-image)
solves the technical complexity by letting you generate beautiful, dynamic Open Graph
images directly from Svelte components. Thanks to recent improvements by
[Paolo Ricciuti](https://ricciuti.me/), installation is now incredibly straightforward!

## Quick Demo

Check out what's possible. The `.png` image below is generated from
[this Svelte Component](https://github.com/StephenGunn/jovian/blob/main/src/lib/to-image/DemoImage.svelte):

<Demo />

> Notice: The stars are randomized on each regeneration!

## Why Use Svelte Components for Images?

Traditional approaches like node-canvas require working with low-level canvas APIs and
often need headless Chrome, which bloats serverless functions. With Svelte Component To
Image, you get:

- **Familiar syntax**: Write normal Svelte components with props, TypeScript, and CSS
- **Lightweight**: No canvas or Puppeteer dependencies
- **Fast**: Optimized for serverless environments
- **Dynamic**: Pass props to the component for variation
- **Flexible**: Works on Vercel, Netlify, and Node.js servers

## Getting Started

### Installation

Thanks to Paolo's improvements, installation is now a single command:

```bash
pnpm add -D svelte-component-to-image
```

### Vite Configuration

Add the included Vite plugin to handle native dependencies automatically:

```typescript:vite.config.ts
import { sveltekit } from "@sveltejs/kit/vite";
import { svelte_component_to_image } from "svelte-component-to-image/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [sveltekit(), svelte_component_to_image()]
});
```

That's it! No complex configurations or external dependencies to manage.

## Creating Your First Open Graph Component

Create a component specifically designed for image generation. The key requirement for
Svelte 5 is including `<svelte:options css="injected" />`:

```svelte:OpenGraphImage.svelte
<svelte:options css="injected" />

<script lang="ts">
  let {
    title,
    description,
    author
  }: {
    title: string;
    description: string;
    author: string;
  } = $props();
</script>

<div class="container">
  <div class="content">
    <h1 class="title">{title}</h1>
    <p class="description">{description}</p>
    <div class="author">By {author}</div>
  </div>
  <div class="brand">YourSite.com</div>
</div>

<style>
  * {
    display: flex; /* Helps satisfy Satori's CSS requirements */
  }

  .container {
    width: 1200px;
    height: 630px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 60px;
    font-family: "Inter", sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .title {
    font-size: 72px;
    font-weight: 800;
    line-height: 1.1;
    margin: 0;
  }

  .description {
    font-size: 32px;
    opacity: 0.9;
    line-height: 1.3;
    margin: 0;
  }

  .author {
    font-size: 28px;
    opacity: 0.8;
  }

  .brand {
    font-size: 24px;
    font-weight: 600;
    opacity: 0.7;
    align-self: flex-end;
  }
</style>
```

## Setting Up the Server Endpoint

Create an API endpoint to serve your generated images:

```typescript:src/routes/api/og.png/+server.ts
import { dev } from "$app/environment";
import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

import { image_from_component, type RenderOptions } from "svelte-component-to-image";
import OpenGraphImage from "$lib/components/OpenGraphImage.svelte";

export const GET: RequestHandler = async ({ url, setHeaders }) => {
  // Extract data from URL parameters
  const title = url.searchParams.get("title") ?? "Default Title";
  const description = url.searchParams.get("description") ?? "Default description";
  const author = url.searchParams.get("author") ?? "Anonymous";

  try {
    const options: RenderOptions = {
      width: 1200,
      height: 630,
      props: {
        title,
        description,
        author
      },
      fonts: [
        {
          name: "Inter",
          url: `${url.origin}/fonts/inter-regular.woff`,
          weight: 400,
          style: "normal"
        },
        {
          name: "Inter",
          url: `${url.origin}/fonts/inter-bold.woff`,
          weight: 800,
          style: "normal"
        }
      ],
      debug: dev // Enable debug logs in development
    };

    const image = await image_from_component(OpenGraphImage, options);

    setHeaders({
      "Content-Type": "image/png",
      "Cache-Control": dev
        ? "no-cache"
        : "s-maxage=31536000, stale-while-revalidate=31536000"
    });

    return new Response(image);
  } catch (e) {
    console.error("Error generating Open Graph image:", e);
    throw error(500, "Failed to generate image");
  }
};
```

## Using Your Open Graph Images

Add the generated image to your page's meta tags:

```svelte:src/routes/blog/[slug]/+page.svelte
<script lang="ts">
  let data = $props()

  let ogImageUrl = $derived(`/api/og?title=${encodeURIComponent(data.post.title)}&description=${encodeURIComponent(data.post.excerpt)}&author=${encodeURIComponent(data.post.author)}`));
</script>

<svelte:head>
  <title>{data.post.title}</title>
  <meta property="og:title" content={data.post.title} />
  <meta property="og:description" content={data.post.excerpt} />
  <meta property="og:image" content={ogImageUrl} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
</svelte:head>
```

## Font Setup

Fonts require a bit of setup, but it's straightforward:

1. **Download fonts**: Get `.woff`, `.ttf`, or `.otf` files (`.woff2` not supported yet)
2. **Place in static folder**: Put fonts in `/static/fonts/`
3. **Reference in options**: Use full URLs like `${url.origin}/fonts/font-name.woff`

For variable fonts or multiple weights, you'll need separate files for each weight/style
combination.
[Font Squirrel's Webfont Generator](https://www.fontsquirrel.com/tools/webfont-generator)
is excellent for converting fonts.

> Not all fonts work out of the box. You might have to run them through Font Squirrel to
> get them to work.

## CSS Guidelines

Since this uses Satori under the hood, you're limited to a subset of CSS. The good news is
it covers most layout needs:

**Supported:**

- Flexbox
- Absolute positioning
- Basic typography
- Linear and radial gradients
- Border radius, shadows
- Transforms (scale, rotate, translate)

**Not supported:**

- CSS Grid
- Most pseudo-elements
- animations (duh)
- Some advanced typography features

Check [Satori's CSS documentation](https://github.com/vercel/satori#css) for the complete
list.

## Loading Data from Your Database

```typescript:+server.ts
const postId = url.searchParams.get("postId");
if (postId) {
  const post = await db.posts.findUnique({ where: { id: postId } });
  options.props = {
    title: post.title,
    description: post.excerpt,
    author: post.author.name,
    publishDate: post.publishedAt
  };
}
```

## Deployment

The package now works seamlessly on:

- ✅ **Vercel** - No special configuration needed
- ✅ **Netlify** - No special configuration needed
- ✅ **Node.js servers** - Works out of the box
- ❌ **Cloudflare Pages** - Not supported (no native module support)

## Performance Tips

svelte-component-to-image is already fast, but you can ensure better performance and less
server-load:

1. **Cache aggressively**: Open Graph images rarely change, so set long cache headers
2. **Optimize fonts**: Only load the weights and styles you actually use
3. **Save images to a CDN**: You can upload your generated images to a CDN after
   generation to prevent redundant generations

## Troubleshooting

**Component not rendering?**

- Ensure `<svelte:options css="injected" />` is at the top
- Check that all CSS properties are supported by Satori
- Add `debug: true` to your `RenderOptions` object to get detailed logs

**Fonts not loading?**

- Verify font URLs are accessible
- Try converting fonts with Font Squirrel
- Check that you're using supported formats (not .woff2)

**Build errors?**

- Make sure you've added the Vite plugin
- Verify you're using the latest version of the package

## What's Next?

This package opens up exciting possibilities for dynamic content generation. Some ideas to
explore:

- User-generated content previews
- Data visualizations as images
- Personalized marketing materials
- Dynamic infographics
- Certificate generation

The combination of Svelte's developer experience with image generation creates powerful
workflows for modern web applications.

## Wrapping Up

Generating Open Graph images with Svelte components is now easier than ever. Thanks to
Paolo's contributions, what used to be a bit tricky to setup now works with a simple
install and one Vite plugin.

The ability to use familiar Svelte syntax, TypeScript, and CSS to create dynamic images
opens up countless possibilities for enhancing your web applications' social presence.

Want to see it in action? Check out the
[minimal reproduction repo](https://github.com/StephenGunn/skcti) for a complete working
example you can deploy immediately.

**Update**: This post replaces my previous article on installation workarounds. If you're
looking for the old deployment configurations, they're no longer needed thanks to Paolo's
improvements!
