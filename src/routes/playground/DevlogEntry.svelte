<script lang="ts">
  import type { DevlogEntry } from "$lib/data/playground";
  import { blog_update_no_time } from "$lib/dates";

  let { entry }: { entry: DevlogEntry } = $props();
</script>

<div class="devlog-entry">
  <div class="entry-header">
    <h4>{entry.title}</h4>
    <time>{blog_update_no_time(entry.date)}</time>
  </div>
  <p class="entry-description">{entry.description}</p>
  {#if entry.screenshot}
    <div class="entry-screenshot">
      <img src="/images/devlog/{entry.screenshot}" alt={entry.title} />
    </div>
  {/if}
</div>

<style>
  .devlog-entry {
    border-left: 3px solid var(--accent);
    padding-left: 1.5rem;
    margin-bottom: 2rem;
  }

  .entry-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 1rem;
    margin-bottom: 0.5rem;
    flex-wrap: wrap;
  }

  .devlog-entry h4 {
    margin: 0;
    color: var(--fg, #fff);
    font-size: 1.1rem;
  }

  time {
    font-size: 0.85rem;
    color: var(--fg-muted, #999);
    font-family: monospace;
  }

  .entry-description {
    color: var(--fg-muted, #999);
    line-height: 1.6;
    margin-bottom: 1rem;
  }

  .entry-screenshot {
    border-radius: 0.5rem;
    border: 1px solid var(--border, #444);
    max-width: 600px;
    padding: 0.75rem;
    background: var(--bg-accent-1, rgba(0, 0, 0, 0.2));
  }

  .entry-screenshot img {
    width: 100%;
    height: auto;
    display: block;
    border-radius: 0.25rem;
  }
</style>
