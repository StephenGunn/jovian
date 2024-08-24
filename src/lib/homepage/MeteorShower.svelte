<script lang="ts">
  import Meteor from "$lib/homepage/Meteor.svelte";
  import { onDestroy, onMount } from "svelte";

  type M = { x: number; y: number; size: number; time_created: number };
  let meteor_shower: M[] = $state([]);
  let { w, h } = $state({ w: 0, h: 0 });
  const random = (min: number, max: number) => Math.random() * (max - min) + min;

  const meteor_generator = () => {
    // remove meteors that are older than 30 seconds
    meteor_shower = meteor_shower.filter((meteor) => meteor.time_created > Date.now() + 30000);

    // limit the number of meteors on screen
    if (meteor_shower.length > 10) return;
    if (Math.random() < 0.5) {
      // add a meteor to the queue
      const meteor: M = {
        x: random(0, w),
        y: random(-10, -300),
        size: random(4, 12),
        time_created: Date.now()
      };

      meteor_shower = [...meteor_shower, meteor];
    }
  };

  let int: ReturnType<typeof setInterval>;
  onMount(async () => {
    // generate meteors every 5000ms
    int = setInterval(meteor_generator, 2000);
  });

  onDestroy(() => {
    meteor_shower = [];
    clearInterval(int);
  });
</script>

<svelte:window bind:innerWidth={w} bind:innerHeight={h} />

{#if meteor_shower.length > 0}
  {#each meteor_shower as meteor}
    <Meteor size={meteor.size} start={{ x: meteor.x, y: meteor.y }} />
  {/each}
{/if}
