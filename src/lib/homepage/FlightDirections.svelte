<script lang="ts">
  import { directions } from "$lib/stores/homepage.svelte";
</script>

{#if directions.show}
  <div class="help">
    {directions.current()}
  </div>
{/if}

<style>
  .help {
    position: absolute;
    bottom: 1rem;
    left: 1rem;
    z-index: 10;
    color: white;
    font-size: 0.8rem;
    font-weight: bold;
    letter-spacing: 0.1rem;
    color: rgba(0, 0, 0, 0.8);
  }
</style>
