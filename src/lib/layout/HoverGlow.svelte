<script lang="ts">
  import { fade } from "svelte/transition";
  import { browser } from "$app/environment";

  import type { Snippet } from "svelte";
  let { children, transparent = false }: { children?: Snippet; transparent?: boolean } =
    $props();

  let link: HTMLDivElement | undefined = $state();
  let mouse = $state({ x: 0, y: 0 });
  let hover = $state(false);
  let glow = $state({ x: "50%", y: "20%" });

  const handle_mousemove = (e: MouseEvent) => {
    if (!link || !browser || !hover) return;
    // use the postion of link to calculate the mouse position
    const rect = link.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;

    // set the glow position
    glow.x = `${(mouse.x / rect.width) * 100}%`;
    glow.y = `${(mouse.y / rect.height) * 100}%`;
  };
</script>

<div
  onmouseenter={() => (hover = true)}
  onmouseleave={() => (hover = false)}
  bind:this={link}
  onmousemove={handle_mousemove}
  transition:fade={{ duration: 200 }}
  role="none"
  class="hover_glow_container"
  class:transparent
>
  <div class="background">
    {#if hover}
      <div
        transition:fade={{ duration: 200 }}
        class="glow"
        style="
    background: radial-gradient(
      circle 200px at
      {glow.x}
      {glow.y},
oklch(82.7% 0.1208 329.2 / 10.3%),
      transparent
    )
      "
      ></div>
      <div
        transition:fade={{ duration: 300 }}
        class="shimmer"
        style="
    background: linear-gradient(
      105deg,
      transparent 40%,
      rgba(255, 255, 255, 0.02) 50%,
      transparent 60%
    );
    transform: translateX({(mouse.x / link?.offsetWidth - 0.5) * 20}px);
      "
      ></div>
    {/if}
    <div class="content">
      {@render children?.()}
    </div>
  </div>
</div>

<style>
  .hover_glow_container {
    color: var(--accent);
    border-radius: 2rem;
    backdrop-filter: blur(5px);
    background: var(--menu);
    position: relative;
    display: flex;
    height: 100%;
    text-decoration: none;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: transform, box-shadow;
  }

  .hover_glow_container.transparent {
    background-color: transparent;
    backdrop-filter: none;
    padding: 0;
    border: none;
  }

  .background {
    overflow: visible;
    border-radius: 2rem;
    position: relative;
    background: radial-gradient(
      circle,
      rgba(24, 23, 29, 0.4) 0%,
      rgba(22, 20, 28, 0.4) 100%
    );
    width: 100%;
    z-index: 1;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(10px);
  }

  .transparent .background {
    background: transparent;
    backdrop-filter: none;
    border: none;
  }

  .hover_glow_container:hover .background {
    background: rgba(24, 23, 29, 0.2);
  }
  .glow {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    border-radius: 2rem;
    z-index: 1;
    pointer-events: none;
  }

  .shimmer {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    z-index: 1;
    pointer-events: none;
    border-radius: 2rem;
    opacity: 0.7;
  }
  .hover_glow_container:hover {
    transition-duration: 200ms;
    transform: translateY(-1px);
    box-shadow:
      0 0 24px rgba(147, 51, 234, 0.12),
      0 10px 40px rgba(0, 0, 0, 0.06),
      inset 0 0 32px rgba(255, 255, 255, 0.02);
  }
  .hover_glow_container .content {
    z-index: 10;
    display: flex;
    flex-flow: column;
    position: relative;
  }
</style>
