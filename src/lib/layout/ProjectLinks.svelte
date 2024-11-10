<script lang="ts">
  const { repo, link }: { repo?: string; link?: string } = $props();
  import { fade } from "svelte/transition";
  import Starfield from "$lib/layout/art/StarField.svelte";
  import { browser } from "$app/environment";

  let box: HTMLElement | undefined = $state();
  let mouse = $state({ x: 0, y: 0 });
  let hover = $state(false);
  let glow = $state({ x: "50%", y: "20%" });

  const handle_mousemove = (e: MouseEvent) => {
    if (!box || !browser || !hover) return;
    // use the postion of link to calculate the mouse position
    const rect = box.getBoundingClientRect();
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
  onmousemove={handle_mousemove}
  bind:this={box}
  role="button"
  tabindex="0"
  class="links"
>
  <div class="background">
    <div class="as">
      {#if repo}
        <a href={repo} target="_blank" rel="noopener noreferrer">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"
            ><rect width="256" height="256" fill="none" /><path
              d="M119.83,56A52,52,0,0,0,76,32a51.92,51.92,0,0,0-3.49,44.7A49.28,49.28,0,0,0,64,104v8a48,48,0,0,0,48,48h48a48,48,0,0,0,48-48v-8a49.28,49.28,0,0,0-8.51-27.3A51.92,51.92,0,0,0,196,32a52,52,0,0,0-43.83,24Z"
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="16"
            /><path
              d="M104,232V192a32,32,0,0,1,32-32h0a32,32,0,0,1,32,32v40"
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="16"
            /><path
              d="M104,208H72a32,32,0,0,1-32-32A32,32,0,0,0,8,144"
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="16"
            /></svg
          >
          Github Repository</a
        >
      {/if}
      {#if link}
        <a href={link} target="_blank" rel="noopener noreferrer">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"
            ><rect width="256" height="256" fill="none" /><polyline
              points="216 104 215.99 40.01 152 40"
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="16"
            /><line
              x1="136"
              y1="120"
              x2="216"
              y2="40"
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="16"
            /><path
              d="M184,136v72a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V80a8,8,0,0,1,8-8h72"
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="16"
            /></svg
          >
          Live Project
        </a>
      {/if}
    </div>

    {#if hover}
      <div
        transition:fade={{ duration: 200 }}
        class="glow"
        style="
    background-image: radial-gradient(
      circle at
      {glow.x}
      {glow.y},
      #ffffff0f,
      #00000000
    )
      "
      ></div>
    {/if}
    <div class="stars">
      <Starfield />
    </div>
  </div>
  {#if hover}
    <div
      transition:fade={{ duration: 200 }}
      class="glow_border"
      style="
    background-image: radial-gradient(
      circle at
      {glow.x} 
      {glow.y},
      #eb5967,
      #00000000
    )
      "
    ></div>
  {/if}
</div>

<style>
  .stars {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
  }

  .as {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .as a {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--white);
    text-decoration: none;
  }

  .as a:hover {
    color: var(--accent);
  }

  .as a:hover svg {
    color: var(--highlight);
  }

  .as a::before,
  .as a::after {
    display: none !important;
  }

  .as a svg {
    width: 2.5rem;
    height: 2.5rem;
    color: var(--accent);
  }

  .links {
    color: var(--white);
    border-radius: 0.5rem;
    padding: 2px !important;
    background: var(--bg-accent-2);
    position: relative;
    display: block;
    text-decoration: none;
    overflow: hidden;
  }
  .background {
    overflow: hidden;
    border-radius: 0.45rem;
    gap: 1.5rem;
    position: relative;
    align-items: center;
    background: radial-gradient(circle, rgba(24, 23, 29, 1) 0%, rgba(22, 20, 28, 1) 100%),
      black;
    text-decoration: none;
    display: flex;
    padding: 1rem;
    z-index: 1;
  }
  .glow {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
  }

  .glow_border {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    z-index: 0;
  }
  .links:hover {
    transition-duration: 150ms;
    box-shadow: 0 5px 20px 5px #00000044;
  }
</style>
