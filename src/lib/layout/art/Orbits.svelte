<script lang="ts">
  import Jupiter from "$lib/layout/art/Jupiter.svelte";
  import MoonFacts from "./MoonFacts.svelte";
  import MoonShadow from "./MoonShadow.svelte";

  import { facts } from "$lib/data";

  type CelestialBody = "Jupiter" | "Io" | "Europa" | "Ganymede";
  let showing: CelestialBody | undefined = $state(undefined);

  $inspect(showing);

  let timeout: ReturnType<typeof setTimeout>;
  const set_visible_facts = (body: CelestialBody) => {
    showing = body;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => (showing = undefined), 5000);
  };
</script>

<div class="map">
  <div class="jupiter" onmouseenter={() => set_visible_facts("Jupiter")} role="button" tabindex="0">
    <Jupiter />
    {#if showing === "Jupiter"}
      <MoonFacts facts={facts.Jupiter} title="Jupiter" distance="from Sun" />
    {/if}
  </div>
  <div class="io orbit bound circle absolute">
    <div class="moon" onmouseenter={() => set_visible_facts("Io")} role="button" tabindex="0">
      <MoonShadow />
      {#if showing === "Io"}
        <MoonFacts facts={facts.Io} title="Io" distance="from Jupiter" />
      {/if}
    </div>
  </div>
  <div class="io orbit absolute ignore"></div>
  <div class="europa orbit bound circle absolute">
    <div class="moon" onmouseenter={() => set_visible_facts("Europa")} role="button" tabindex="0">
      <MoonShadow />
      {#if showing === "Europa"}
        <MoonFacts facts={facts.Europa} title="Europa" distance="from Jupiter" />
      {/if}
    </div>
  </div>
  <div class="europa orbit absolute ignore"></div>
  <div class="ganymede orbit bound circle absolute">
    <div class="moon" onmouseenter={() => set_visible_facts("Ganymede")} role="button" tabindex="0">
      <MoonShadow />
      {#if showing === "Ganymede"}
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
    width: 2rem;
    border-radius: 50%;
    left: calc(50% - 1.2rem);
    top: -1rem;
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
    background: radial-gradient(circle at 20% 30%, rgba(255, 226, 142, 1) 0%, rgba(236, 188, 1, 1) 62%);
  }
  .europa.orbit {
    width: 60%;
    top: 20%;
    right: 20%;
  }
  .europa .moon {
    animation: rotate_backwards 185s linear infinite;
    background: radial-gradient(circle at 30% 30%, rgba(209, 192, 176, 1) 0%, rgba(64, 84, 110, 1) 73%);
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
    background: radial-gradient(circle at 20% 30%, rgba(167, 149, 226, 1) 0%, rgba(106, 134, 140, 1) 73%);
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
