<script lang="ts">
  import { dev } from "$app/environment";
  import { debug_mode } from "$lib/data";
  import Star from "./Star.svelte";

  let width: number = $state(0);
  let height: number = $state(0);

  // we want to serverside render the starfield
  // we will render more stars than we need to, on the server, so we don't have to wait for the
  // window dimensions to be available
  const star_count = 20;
  const tiny_star_count = 300;

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
    Array.from({ length: star_count }).map(() => ({
      size: `${random(0.1, 1)}rem`,
      left: `${random(0, 3000)}px`,
      top: `${random(0, 1500)}px`,
      opacity: 1
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
    let threshold = 150;

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
        new_star.left = `${Math.random() * 3000}px`;
        new_star.top = `${Math.random() * 1500}px`;
        attempts++;
      }

      return new_star;
    });
  };

  // check to see if stars are in the viewbox, so we can unrender the dom elements if they arent
  const in_view_box = (star: StarData) => {
    const left = Number(star.left.replace("px", ""));
    const top = Number(star.top.replace("px", ""));
    return left > 0 && left < width && top > 0 && top < height;
  };
</script>

<svelte:window bind:innerWidth={width} bind:innerHeight={height} />
<div class="star-field">
  {#if dev && debug_mode}
    <div class="debug">
      {width} x {height}
    </div>
  {/if}
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
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: 1;
  }

  .debug {
    position: absolute;
    top: 0;
    left: 0;
    padding: 0.5rem;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    font-size: 1rem;
  }
</style>
