<script lang="ts">
  import { fade } from "svelte/transition";
  import Starfield from "$lib/layout/art/StarField.svelte";
  import { browser } from "$app/environment";

  let link: HTMLAnchorElement | undefined = $state();
  let mouse = $state({ x: 0, y: 0 });
  let hover = $state(false);
  let glow = $state({ x: "50%", y: "20%" });
  let { placement }: { placement: string } = $props();

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

  /* the butterfly is sourced from https://flutterby.philhawksworth.dev/ */
</script>

<a
  target="_blank"
  rel="noopener noreferrer"
  href="https://bsky.app/profile/jovianmoon.io"
  onmouseenter={() => (hover = true)}
  onmouseleave={() => (hover = false)}
  bind:this={link}
  onmousemove={handle_mousemove}
  class="bluesky-flutter"
>
  <div class="background">
    <div class="image">
      <svg
        id="flutterby"
        class="bluesky-flutter"
        viewBox="0 0 566 500"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <path
            id="wing"
            fill="currentColor"
            d="M 123.244 35.008 C 188.248 83.809 283.836 176.879 283.836 235.857 C 283.836 316.899 283.879 235.845 283.836 376.038 C 283.889 375.995 282.67 376.544 280.212 383.758 C 266.806 423.111 214.487 576.685 94.841 453.913 C 31.843 389.269 61.013 324.625 175.682 305.108 C 110.08 316.274 36.332 297.827 16.093 225.504 C 10.271 204.699 0.343 76.56 0.343 59.246 C 0.343 -27.451 76.342 -0.206 123.244 35.008 Z"
          />
        </defs>
        <use xlink:href="#wing" class="left" />
        <use xlink:href="#wing" class="right" />
      </svg>
    </div>
    <div class="content">
      If you liked this {placement} and have any questions or comments, I'd love to hear from
      you! You can reach my on BlueSky.
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
      #6ea5ff,
      #00000000
    )
      "
    ></div>
  {/if}
</a>

<style>
  .bluesky-flutter svg {
    width: 5rem;
    height: 4rem;
    transition: 200ms;
  }

  .bluesky-flutter .left {
    transform-origin: center;
  }
  .bluesky-flutter .right {
    transform-origin: center;
    transform: scale(-1, 1);
  }
  .bluesky-flutter:hover .left,
  .bluesky-flutter:focus .left {
    animation: flutter 430ms ease-in-out;
    --flip: 1;
  }
  .bluesky-flutter:hover .right,
  .bluesky-flutter:focus .right {
    animation: flutter 500ms ease-in-out;
    --flip: -1;
  }
  .bluesky-flutter:hover svg,
  .bluesky-flutter:focus svg {
    transform: rotate(-5deg);
    transition: 500ms;
  }

  @media (prefers-reduced-motion) {
    .bluesky-flutter:hover .left,
    .bluesky-flutter:focus .left,
    .bluesky-flutter:hover .right,
    .bluesky-flutter:focus .right {
      animation: none;
    }
  }

  @keyframes flutter {
    10% {
      transform: scale(calc(var(--flip) * 1), 0.9);
    }
    20% {
      transform: scale(calc(var(--flip) * 0.5), 1);
    }
    40% {
      transform: scale(calc(var(--flip) * 0.9), 0.95);
    }
    60% {
      transform: scale(calc(var(--flip) * 0.3), 1);
    }
    80% {
      transform: scale(calc(var(--flip) * 0.9), 0.95);
    }
    100% {
      transform: scale(calc(var(--flip) * 1), 1);
    }
  }

  .stars {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
  }

  .image {
    flex-grow: 0;
  }
  .content {
    flex-grow: 1;
  }
  a {
    color: var(--white);
    border-radius: 0.5rem;
    padding: 2px;
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
  a:hover {
    transition-duration: 150ms;
    box-shadow: 0 5px 20px 5px #00000044;
  }
  a .content {
    z-index: 2;
  }
</style>
