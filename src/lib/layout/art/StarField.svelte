<script lang="ts">
  import { generate_starfield } from "../generate_starfield.svelte";
  import type { StarData, Starfield } from "$lib/types/schema";
  import Star from "./Star.svelte";
  import { browser } from "$app/environment";

  let width: number = $state(0);
  let height: number = $state(0);

  // we want to serverside render the starfield
  // we will render more stars than we need to, on the server, so we don't have to wait for the
  // window dimensions to be available to generate the dom elements
  let {
    stars,
    full_screen = true,
    box_width = 3000,
    box_height = 1500,
    large_star_count = 20,
    tiny_star_count = 300
  }: {
    stars: Starfield;
    full_screen?: boolean;
    box_width?: 3000;
    box_height?: 1500;
    large_star_count?: number;
    tiny_star_count?: number;
  } = $props();

  // check to see if stars are in the viewbox, so we can unrender the dom elements if they arent
  const in_view_box = (star: StarData) => {
    if (!browser) return true; // we don't need to check this on the server
    const left = Number(star.left.replace("px", ""));
    const top = Number(star.top.replace("px", ""));
    return left > 0 && left < width && top > 0 && top < height;
  };

  // safely copy the stars to allow for mutation
  let stars_copy = $state({ ...stars });

  // only regenerate the starfield if the window dimensions are larger than the box dimensions
  $effect(() => {
    if ((width > box_width && full_screen) || (height > box_height && full_screen)) {
      stars_copy = generate_starfield(width, height, large_star_count, tiny_star_count);
    }
  });
</script>

<svelte:window bind:innerWidth={width} bind:innerHeight={height} />

<div class="star-field">
  {#each stars_copy.large as star}
    {#if in_view_box(star)}
      <Star size={star.size} left={star.left} top={star.top} opacity={star.opacity} />
    {/if}
  {/each}
  {#each stars_copy.tiny as star}
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
