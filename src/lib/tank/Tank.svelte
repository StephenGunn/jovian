<script lang="ts">
  import { onMount } from "svelte";
  import Fish from "./Fish.svelte";

  let { broadcast_movement, children }: any = $props();

  let tank_ref: HTMLDivElement;
  let fish: any;

  function handle_click(event: MouseEvent) {
    const rect = tank_ref.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Move our fish and broadcast to others
    fish?.swim_to(x, y);
    broadcast_movement(x, y);
  }

  function handle_keydown(event: KeyboardEvent) {
    // Allow interaction via Enter or Space key
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      // Random position on keypress
      const rect = tank_ref.getBoundingClientRect();
      const x = Math.random() * rect.width;
      const y = Math.random() * rect.height;
      fish?.swim_to(x, y);
      broadcast_movement(x, y);
    }
  }

  onMount(() => {
    // Position fish in center on mount
    const rect = tank_ref.getBoundingClientRect();
    fish?.set_position(rect.width / 2, rect.height / 2);
  });

  // Expose method for parent to get tank dimensions
  export function getBoundingClientRect() {
    return tank_ref?.getBoundingClientRect();
  }
</script>

<div class="tank-container" bind:this={tank_ref} onclick={handle_click} onkeydown={handle_keydown} role="button" tabindex="0">
  <svg class="tank-svg" width="100%" height="100%">
    <!-- Our fish -->
    <Fish bind:this={fish} />

    <!-- Other players' fish -->
    {@render children()}
  </svg>
</div>

<style>
  .tank-container {
    width: 100%;
    height: 70vh;
    min-height: 600px;
    background: var(--background);
    position: relative;
    cursor: crosshair;
    overflow: hidden;
    border: 2px solid var(--border, #444);
    border-radius: 0.5rem;
  }

  .tank-svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
</style>
