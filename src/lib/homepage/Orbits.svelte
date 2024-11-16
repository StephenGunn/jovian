<script lang="ts">
  import Jupiter from "./Jupiter.svelte";
  import MoonFacts from "./MoonFacts.svelte";
  import MoonShadow from "./MoonShadow.svelte";
  import {
    jupiter_data,
    io_data,
    europa_data,
    ganymede_data
  } from "$lib/stores/homepage.svelte.js";

  import { facts } from "$lib/data";
  import { onMount } from "svelte";
  import type { CelestialBodyData } from "$lib/types/schema";

  let jupiter: HTMLDivElement | undefined = $state();
  let io: HTMLDivElement | undefined = $state();
  let europa: HTMLDivElement | undefined = $state();
  let ganymede: HTMLDivElement | undefined = $state();

  const orbital_telemetry = (div: HTMLDivElement, store: CelestialBodyData) => {
    let lastRect = div.getBoundingClientRect();

    function checkPosition() {
      const rect = div.getBoundingClientRect();
      if (rect.top !== lastRect.top || rect.left !== lastRect.left) {
        store.x = rect.left;
        store.y = rect.top;
        lastRect = rect;
      }
      requestAnimationFrame(checkPosition);
    }
    requestAnimationFrame(checkPosition);
  };

  onMount(() => {
    if (!jupiter || !io || !europa || !ganymede) return;
    jupiter_data.x = jupiter.getBoundingClientRect().left;
    jupiter_data.y = jupiter.getBoundingClientRect().top;
    jupiter_data.width = jupiter.getBoundingClientRect().width;
    jupiter_data.height = jupiter.getBoundingClientRect().height;

    // set io's width and height
    io_data.width = io.getBoundingClientRect().width;
    io_data.height = io.getBoundingClientRect().height;

    // set europa's width and height
    europa_data.width = europa.getBoundingClientRect().width;
    europa_data.height = europa.getBoundingClientRect().height;

    // set ganymede's width and height
    ganymede_data.width = ganymede.getBoundingClientRect().width;
    ganymede_data.height = ganymede.getBoundingClientRect().height;
  });
</script>

<div class="map" aria-hidden="true">
  <div class="jupiter" bind:this={jupiter}>
    <Jupiter />
    {#if jupiter_data.show_info}
      <MoonFacts facts={facts.Jupiter} title="Jupiter" distance="from Sun" />
    {/if}
  </div>

  <div class="io orbit bound circle absolute">
    <div use:orbital_telemetry={io_data} bind:this={io} class="moon">
      <MoonShadow />
      {#if io_data.show_info}
        <MoonFacts facts={facts.Io} title="Io" distance="from Jupiter" />
      {/if}
    </div>
  </div>
  <div class="io orbit absolute ignore"></div>

  <div class="europa orbit bound circle absolute">
    <div class="moon" use:orbital_telemetry={europa_data} bind:this={europa}>
      <MoonShadow />
      {#if europa_data.show_info}
        <MoonFacts facts={facts.Europa} title="Europa" distance="from Jupiter" />
      {/if}
    </div>
  </div>
  <div class="europa orbit absolute ignore"></div>

  <div class="ganymede orbit bound circle absolute">
    <div class="moon" use:orbital_telemetry={ganymede_data} bind:this={ganymede}>
      <MoonShadow />
      {#if ganymede_data.show_info}
        <MoonFacts facts={facts.Ganymede} title="Ganymede" distance="from Jupiter" />
      {/if}
    </div>
  </div>
  <div class="ganymede orbit absolute"></div>
</div>

<style>
  .ignore {
    pointer-events: none;
  }

  .absolute {
    position: absolute;
  }

  .map {
    width: 40%;
    aspect-ratio: 1;
    position: absolute;
    right: 5%;
    top: 10%;
    z-index: 2;
  }

  .circle {
    aspect-ratio: 1;
    border-radius: 50%;
  }
  .jupiter {
    width: 10%;
    top: 45%;
    right: 45%;
    position: absolute;
    z-index: 6;
  }
  .orbit {
    border: 2px dashed rgba(255, 255, 255, 0.2);
    aspect-ratio: 1;
    border-radius: 50%;
    z-index: 1;
  }
  .orbit.bound {
    border: none;
    border-radius: 0;
    z-index: 4;
  }
  .moon {
    width: 1.5rem;
    border-radius: 50%;
    left: calc(50% - 1.2rem);
    top: -0.75rem;
    aspect-ratio: 1;
    position: absolute;
    z-index: 2;
    box-shadow:
      0 0 10px rgba(255, 255, 255, 0.1),
      0 0 40px rgba(255, 255, 255, 0.1),
      0 0 80px rgba(255, 255, 255, 0.1);
  }
  .io.orbit {
    width: 40%;
    top: 30%;
    right: 30%;
  }
  .io.bound {
    animation: rotate 90s linear infinite;
  }
  .io .moon {
    animation: rotate_backwards 90s linear infinite;
    background: radial-gradient(
      circle at 20% 30%,
      rgba(255, 226, 142, 1) 0%,
      rgba(236, 188, 1, 1) 62%
    );
  }
  .europa.orbit {
    width: 60%;
    top: 20%;
    right: 20%;
  }
  .europa .moon {
    animation: rotate_backwards 185s linear infinite;
    background: radial-gradient(
      circle at 30% 30%,
      rgba(209, 192, 176, 1) 0%,
      rgba(64, 84, 110, 1) 73%
    );
  }
  .europa.bound {
    animation: rotate 185s linear infinite;
    z-index: 3;
  }
  .ganymede.orbit {
    width: 100%;
    top: 0%;
    right: 0%;
  }
  .ganymede.bound {
    animation: rotate 360s linear infinite;
    z-index: 2;
  }
  .ganymede .moon {
    animation: rotate_backwards 360s linear infinite;
    background: radial-gradient(
      circle at 20% 30%,
      rgba(167, 149, 226, 1) 0%,
      rgba(106, 134, 140, 1) 73%
    );
  }

  @media (max-width: 1500px) {
    .map {
      width: 70%;
      right: 15%;
      top: 10%;
    }
  }
  @media (max-width: 1300px) {
    .map {
      width: 60%;
      right: 20%;
      top: auto;
      bottom: 22%;
    }
  }
  @media (max-width: 768px) {
    .map {
      width: 150%;
      right: -25%;
      top: auto;
      bottom: 0%;
    }
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  @keyframes rotate_backwards {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(-360deg);
    }
  }
</style>
