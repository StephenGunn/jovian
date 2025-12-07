<script lang="ts">
  import { FishState } from "./FishState.svelte";
  import { fade } from "svelte/transition";

  let { id, country }: { id: string; country: string } = $props();

  // Random starting position
  const randomX = Math.random() * 800; // Approximate tank width
  const randomY = Math.random() * 400; // Approximate tank height

  const fish_state = new FishState(randomX, randomY);

  // Expose method for parent
  export function swim_to(x: number, y: number) {
    fish_state.swim_to(x, y);
  }
</script>

{#if fish_state.visible}
  <!-- Other fish (smaller, different color) -->
  <!-- Flip horizontally when facing west -->
  <g
    transform="translate({fish_state.x}, {fish_state.y}) scale({fish_state.facing === 'west' ? -1 : 1}, 1)"
    transition:fade
  >
    <circle cx="0" cy="0" r="12" fill="#ef4444" opacity="0.6" />
  </g>
{/if}
