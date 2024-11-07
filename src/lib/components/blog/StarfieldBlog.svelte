<script lang="ts">
  import StarField from "$lib/layout/art/StarField.svelte";
  let count = $state(0);
</script>

<div class="comp">
  <div class="starfield">
    {#key count}
      <StarField />
    {/key}
  </div>
  <button onclick={() => (count += 1)}>Rerender & Randomize</button>
</div>

<style>
  .comp {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    gap: 1.5rem;
  }

  .starfield {
    width: 100%;
    aspect-ratio: 16 / 9;
    overflow: hidden;
    position: relative;
    border-radius: 1rem;
    border: 1px solid var(--bg-accent-3);
  }

  @media (max-width: 800px) {
    .starfield {
      aspect-ratio: 1 / 2;
    }
  }
</style>
