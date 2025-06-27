---
title: Installing and using Svelte Component To Image with Svelte 5
description:
  Generate dynamic raster images on the fly for Open Graph, Email Marketing, or anything
  else.
date: "2025-06-27"
categories:
  - sveltekit
  - svelte 5
published: true
bluesky_thread_id: 3lsmdcgrhb22e
---

<script lang="ts">
  import Demo from '$lib/components/projects/ImageDemo.svelte';
</script>

## What is Svelte Component To Image?

[Svelte Component To Image](https://github.com/StephenGunn/svelte-component-to-image) is a
tool I wrote to generate raster images directly from [Svelte](https://svelte.dev)
components on the fly. It was inspired by Vercel's
[OG Image Generation](https://vercel.com/docs/concepts/functions/edge-functions/og-image-generation)
tool for NextJs.

I had been using node-canvas to render Open Graph images but I'm not a fan of working with
the raw canvas api and the headless chrome browser required to use canvas on the server
would baloon the serverless functions way over the limit for most serverless platforms.

When I saw Vercel's OG Image Generation tool I knew I had to make a similar tool for
SvelteKit.

## Why am I writing this blog post?

There are some tricks to getting this package to work in a live environment. If you're not
used to dealing with errors that only show up when you try and publish a project with this
package to a platform like Vercel. I needed to update the documentation to include these
tricks, so I thought I might as well get a blog post out of it.

## Quick Demo

Check it out in action. The `.png` image below is generated from
[this Svelte Component](https://github.com/StephenGunn/jovian/blob/main/src/lib/to-image/DemoImage.svelte).

<Demo />

> Notice: The stars are randomized on each regeneration!

## Core Features

If you're still not sold, here are some of the features:

- Works on Svelte 4 (version 0._) or Svelte 5 (version 1._)
- Renders a normal svelte component as a png
- Component props are supported for dynamic image generation
- Use basic CSS like flexbox and absolute positioning
  ([See valid CSS](https://github.com/vercel/satori#css))
- Lightweight and fast (doesn't use canvas or puppeteer)
- Load custom fonts: tff, otf, woff accepted (woff2 not accepted currently)

## Seems great! What's the catch?

There are a few catches that you might not expect. First, it won't work on Cloudflare.
Satori ships with a Rust binary and node-bindings. There is a WASM version that might work
but I haven't worked it into the package yet.

Also, you're restricted to a subset of CSS that is specific to Satori. You can
([see the valid CSS here.](https://github.com/vercel/satori#css))

ReSVG also ships with platform specific C++ binaries that need some special configuration
to deploy correctly to serverless platforms.

Lastly, there are some tricks to getting it to work. I am going to walk through the steps
of setting it up and getting a basic Open Graph social share image working.

## Starting From Scratch

I am going to cover the very basics of creating a SvelteKit project via the command line.
Skip ahead if you're experienced. Let's initiate a blank [Svelte Kit](https://svelte.dev)
project using the `npx sv` command. Navigate to the directory where you want to create
your project and run:

```
npx sv create project-name
```

And I used these basic settings:

```
◇  Which template would you like?
│  SvelteKit minimal

◇  Add type checking with TypeScript?
│  Yes, using TypeScript syntax

◇  What would you like to add to your project? (use arrow keys / space bar)
│  prettier, eslint

◇  Which package manager do you want to install dependencies with?
│  pnpm
```

This will give us a blank slate SvelteKit project.

### Installing svelte-component-to-image

I use pnpm to manage my node packages, so to install I will use the command:

```
pnpm add -D svelte-component-to-image
```

## Setting up a server endpoint

We need to setup a standard SvelteKit `GET` endpoint that will serve the image data. We
will request an image from this endpoint, so we can place this file at
`/src/routes/api/images` - I have added comments to explain each part.

```typescript
// SvelteKit Stuff
import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

// Svelte Component To Image
import { image_from_component, type RenderOptions } from "svelte-component-to-image";

// Import the .svelte component that will generate our image from
import OpenGraphImage from "$lib/to-image/OpenGraphImage.svelte";
import { dev } from "$app/environment";

export const GET: RequestHandler = (async ({ url, setHeaders }) => {
  // We need to generate a props object to pass to our component
  const props = {
    title: url.searchParams.get("title") ?? "",
    link: url.searchParams.get("link") ?? "",
    section: url.searchParams.get("section") ?? ""
  } as const;

  try {
    const options: RenderOptions = {
      width: 1200,
      height: 600,
      props,
      // We have to pass a font array to Satori for this to work
      fonts: [
        {
          name: "Jost", // we can reference this font name in the component
          url: `${url.origin}/fonts/jost-v-webfont.woff`,
          weight: 400,
          style: "normal"
        }
      ],
      debug: true // this will help us debug any Satori errors
    };

    // pass the component and options to the package
    const image = await image_from_component(OpenGraphImage, options);
    const response = new Response(image);

    // This tells the browser that the data is a png
    setHeaders({ "Content-Type": "image/png" });

    // Don't cache the image if we're in development, trust me on this
    if (!dev) {
      setHeaders({
        "Cache-Control": "s-maxage=604800, stale-while-revalidate=604800"
      });
    }

    // return our image data
    return response;
  } catch (e) {
    console.error(e);
    throw error(500, "Error trying to generate image from component.");
  }
}) satisfies RequestHandler;
```

If you don't understand the basics of SvelteKit server endpoints, that might look a little
confusing, but it's really not.

## The Svelte Component

For this, we're going to use a very basic Svelte 5 component. Notice the
`<svelte:options css="injected" />` at the start, it's very important.

```svelte
<svelte:options css="injected" />

<script lang="ts">
  let {
    data
  }: {
    data: {
      title: string;
      section: string;
      link: string;
    };
  } = $props();
</script>

<div id="container">
  <div class="title">{data.title}</div>
  <div class="section">{data.section}</div>
  <div class="link">{data.link}</div>
</div>

<style>
  * {
    display: flex;
  }

  #container {
    width: 1200px;
    height: 600px;
    display: flex;
    align-items: center;
    font-family: "Jost";
    justify-content: center;
    position: relative;
    background: rgb(26, 33, 56);
    background: linear-gradient(299deg, rgba(26, 33, 56, 1) 0%, rgba(37, 23, 73, 1) 100%);
  }

  .title {
    display: flex;
    position: absolute;
    top: 160px;
    left: 70px;
    font-size: 100px;
    color: white;
    width: 660px;
  }

  .section {
    display: flex;
    position: absolute;
    top: 160px;
    left: 70px;
    font-size: 100px;
    color: white;
    width: 660px;
  }

  .link {
    display: flex;
    position: absolute;
    top: 320px;
    left: 70px;
    font-size: 33px;
    color: #eb5967;
    letter-spacing: 1px;
  }
</style>
```

> Note: `* { display: flex; }` is a handy trick to help satisfy Satori's unique CSS
> requirements

## We need to setup our font(s).

You might've noticed the font loaded in the server endpoint. We need to set that up. I am
using Jost, which is
[ freely available from Google Fonts ](https://fonts.google.com/selection?query=jost).

> You'll have to do this step, it's a pain, but this is what Satori requires. You'll have
> to convert some fonts that have the correct file type, I'm sorry.

If you download the Jost font, you'll notice that the zip contains a variable weight .ttf
called `Jost-VariableFont_wght.ttf` - this font will not work in this current state. We
have to convert it to a web safe font.

There is a
[ free tool available on the site Font Squirrel ](https://www.fontsquirrel.com/tools/webfont-generator)
that I have been using for over a decade that will convert fonts to a web-safe format.

Upload the variable weight ttf file and select `woff` as your output. You can play with
which font you use and the settings to try and get the smallest package, but for this use,
it's not really needed since it's all server-side.

Once you get your `woff` from Font Squirrel, you'll need to put it in your `/static`
directory so it can be accessed over `https`.

## Getting there...

Once you get all of this together, you should be able to see your Open Graph image display
if you navigate to:

```
http://localhost:5173/api/images?title=Testing&section=This-is-a-section&link=www.tester.com
```

You should notice the URL params that were called in the server endpoint
`title, section, link` in the URI.

You can pass all sorts of data using URL params to your component. You could do something
like pass an ID of a document to the server endpoint, load the data via a DB call, and
generate the image using that.

I use this package to do all sorts of stuff like generating images for emails, event
tickets, open graph images, etc.

## Deploying to Production: The Native Module Challenge

Now comes the tricky part. If you try to deploy this to Vercel or Netlify right now,
you'll encounter build errors. This is because `@resvg/resvg-js` contains
platform-specific C++ binaries that serverless platforms can't bundle directly. When Vite
and your adapter try to bundle your application for deployment, they attempt to include
these native bindings, which causes the build to fail.

The solution is to tell both Vite and your SvelteKit adapter to treat `@resvg/resvg-js` as
an external dependency. This means it won't be bundled but will be loaded from
`node_modules` at runtime.

First, make sure `@resvg/resvg-js` is installed as a regular dependency (not a
devDependency):

```bash
pnpm add @resvg/resvg-js
```

> Note: We do not use the -D flag on this install

## Deploying to Vercel

Update your vite.config.js:

```typescript
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [sveltekit()],
  build: {
    rollupOptions: {
      external: ["@resvg/resvg-js"]
    }
  }
});
```

Update your svelte.config.js:

```typescript
import adapter from "@sveltejs/adapter-vercel";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      external: ["@resvg/resvg-js"]
    })
  }
};
```

## Deploying to Netlify

The configuration is nearly identical, just with the Netlify adapter:

```typescript
import adapter from "@sveltejs/adapter-netlify";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      external: ["@resvg/resvg-js"]
    })
  }
};
```

The vite.config.js remains the same as the Vercel configuration.

## Deploying to a Node.js Server

If you're deploying to a traditional Node.js server (using @sveltejs/adapter-node), you
don't need any special configuration! The native modules work out of the box in a regular
Node.js environment.

Platform Support Summary

- ✅ Vercel - Works with configuration
- ✅ Netlify - Works with configuration
- ✅ Node.js servers - Works without configuration
- ❌ Cloudflare Pages - Not supported (no native module support)

## Common Gotchas

1. Svelte 5 CSS Requirements: Always include <svelte:options css="injected" /> at the top
   of your components
2. Font Formats: Use WOFF, TTF, or OTF fonts. WOFF2 is not currently supported
3. CSS Limitations: Only https://github.com/vercel/satori#css work
4. Radial Gradients: There's a known bug with radial gradients in Svelte 5 production
   builds - use linear gradients instead
5. Caching: In development, disable caching to see your changes immediately

## Wrapping Up

With these configurations, you can now generate dynamic images on the fly in your
SvelteKit applications deployed to serverless platforms. This opens up possibilities for:

- Dynamic Open Graph images for social media sharing
- Personalized email headers
- Event tickets and certificates
- Data visualizations
- Marketing materials

The key takeaway is that native dependencies require special handling on serverless
platforms, but with the right configuration, it works seamlessly.

## Minimal Deployable Reproduction

I have created a minimal deployable reproduction that works on Vercel at
[https://github.com/StephenGunn/skcti](https://github.com/StephenGunn/skcti). Please feel
free to clone, edit, or destroy this repo if it helps.
