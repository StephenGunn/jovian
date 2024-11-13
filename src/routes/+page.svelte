<script lang="ts">
  import Waves from "$lib/homepage/Waves.svelte";
  import Orbits from "$lib/homepage/Orbits.svelte";
  import Ship from "$lib/homepage/Ship.svelte";
  import MeteorShower from "$lib/homepage/MeteorShower.svelte";
  import StarField from "$lib/layout/art/StarField.svelte";
  import FlightDirections from "$lib/homepage/FlightDirections.svelte";
  import Seo from "sk-seo";
  import HeroText from "$lib/homepage/HeroText.svelte";

  let { data } = $props();

  let stars = data.stars;
</script>

<Seo
  title="JovianMoon.io - Stephen Gunn's Digital Playground"
  description="Digital playground for Stephen Gunn featuring blog posts, project showcases, and contact information."
  imageURL="https://jovianmoon.io/api/images/home"
/>

<div class="scene">
  <Ship />
  <HeroText />
  <Waves />
  <MeteorShower />
  <StarField {stars} />
  <Orbits />
  <FlightDirections />
</div>

<style>
  .scene {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
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

  @media (max-width: 768px) {
    .scene {
      aspect-ratio: 1;
    }
  }
</style>
