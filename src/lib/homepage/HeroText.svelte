<script lang="ts">
  import { coords, scene_ref } from "$lib/stores/homepage.svelte";

  import { Spring } from "svelte/motion";

  import { onDestroy } from "svelte";

  class RepelAnimation {
    prevX = $state(0);
    prevY = $state(0);
    targetX = $state(0);
    targetY = $state(0);
    targetOpacity = $state(0);
    lastReturnedX = $state(0);
    lastReturnedY = $state(0);
    lastReturnedOpacity = $state(0);
    MAX_DISPLACEMENT = 15;
    MAX_OPACITY = 0.5; // Maximum opacity value
    MOVEMENT_MULTIPLIER = 1;

    constructor(options?: {
      maxDisplacement?: number;
      multiplier?: number;
      maxOpacity?: number;
    }) {
      if (options) {
        this.MAX_DISPLACEMENT = options.maxDisplacement ?? this.MAX_DISPLACEMENT;
        this.MOVEMENT_MULTIPLIER = options.multiplier ?? this.MOVEMENT_MULTIPLIER;
        this.MAX_OPACITY = options.maxOpacity ?? this.MAX_OPACITY;
      }
    }

    set_repel(
      currentX: number,
      currentY: number,
      sceneRef: { width: number; height: number }
    ) {
      // Calculate center point of the scene
      const centerX = sceneRef.width / 2;
      const centerY = sceneRef.height / 2;

      // Calculate distance from center to current mouse position
      const deltaX = currentX - centerX;
      const deltaY = currentY - centerY;

      // Calculate distance from center
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance > 0) {
        // Normalize the direction vector
        const dirX = deltaX / distance;
        const dirY = deltaY / distance;

        // Calculate displacement based on distance from center
        const factor = Math.min(
          distance / (Math.max(sceneRef.width, sceneRef.height) / 4),
          1
        );
        this.targetX = -dirX * this.MAX_DISPLACEMENT * factor * this.MOVEMENT_MULTIPLIER;
        this.targetY = -dirY * this.MAX_DISPLACEMENT * factor * this.MOVEMENT_MULTIPLIER;

        // Calculate opacity based on the same factor
        this.targetOpacity = factor * this.MAX_OPACITY;

        // Only return if we have a meaningful change
        const roundedX = Math.round(this.targetX);
        const roundedY = Math.round(this.targetY);
        const roundedOpacity = Math.round(this.targetOpacity * 100) / 100; // Round to 2 decimal places

        if (
          roundedX !== this.lastReturnedX ||
          roundedY !== this.lastReturnedY ||
          roundedOpacity !== this.lastReturnedOpacity
        ) {
          this.lastReturnedX = roundedX;
          this.lastReturnedY = roundedY;
          this.lastReturnedOpacity = roundedOpacity;

          return {
            x: roundedX,
            y: roundedY,
            opacity: roundedOpacity
          };
        }
      }

      // Update previous position
      this.prevX = currentX;
      this.prevY = currentY;

      return null;
    }

    reset() {
      this.targetX = 0;
      this.targetY = 0;
      this.targetOpacity = 0;
      this.lastReturnedX = 0;
      this.lastReturnedY = 0;
      this.lastReturnedOpacity = 0;
    }
  }

  const repelAnimation = new RepelAnimation({ maxDisplacement: 17, multiplier: 0.8 });
  let repel = new Spring(
    { x: 0, y: 0, opacity: 0 },
    {
      stiffness: 0.07,
      damping: 0.8
    }
  );

  const repelAnimation2 = new RepelAnimation({ maxDisplacement: 17, multiplier: 0.4 });
  let repel2 = new Spring(
    { x: 0, y: 0, opacity: 0 },
    {
      stiffness: 0.07,
      damping: 0.8
    }
  );

  let resetTimeout: number | undefined;

  $effect(() => {
    if (!scene_ref.width || !scene_ref.height) return;
    const repeller = repelAnimation.set_repel(coords.x, coords.y, {
      width: scene_ref.width,
      height: scene_ref.height
    });

    const repeller2 = repelAnimation2.set_repel(coords.x, coords.y, {
      width: scene_ref.width,
      height: scene_ref.height
    });

    if (repeller && repeller2) {
      repel.target = repeller;
      repel2.target = repeller2;
      if (resetTimeout) {
        clearTimeout(resetTimeout);
      }
      resetTimeout = setTimeout(() => {
        repel.target = { x: 0, y: 0, opacity: 0 };
        repel2.target = { x: 0, y: 0, opacity: 0 };
      }, 500) as unknown as number;
    }
  });

  onDestroy(() => {
    if (resetTimeout) {
      clearTimeout(resetTimeout);
    }
  });
</script>

<div class="text">
  <h1>Jovian Moon</h1>
  <div
    class="shadow one big"
    style:transform="translate({repel.current.x}px, {repel.current.y}px)"
    style:opacity={repel.current.opacity / 2}
    aria-hidden="true"
  >
    Jovian Moon
  </div>
  <div
    class="shadow two big"
    style:transform="translate({repel2.current.x}px, {repel2.current.y}px)"
    style:opacity={repel.current.opacity}
    aria-hidden="true"
  >
    Jovian Moon
  </div>
  <div class="tagline">Digital playground of Stephen Gunn</div>
</div>

<style>
  .text {
    position: absolute;
    top: 20%;
    left: 12%;
    z-index: 7;
  }

  h1,
  .big {
    font-size: clamp(3.125rem, 11.547vw + 0.137rem, 9.375rem);
    line-height: 1.2;
    color: white;
  }

  .shadow {
    position: absolute;
    font-weight: 200;
    top: 0;
    left: 0;
    color: var(--accent);
    z-index: -1;
  }
  .shadow.two {
    color: var(--primary);
    z-index: -2;
  }

  .tagline {
    font-family: "Jost", sans-serif;
    font-weight: 300;
    font-size: clamp(1.25rem, 3.125vw + 0.137rem, 2rem);
    position: relative;
    top: -0.5rem;
    left: 10%;
    color: white;
  }
  @media (max-width: 1500px) {
    .text {
      top: 15%;
      left: 10%;
      width: 80%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .tagline {
      position: relative;
      top: initial;
      left: initial;
    }
  }
  @media (max-width: 768px) {
    .text {
      top: 10%;
      gap: 1rem;
    }
  }
</style>
