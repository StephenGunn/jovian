<script lang="ts">
  import Waves from "$lib/homepage/Waves.svelte";
  import Orbits from "$lib/homepage/Orbits.svelte";
  import Ship from "$lib/homepage/Ship.svelte";
  import MeteorShower from "$lib/homepage/MeteorShower.svelte";
  import StarField from "$lib/layout/art/StarField.svelte";
  import Seo from "sk-seo";
</script>

<Seo
  title="JovianMoon.io"
  description="Digital playground for Stephen Gunn featuring blog posts, projects, expiriments, and links to web development resources."
/>

<div class="scene">
  <div class="text">
    <h1>Jovian Moon</h1>
    <div class="tagline">Digital playground of Stephen Gunn</div>
  </div>
  <Ship />
  <Waves />
  <MeteorShower />
  <StarField />
  <Orbits />
</div>

<style>
  .scene {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgb(41, 39, 55);
    overflow: hidden;
    background: radial-gradient(
      circle,
      rgba(41, 39, 55, 1) 0%,
      rgba(48, 42, 23, 1) 42%,
      rgba(34, 24, 57, 1) 100%
    );
    max-width: 3000px;
    max-height: 1500px;
    aspect-ratio: 16 / 9;
  }

  .text {
    position: absolute;
    top: 20%;
    left: 12%;
    z-index: 7;
  }

  h1 {
    font-size: clamp(3.125rem, 11.547vw + 0.137rem, 9.375rem);
    line-height: 1.2;
  }

  .tagline {
    font-family: "Jost", sans-serif;
    font-weight: 300;
    font-size: clamp(1.25rem, 3.125vw + 0.137rem, 2rem);
    position: relative;
    top: -0.5rem;
    left: 10%;
  }
</style>
