<script lang="ts">
  import { T } from "@threlte/core";
  import { FishState } from "./FishState.svelte";

  let { id, country }: { id: string; country: string } = $props();

  // Random starting position in 3D world coordinates
  // Tank is 10 units wide (-5 to 5) and 6 units tall (-3 to 3)
  const randomX = (Math.random() - 0.5) * 10;
  const randomY = (Math.random() - 0.5) * 6;

  const fish_state = new FishState(randomX, randomY);

  // Expose method for parent
  export function swim_to(x: number, y: number) {
    fish_state.swim_to(x, y);
  }
</script>

{#if fish_state.visible}
  <!-- Other fish (3D oval/ellipsoid) -->
  <T.Group position={[fish_state.x, fish_state.y, 0]} rotation={[0, fish_state.facing === 'west' ? Math.PI : 0, 0]}>
    <T.Mesh scale={[0.6, 0.35, 0.25]}>
      <T.SphereGeometry args={[0.5, 32, 16]} />
      <T.MeshStandardMaterial color="#ef4444" opacity={0.9} transparent />
    </T.Mesh>
    <!-- Eye indicators -->
    <T.Mesh position={[0.25, 0.08, 0.12]}>
      <T.SphereGeometry args={[0.04, 8, 8]} />
      <T.MeshBasicMaterial color="#000000" />
    </T.Mesh>
    <T.Mesh position={[0.25, 0.08, -0.12]}>
      <T.SphereGeometry args={[0.04, 8, 8]} />
      <T.MeshBasicMaterial color="#000000" />
    </T.Mesh>
  </T.Group>
{/if}
