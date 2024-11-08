---
title: Generating a Randomized Starfield in SvelteKit
description:
  An overview of how I generate the random starfield backgrounds on this site using
  SvelteKit SSR.
date: "2024-8-24"
categories:
  - sveltekit
  - svelte 5
  - frontend
  - typescript
published: true
---

<script lang="ts">
  import StarFieldBlog from '$lib/components/blog/StarfieldBlog.svelte';
</script>

> "There was a special kind of silence in the void, the kind that you could never feel
> anywhere else. During a spacewalk, that silence seeped into your bones and made you feel
> like the smallest thing in the universe."
>
> [Cibola Burn (The Expanse, Book 4)](https://en.wikipedia.org/wiki/Cibola_Burn)

## So, you wanna go to space?

Welcome to my blog! As a lover of space-themed art, sci-fi books, and games, I wanted to
kick off this site with something I recently built: a starfield component. This post might
have more information than necessary, but I'm learning to write more, so bear with me. If
you'd rather dive into the code, my whole site is
[open-source](https://github.com/StephenGunn/jovian). Feel free to skip the writeup and
explore the code there if that's more your style.

##

Since this is the first post on this site, written in markdown, I wanted to cover
something fresh that I just completed. The starfield component for this site is simple but
has some advanced quirks to ensure it always looks good. I figured it would be the perfect
topic for this first post.

## In Practice

In a starfield, minimalism is key—too many stars can quickly become overwhelming.

<StarFieldBlog />

Here’s the starfield in action. We’ll dive into how it’s made shortly, but first, let’s
touch on the concept. The starfield uses a random number generator to create more small
stars than big ones. This keeps it clean and perhaps a bit more realistic. We also ensure
big stars don’t overlap, keeping the design clean and visually appealing.

## The Components

The starfield is made up of two components: the `Starfield.svelte` and the `Star.svelte`.
The `Starfield.svelte` component generates the stars and renders them on the screen, while
the `Star` component is responsible for rendering an individual star.

### The Star Component

The `Star.svelte` component is a simple SVG that can accept a size, position, and opacity
as props. The SVG shape was made in [Inkscape](https://inkscape.org/) and then copied into
the component.

```svelte:Star.svelte
<script lang="ts">
  const {
    size = "1rem",
    left = "0%",
    top = "0%",
    opacity = 1
  }: {
    size?: string;
    left?: string;
    top?: string;
    opacity?: number;
  } = $props();
</script>

<svg
  style:left
  style:top
  style:opacity
  style:width={size}
  style:height={size}
  style="position: absolute; z-index: 1;"
  viewBox="0 0 50 50"
  version="1.1"
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    style="fill:#fff;stroke:#fff;stroke-width:0;stroke-linejoin:round;paint-order:fill markers stroke"
    id="path1"
    d="m 14.180657,31.334797 c -1.653717,0 -4.6075584,-13.07614 -5.7769132,-14.245495 C 7.234389,15.919948 -5.8417511,12.966107 -5.8417511,11.31239 c 0,-1.6537175 13.0761399,-4.6075584 14.2454946,-5.7769132 1.1693548,-1.1693548 4.1231955,-14.2454949 5.7769125,-14.245495 1.653717,0 4.607558,13.0761399 5.776913,14.2454947 1.169355,1.1693547 14.245495,4.123195 14.245495,5.7769125 0,1.653717 -13.07614,4.607558 -14.245495,5.776913 -1.169354,1.169355 -4.123195,14.245495 -5.776912,14.245495 z"
    transform="translate(10.819344,13.687611)"
  />
</svg>
```

### The Starfield Component

The `Starfield.svelte` is a bit more complex, so I will post the whole thing and then
break down the sections and give justifications for the choices made.

```svelte:Starfield.svelte
<script lang="ts">
  import { browser } from "$app/environment";
  import Star from "./Star.svelte";

  let width: number = $state(0);
  let height: number = $state(0);

  // we want to serverside render the starfield
  // we will render more stars than we need to, on the server, so we don't have to wait for the
  // window dimensions to be available to generate the dom elements
  let {
    large_star_count = 20,
    tiny_star_count = 300
  }: { large_star_count: number; tiny_star_count: number } = $props();

  // random numbers
  const random = (min: number, max: number): number => {
    const randomValue = Math.random() * (max - min) + min;
    return Math.round(randomValue * 100) / 100; // Rounds to two decimal places
  };

  type StarData = {
    size: string;
    left: string;
    top: string;
    opacity?: number;
  };

  // generate an array of random positions for the stars that are between 3000 x 1500
  let stars: StarData[] = $state(
    Array.from({ length: large_star_count }).map(() => ({
      size: `${random(0.1, 1)}rem`,
      left: `${random(0, 3000)}px`,
      top: `${random(0, 1500)}px`,
      opacity: 1 // big stars are always full brightness
    }))
  );

  // generate an array of random positions for the tiny stars that are between 3000 x 1500
  let tiny_stars: StarData[] = $state(
    Array.from({ length: tiny_star_count }).map(() => ({
      left: `${random(0, 3000)}px`,
      top: `${random(0, 1500)}px`,
      size: `${random(0.1, 0.15)}rem`,
      opacity: random(0.5, 1)
    }))
  );

  // a function to make sure our stars aren't too close together
  const check_star_positions = (stars: StarData[]) => {
    let max_attempts = 10;
    let threshold = 150; // the minimum distance between big stars

    return stars.map((star, index) => {
      let new_star = { ...star };
      let attempts = 0;

      while (attempts < max_attempts) {
        let too_close = false;

        for (let i = 0; i < stars.length; i++) {
          if (i !== index) {
            const other_star = stars[i];
            const distance = Math.sqrt(
              Math.pow(
                Number(new_star.left.replace("px", "")) - Number(other_star.left.replace("px", "")),
                2
              ) +
                Math.pow(Number(new_star.top.replace("px", "")) - Number(other_star.top.replace("px", "")), 2)
            );

            if (distance < threshold) {
              too_close = true;
              break;
            }
          }
        }

        if (!too_close) {
          break;
        }

        // Reposition star
        new_star.left = `${random(0, 3000)}px`;
        new_star.top = `${random(0, 1500)}px`;
        attempts++;
      }

      return new_star;
    });
  };

  // check to see if stars are in the viewbox, so we can unrender the dom elements if they arent
  const in_view_box = (star: StarData) => {
    if (!browser) return true; // we don't need to check this on the server
    const left = Number(star.left.replace("px", ""));
    const top = Number(star.top.replace("px", ""));
    return left > 0 && left < width && top > 0 && top < height;
  };
</script>

<svelte:window bind:innerWidth={width} bind:innerHeight={height} />

<div class="star-field">
  {#each check_star_positions(stars) as star}
    {#if in_view_box(star)}
      <Star size={star.size} left={star.left} top={star.top} opacity={star.opacity} />
    {/if}
  {/each}
  {#each tiny_stars as star}
    {#if in_view_box(star)}
      <Star size={star.size} left={star.left} top={star.top} opacity={star.opacity} />
    {/if}
  {/each}
</div>

<style>
  .star-field {
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: 1;
  }
</style>
```

The code should be pretty easy to understand if you are familiar with Svelte and some
minimal TypeScript. A few things to note:

- I overrender stars on the server then double-check in the browser and remove DOM
  elements that are not in the viewbox.
- The stars have a finite range of positions. I limit their container size so it's not a
  problem for me.
- I do a check on the large stars to make sure they are not too close together. I did this
  in response to the stars overlapping and looking like a mess.
- The stars are generated with a random size and opacity within a range. I think the tiny
  stars look especially nice when they have sub-pixel sizes. The browser does a great job
  of rendering them.

## Digging Into the Code

```typescript
let {
  large_star_count = 20,
  tiny_star_count = 300
}: {
  large_star_count: number;
  tiny_star_count: number;
} = $props();
```

Although the component is set up to receive the star counts as props, I am using the
defaults for my site.

```typescript
// random numbers
const random = (min: number, max: number): number => {
  const randomValue = Math.random() * (max - min) + min;
  return Math.round(randomValue * 100) / 100; // Rounds to two decimal places
};
```

I found that randomizing the stars with a function that rounds to two decimal places gave
a nice effect. I believe that `width`, `height`, `left`, and `top` are all values that can
handle sub-pixel values. This also helps with the effect.

This is the last interesting part of the TypeScript. I use this to make sure the large
stars are not too close. Since the Big O complexity of this function is O(n²), I limit the
number of attempts to 10 and only with the large stars array. This is all basically
instant, so it's not a problem.

```typescript
// a function to make sure our stars aren't too close together
const check_star_positions = (stars: StarData[]) => {
  let max_attempts = 10;
  let threshold = 150; // the minimum distance between big stars

  return stars.map((star, index) => {
    let new_star = { ...star };
    let attempts = 0;

    while (attempts < max_attempts) {
      let too_close = false;

      for (let i = 0; i < stars.length; i++) {
        if (i !== index) {
          const other_star = stars[i];
          const distance = Math.sqrt(
            Math.pow(
              Number(new_star.left.replace("px", "")) -
                Number(other_star.left.replace("px", "")),
              2
            ) +
              Math.pow(
                Number(new_star.top.replace("px", "")) -
                  Number(other_star.top.replace("px", "")),
                2
              )
          );

          if (distance < threshold) {
            too_close = true;
            break;
          }
        }
      }

      if (!too_close) {
        break;
      }

      // Reposition star
      new_star.left = `${random(0, 3000)}px`;
      new_star.top = `${random(0, 1500)}px`;
      attempts++;
    }

    return new_star;
  });
};
```

Like I said earlier in the article, the starfield would sometimes generate two large stars
that would overlap or be too close together. This function makes sure that doesn't happen.
It looked pretty bad when it happened.

The last part of the component is the rendering of the stars. I use the `in_view_box()`
function to make sure the stars are in the viewbox. This only happens in the browser, so
it only removes unseen star elements from the DOM.

```svelte
<div class="star-field">
  {#each check_star_positions(stars) as star}
    {#if in_view_box(star)}
      <Star size={star.size} left={star.left} top={star.top} opacity={star.opacity} />
    {/if}
  {/each}
  {#each tiny_stars as star}
    {#if in_view_box(star)}
      <Star size={star.size} left={star.left} top={star.top} opacity={star.opacity} />
    {/if}
  {/each}
</div>

<style>
  .star-field {
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: 1;
  }
</style>
```

## Conclusion

Thanks for sticking around! This post not only helped me build the site but also
solidified my approach to creating and sharing content. I'm thrilled to continue
developing and can't wait to share more with you soon.

Also, huge shoutout to [Joy of Code](https://joyofcode.xyz), I used his blog as a starting
point for how to render markdown/handle code blocks in SvelteKit. I'm excited to see what
he does next.

If you have any questions or comments, feel free to reach out to me on
[BlueSky](https://bsky.app/profile/jovianmoon.io).
