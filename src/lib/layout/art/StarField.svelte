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
  }: { large_star_count?: number; tiny_star_count?: number } = $props();

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
