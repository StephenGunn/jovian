<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import PartySocket from "partysocket";
  import { PUBLIC_WS_SERVER } from "$env/static/public";
  import Tank from "$lib/tank/Tank.svelte";
  import OtherFish from "$lib/tank/OtherFish.svelte";

  type FishData = {
    id: string;
    country: string;
  };

  let party: PartySocket | undefined = $state();
  let other_fish: FishData[] = $state([]);
  let fish_components: Record<string, any> = $state({});
  let tank_component: any = $state();

  onMount(async () => {
    try {
      party = new PartySocket({
        host: PUBLIC_WS_SERVER,
        room: "playground-tank"
      });

      // Silently handle connection errors
      party.addEventListener("error", () => {
        party = undefined;
      });

      party.addEventListener("message", (event: MessageEvent) => {
        const message = JSON.parse(event.data);

        switch (message.type) {
          case "init":
            other_fish = message.fish.map((fish: FishData) => ({
              id: fish.id,
              country: fish.country
            }));
            break;

          case "new_fish":
            other_fish = [
              ...other_fish,
              {
                id: message.id,
                country: message.country
              }
            ];
            break;

          case "fish_move":
            if (tank_component) {
              const tankRect = tank_component.getBoundingClientRect();
              const x = message.x * tankRect.width;
              const y = message.y * tankRect.height;
              if (fish_components[message.fishId]) {
                fish_components[message.fishId].swim_to(x, y);
              }
            }
            break;

          case "remove":
            other_fish = other_fish.filter((fish) => fish.id !== message.fishId);
            delete fish_components[message.fishId];
            break;
        }
      });
    } catch (error) {
      // Silently fail if WebSocket cannot be established
      party = undefined;
    }
  });

  onDestroy(() => {
    party?.close();
  });

  function broadcast_movement(x: number, y: number) {
    if (!party || !tank_component) return;

    const tankRect = tank_component.getBoundingClientRect();
    // x and y are already relative to the tank
    const normalizedX = x / tankRect.width;
    const normalizedY = y / tankRect.height;

    party.send(
      JSON.stringify({
        type: "fish_move",
        x: normalizedX,
        y: normalizedY
      })
    );
  }
</script>

<svelte:head>
  <title>Fish Tank - JovianMoon.io</title>
  <meta name="description" content="A multiplayer fish tank playground" />
</svelte:head>

<div class="tank-page">
  <Tank {broadcast_movement} bind:this={tank_component}>
    {#each other_fish as fish (fish.id)}
      <OtherFish id={fish.id} country={fish.country} bind:this={fish_components[fish.id]} />
    {/each}
  </Tank>

  <div class="content">
    <h2>Multiplayer Fish Tank</h2>
    <p>Click anywhere in the tank to swim around.</p>
    {#if other_fish.length > 0}
      <p class="player-count">
        [ {other_fish.length} other {other_fish.length === 1 ? "fish" : "fish"} swimming ]
      </p>
    {/if}
  </div>
</div>

<style>
  .tank-page {
    width: 100%;
    min-height: 100vh;
  }

  .content {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }

  .content h2 {
    margin-bottom: 1rem;
  }

  .player-count {
    color: var(--fg-muted);
    font-family: monospace;
    margin-top: 1rem;
  }
</style>
