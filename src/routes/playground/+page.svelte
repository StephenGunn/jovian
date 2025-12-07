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
  <p class="subtitle">Experimental projects and interactive experiences.</p>

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
  }

  /* Override grid layout to use single column */
  .grid_column ul {
    grid-template-columns: 1fr;
    max-width: 800px;
  }
</style>
