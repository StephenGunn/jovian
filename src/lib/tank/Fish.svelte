<script lang="ts">
  import { FishState } from "./FishState.svelte";

  const fish_state = new FishState();

  // Expose methods for parent
  export function swim_to(x: number, y: number) {
    fish_state.swim_to(x, y);
  }

  export function set_position(x: number, y: number) {
    fish_state.set_position(x, y);
  }
</script>

<!-- Your fish (bigger, different color) -->
<!-- Flip horizontally when facing west -->
<g transform="translate({fish_state.x}, {fish_state.y}) scale({fish_state.facing === 'west' ? -1 : 1}, 1)">
  <circle cx="0" cy="0" r="15" fill="#3b82f6" opacity="0.8" />
</g>
