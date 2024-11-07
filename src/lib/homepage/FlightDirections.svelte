<script lang="ts">
  import { quest } from "$lib/stores/homepage.svelte";
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  let show = $state(false);
  onMount(() => {
    setTimeout(() => {
      show = true;
    }, 5000);
  });
</script>

{#if quest.show && show}
  <div class="quest" transition:fade={{ duration: 500 }}>
    {quest.current()}
  </div>
{/if}

<style>
  .quest {
    position: absolute;
    bottom: 1rem;
    left: 1rem;
    z-index: 10;
    color: white;
    font-size: 0.8rem;
    font-weight: bold;
    letter-spacing: 0.1rem;
    color: var(--semi-transparent);
  }
</style>
