<script lang="ts">
  import { onMount } from "svelte";
  import { Canvas, T } from "@threlte/core";
  import Fish from "./Fish.svelte";

  let { broadcast_movement, children }: any = $props();

  let tank_ref: HTMLDivElement;
  let fish: any;

  // Tank dimensions in 3D world units
  const TANK_WIDTH = 20;
  const TANK_HEIGHT = 12;

  function handle_click(event: MouseEvent) {
    if (!tank_ref) return;

    const rect = tank_ref.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Convert pixel coordinates to 3D world coordinates
    const worldX = (x / rect.width) * TANK_WIDTH - TANK_WIDTH / 2;
    const worldY = -(y / rect.height) * TANK_HEIGHT + TANK_HEIGHT / 2;

    // Move our fish and broadcast to others
    fish?.swim_to(worldX, worldY);
    broadcast_movement(x, y);
  }

  function handle_keydown(event: KeyboardEvent) {
    // Allow interaction via Enter or Space key
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      // Random position on keypress
      const rect = tank_ref.getBoundingClientRect();
      const x = Math.random() * rect.width;
      const y = Math.random() * rect.height;

      const worldX = (x / rect.width) * TANK_WIDTH - TANK_WIDTH / 2;
      const worldY = -(y / rect.height) * TANK_HEIGHT + TANK_HEIGHT / 2;

      fish?.swim_to(worldX, worldY);
      broadcast_movement(x, y);
    }
  }

  onMount(() => {
    // Position fish in center on mount (world coordinates)
    fish?.set_position(0, 0);
  });

  // Expose method for parent to get tank dimensions
  export function getBoundingClientRect() {
    return tank_ref?.getBoundingClientRect();
  }
</script>

<div
  class="tank-container"
  bind:this={tank_ref}
  onclick={handle_click}
  onkeydown={handle_keydown}
  role="button"
  tabindex="0"
>
  <Canvas>
    <!-- Camera setup for side-view aquarium - zoomed in to fill screen -->
    <T.PerspectiveCamera makeDefault position={[0, 0, 12]} fov={75} />

    <!-- Lighting -->
    <T.AmbientLight intensity={0.8} />
    <T.DirectionalLight position={[5, 5, 5]} intensity={1} />

    <!-- Background (water color) - larger to fill entire view -->
    <T.Mesh position={[0, 0, -5]}>
      <T.PlaneGeometry args={[TANK_WIDTH * 2, TANK_HEIGHT * 2]} />
      <T.MeshBasicMaterial color="#1e3a5f" />
    </T.Mesh>

    <!-- Tank floor (gravel) -->
    <T.Mesh position={[0, -TANK_HEIGHT / 2, -4.9]} rotation={[-0.1, 0, 0]}>
      <T.PlaneGeometry args={[TANK_WIDTH, 1.5]} />
      <T.MeshStandardMaterial color="#8b7355" roughness={0.9} />
    </T.Mesh>

    <!-- Decorations: Rocks -->
    <T.Mesh position={[-6, -5, 0]} rotation={[0.2, 0.3, 0.1]}>
      <T.DodecahedronGeometry args={[0.8, 0]} />
      <T.MeshStandardMaterial color="#5a5a5a" roughness={0.8} />
    </T.Mesh>
    <T.Mesh position={[7, -5.2, 0.2]} rotation={[0.5, 0.8, 0.2]}>
      <T.DodecahedronGeometry args={[0.6, 0]} />
      <T.MeshStandardMaterial color="#6a6a6a" roughness={0.8} />
    </T.Mesh>
    <T.Mesh position={[-8, -5.4, -0.5]} rotation={[0.3, 1.2, 0.4]}>
      <T.DodecahedronGeometry args={[0.7, 0]} />
      <T.MeshStandardMaterial color="#4a4a4a" roughness={0.8} />
    </T.Mesh>
    <T.Mesh position={[2, -5.1, 0.3]} rotation={[0.4, 0.6, 0.3]}>
      <T.DodecahedronGeometry args={[0.5, 0]} />
      <T.MeshStandardMaterial color="#656565" roughness={0.8} />
    </T.Mesh>

    <!-- Decorations: Simple plants -->
    <T.Group position={[-4, -4.6, 0.5]}>
      <T.Mesh position={[0, 1, 0]} scale={[0.15, 2, 0.15]}>
        <T.CylinderGeometry args={[1, 0.5, 1, 8]} />
        <T.MeshStandardMaterial color="#2d5f3f" />
      </T.Mesh>
      <T.Mesh position={[0, 1.8, 0]} scale={[0.6, 0.6, 0.6]}>
        <T.SphereGeometry args={[0.5, 8, 8]} />
        <T.MeshStandardMaterial color="#3a7a4f" />
      </T.Mesh>
    </T.Group>
    <T.Group position={[5, -4.8, -0.3]}>
      <T.Mesh position={[0, 0.8, 0]} scale={[0.12, 1.6, 0.12]}>
        <T.CylinderGeometry args={[1, 0.5, 1, 8]} />
        <T.MeshStandardMaterial color="#2d5f3f" />
      </T.Mesh>
      <T.Mesh position={[0, 1.4, 0]} scale={[0.5, 0.5, 0.5]}>
        <T.SphereGeometry args={[0.5, 8, 8]} />
        <T.MeshStandardMaterial color="#3a7a4f" />
      </T.Mesh>
    </T.Group>
    <T.Group position={[-7, -4.7, 0.8]}>
      <T.Mesh position={[0, 1.2, 0]} scale={[0.1, 2.4, 0.1]}>
        <T.CylinderGeometry args={[1, 0.5, 1, 8]} />
        <T.MeshStandardMaterial color="#2d5f3f" />
      </T.Mesh>
      <T.Mesh position={[0, 2.2, 0]} scale={[0.4, 0.4, 0.4]}>
        <T.SphereGeometry args={[0.5, 8, 8]} />
        <T.MeshStandardMaterial color="#3a7a4f" />
      </T.Mesh>
    </T.Group>

    <!-- Our fish -->
    <Fish bind:this={fish} />

    <!-- Other players' fish -->
    {@render children()}
  </Canvas>
</div>

<style>
  .tank-container {
    width: 100%;
    aspect-ratio: 16 / 9;
    max-height: 70vh;
    background: var(--background);
    position: relative;
    cursor: crosshair;
    overflow: hidden;
    border-radius: 1rem;
    border-bottom: 4px solid transparent;
    background-image:
      linear-gradient(var(--background), var(--background)),
      linear-gradient(90deg, #8b7355, #d4a574, #8b7355);
    background-origin: padding-box, border-box;
    background-clip: padding-box, border-box;
  }
</style>
