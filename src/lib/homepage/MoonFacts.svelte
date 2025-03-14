<script lang="ts">
  import type { CelestialBodyFacts } from "$lib/types/schema";
  import { metric, days } from "$lib/stores/homepage.svelte.js";
  import { fly } from "svelte/transition";
  const {
    facts,
    title,
    distance = "Distance"
  }: { facts: CelestialBodyFacts; title: string; distance: string } = $props();

  const duration: number = 100;
  const x: number = 10;
</script>

<div class="facts">
  <div class="title" transition:fly={{ duration, x }}>{title}</div>
  <div transition:fly={{ delay: duration, duration, x }}>
    Dist. {distance}<span>{metric ? facts.distance_km : facts.distance_miles}</span>
  </div>
  <div transition:fly={{ delay: duration * 2, duration, x }}>
    Diameter <span>{metric ? facts.diameter_km : facts.diameter_miles}</span>
  </div>
  <div transition:fly={{ delay: duration * 3, duration, x }}>
    Gravity <span>{facts.gravity}</span>
  </div>
  <div transition:fly={{ delay: duration * 4, duration, x }}>
    Temperature <span>{metric ? facts.temperature_c : facts.temperature_f}</span>
  </div>
  <div transition:fly={{ delay: duration * 5, duration, x }}>
    Orbit <span
      >{days
        ? facts.orbit_days
        : facts.orbit_years
          ? facts.orbit_years
          : facts.orbit_days}</span
    >
  </div>

  <div in:fly={{ delay: duration * 6, duration, x }}>
    {#if facts.moons > 0}
      Moons <span>{facts.moons}</span>
    {/if}
  </div>

  <div in:fly={{ delay: duration * 7, duration, x }}>
    {#if facts.moons > 0}
      Moons not shown <span>{facts.moons_not_shown}</span>
    {/if}
  </div>
</div>

<style>
  .facts {
    color: white;
    font-size: 1rem;
    position: absolute;
    top: calc(50% - 2rem);
    left: calc(100% + 1.5em);
    font-family: "Jost", sans-serif;
    gap: 2rem;
    min-width: 225px;
    z-index: 11;
    pointer-events: none;
  }

  .title {
    font-size: 1rem;
    font-weight: 600;
  }

  .facts > div:not(.title) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.6rem;
    color: #a0a0a0;
    position: relative;
  }
  .facts > div span {
    font-weight: 600;
    color: white;
  }

  @media (max-width: 768px) {
    .facts {
      top: auto;
      bottom: 120%;
      left: 50%;
      transform: translateX(-50%);
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: auto;
      width: fit-content;
    }
    .facts .title {
      font-size: 1.1rem;
    }

    .facts > div:not(.title) {
      display: none;
    }
  }
</style>
