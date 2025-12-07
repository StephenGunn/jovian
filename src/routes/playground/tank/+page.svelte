<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import PartySocket from "partysocket";
  import { PUBLIC_WS_SERVER, PUBLIC_BLUESKY_DID } from "$env/static/public";
  import Tank from "$lib/tank/Tank.svelte";
  import OtherFish from "$lib/tank/OtherFish.svelte";
  import Comments from "../../posts/[slug]/Comments.svelte";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
  let { item, related_posts } = data;

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
  <title>{item.title} - JovianMoon.io</title>
  <meta name="description" content={item.description} />
</svelte:head>

<div class="tank-page">
  <Tank {broadcast_movement} bind:this={tank_component}>
    {#each other_fish as fish (fish.id)}
      <OtherFish id={fish.id} country={fish.country} bind:this={fish_components[fish.id]} />
    {/each}
  </Tank>

  <div class="content">
    <h2>{item.title}</h2>

    <p class="description">{item.description}</p>

    <div class="meta">
      <p class="instructions">Click anywhere in the tank to swim around.</p>
      {#if other_fish.length > 0}
        <p class="player-count">
          [ {other_fish.length} other {other_fish.length === 1 ? "fish" : "fish"} swimming ]
        </p>
      {/if}
    </div>

    {#if related_posts.length > 0}
      <section class="related-posts">
        <h3>Related Articles</h3>
        <ul>
          {#each related_posts as post}
            <li>
              <a href="/posts/{post.slug}">
                <span class="post-title">{post.title}</span>
                <span class="post-description">{post.description}</span>
              </a>
            </li>
          {/each}
        </ul>
      </section>
    {/if}

    {#if item.bluesky_thread_id}
      <section class="comments-section">
        <Comments did={PUBLIC_BLUESKY_DID} threadId={item.bluesky_thread_id} />
      </section>
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

  .description {
    color: var(--fg-muted, #999);
    line-height: 1.6;
    margin-bottom: 2rem;
  }

  .meta {
    margin-bottom: 2rem;
  }

  .instructions {
    color: var(--fg, #fff);
    margin-bottom: 0.5rem;
  }

  .player-count {
    color: var(--fg-muted, #999);
    font-family: monospace;
    margin-top: 0.5rem;
  }

  .related-posts {
    margin-top: 3rem;
    padding-top: 2rem;
    border-top: 1px solid var(--border, #444);
  }

  .related-posts h3 {
    margin-bottom: 1rem;
    color: var(--fg, #fff);
  }

  .related-posts ul {
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .related-posts li {
    margin: 0;
  }

  .related-posts a {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 1rem;
    border: 1px solid var(--border, #444);
    border-radius: 0.5rem;
    text-decoration: none;
    transition: all 0.2s;
  }

  .related-posts a:hover {
    border-color: var(--accent, #8b5cf6);
    background: var(--bg-accent-1, rgba(139, 92, 246, 0.1));
  }

  .post-title {
    color: var(--fg, #fff);
    font-weight: 600;
  }

  .post-description {
    color: var(--fg-muted, #999);
    font-size: 0.9rem;
  }

  .comments-section {
    margin-top: 3rem;
    padding-top: 2rem;
    border-top: 1px solid var(--border, #444);
  }
</style>
