<script lang="ts">
  import { dev } from "$app/environment";
  import Star from "./Star.svelte";

  let width: number = 0;
  let height: number = 0;

  // we want to serverside render the starfield
  // we will render more stars than we need to so we don't have to wait for the
  // window dimensions to be available
  const star_count = 40;
  const tiny_star_count = 300;

  // random numbers
  const random = (min: number, max: number): number => {
    const randomValue = Math.random() * (max - min) + min;
    return Math.round(randomValue * 100) / 100; // Rounds to two decimal places
  };

  // generate an array of random positions for the stars that are between 3000 x 1500
  let stars = Array.from({ length: star_count }).map(() => ({
    size: `${random(0.1, 1)}rem`,
    left: `${random(0, 3000)}px`,
    top: `${random(0, 1500)}px`,
    opacity: 1
  }));

  // generate an array of random positions for the tiny stars that are between 3000 x 1500
  let tiny_stars = Array.from({ length: tiny_star_count }).map(() => ({
    left: `${random(0, 3000)}px`,
    top: `${random(0, 1500)}px`,
    size: `${random(0.1, 0.15)}rem`,
    opacity: `${random(0.5, 1)}`
  }));

  // iterate through the array of stars to check if any are too close to each other
  // if they are, we will move them to a new position
  stars = stars.map((star) => {
    let new_star = { ...star };
    stars.forEach((other_star) => {
      if (star !== other_star) {
        const distance = Math.sqrt(
          Math.pow(Number(star.left.replace("px", "")) - Number(other_star.left.replace("px", "")), 2) +
            Math.pow(Number(star.top.replace("px", "")) - Number(other_star.top.replace("px", "")), 2)
        );
        if (distance < 100) {
          new_star.left = `${Math.random() * 3000}px`;
          new_star.top = `${Math.random() * 1500}px`;
        }
      }
    });
    return new_star;
  });
</script>

<svelte:window bind:innerWidth={width} bind:innerHeight={height} />
<div class="star-field">
  {#if dev}
    <div class="debug">
      {width} x {height}
    </div>
  {/if}
  {#each stars as star}
    <Star size={star.size} left={star.left} top={star.top} opacity={star.opacity} />
  {/each}
  {#each tiny_stars as star}
    <Star size={star.size} left={star.left} top={star.top} />
  {/each}
</div>

<style>
  .star-field {
    position: absolute;
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
