<script lang="ts">
  import Seo from "sk-seo";
  import Ship from "$lib/homepage/Ship.svelte";
  import Alien from "$lib/homepage/Alien.svelte";
  import Waves from "$lib/homepage/Waves.svelte";
  import Orbits from "$lib/homepage/Orbits.svelte";
  import HeroText from "$lib/homepage/HeroText.svelte";
  import StarField from "$lib/layout/art/StarField.svelte";
  import PartySocket from "partysocket";
  import MeteorShower from "$lib/homepage/MeteorShower.svelte";
  import FlightDirections from "$lib/homepage/FlightDirections.svelte";
  import { onDestroy, onMount } from "svelte";
  import { PUBLIC_WS_SERVER } from "$env/static/public";
  import { scene_ref } from "$lib/stores/homepage.svelte";
  import { fade } from "svelte/transition";

  let { data } = $props();
  let stars = data.stars;

  type AlienData = {
    id: string;
    country: string;
  };

  let aliens: AlienData[] = $state<AlienData[]>([]);
  let alien_components: Record<string, Alien> = $state({});
  let party: PartySocket | undefined = $state();

  onMount(async () => {
    party = new PartySocket({
      host: PUBLIC_WS_SERVER,
      room: "space"
    });

    party.addEventListener("message", (event: MessageEvent) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case "init":
          aliens = message.aliens.map((alien: AlienData) => ({
            id: alien.id,
            country: alien.country
          }));
          break;

        case "new_alien":
          aliens = [
            ...aliens,
            {
              id: message.id,
              country: message.country
            }
          ];
          break;

        case "waypoint":
          const x = message.x * window.innerWidth;
          const y = message.y * window.innerHeight;
          if (alien_components[message.alienId]) {
            alien_components[message.alienId].add_waypoint(message.alienId, x, y);
          }
          break;

        case "remove":
          aliens = aliens.filter((alien) => alien.id !== message.alienId);
          delete alien_components[message.alienId]; // Clean up the component reference
          break;
      }
    });
  });

  onDestroy(() => {
    party?.close();
  });

  function broadcast_waypoint(x: number, y: number) {
    if (!party) return;
    const px = x / window.innerWidth;
    const py = y / window.innerHeight;
    party.send(
      JSON.stringify({
        type: "waypoint",
        x: px,
        y: py
      })
    );
  }
</script>

<Seo
  title="JovianMoon.io - Stephen Gunn's Digital Playground"
  description="Digital playground for Stephen Gunn featuring blog posts, project showcases, and contact information."
  imageURL="https://jovianmoon.io/api/images/home"
/>

<div
  class="scene"
  bind:offsetWidth={scene_ref.width}
  bind:offsetHeight={scene_ref.height}
>
  <Ship {broadcast_waypoint} />
  {#if aliens && aliens.length > 1}
    <div class="players" transition:fade={{ duration: 400 }}>
      [ {aliens.length - 1} other{aliens.length - 1 > 1 ? "s" : ""} exploring space ]
    </div>
  {/if}
  {#each aliens as alien (alien.id)}
    {#if party?.id !== alien.id}
      <Alien
        id={alien.id}
        country={alien.country}
        bind:this={alien_components[alien.id]}
      />
    {/if}
  {/each}
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

  .players {
    position: absolute;
    top: 10px;
    left: 10px;
    font-size: 0.7rem;
    color: white;
    font-weight: 400;
    color: var(--secondary);
    opacity: 0.8;
  }

  @media (max-width: 768px) {
    .scene {
      aspect-ratio: 1;
    }
  }
</style>
