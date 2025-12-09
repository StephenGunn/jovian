<script lang="ts">
  import { T } from "@threlte/core";
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

<!-- Your fish (3D oval/ellipsoid) -->
<T.Group position={[fish_state.x, fish_state.y, 0]} rotation={[0, fish_state.facing === 'west' ? Math.PI : 0, 0]}>
  <T.Mesh scale={[0.7, 0.4, 0.3]}>
    <T.SphereGeometry args={[0.5, 32, 16]} />
    <T.MeshStandardMaterial color="#3b82f6" />
  </T.Mesh>
  <!-- Eye indicators for directionality -->
  <T.Mesh position={[0.3, 0.1, 0.15]}>
    <T.SphereGeometry args={[0.05, 8, 8]} />
    <T.MeshBasicMaterial color="#000000" />
  </T.Mesh>
  <T.Mesh position={[0.3, 0.1, -0.15]}>
    <T.SphereGeometry args={[0.05, 8, 8]} />
    <T.MeshBasicMaterial color="#000000" />
  </T.Mesh>
</T.Group>
