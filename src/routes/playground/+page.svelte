<script lang="ts">
  import "$lib/css/display_grid.css";
  import { playground_items } from "$lib/data/playground";
  import PlaygroundCard from "./PlaygroundCard.svelte";
  import Seo from "sk-seo";
  import { dev } from "$app/environment";

  const open_graph_image = encodeURI(
    `${dev ? "http://localhost:42069" : "https://jovianmoon.io"}/api/images/pages?title=Playground&link=playground`
  );
</script>

<Seo
  title="Playground - JovianMoon.io"
  description="Experimental projects and interactive experiences."
  imageURL={open_graph_image}
/>

<div class="grid_column">
  <h1>Playground</h1>
  <p class="subtitle">
    A distant echo back to the days of k10k's issues—experimental projects and interactive experiences that don't quite fit as blog posts. Multiplayer demos, visual experiments, and the occasional thing that came to me in a dream.
  </p>

  <ul>
    {#each playground_items as item (item.slug)}
      <li>
        <PlaygroundCard {item} />
      </li>
    {/each}
  </ul>
</div>

<style>
  .subtitle {
    color: var(--fg-muted);
    margin-bottom: 2rem;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
  }

  /* Override grid layout to use single column and center */
  .grid_column ul {
    grid-template-columns: 1fr;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
  }

  .grid_column h1 {
    text-align: center;
  }
</style>
