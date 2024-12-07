<script lang="ts">
  import { fade } from "svelte/transition";
  import StarField from "$lib/layout/art/StarField.svelte";
  import { generate_starfield } from "$lib/layout/generate_starfield.svelte";
  import { browser } from "$app/environment";

  let {
    href,
    likes,
    reposts,
    replies
  }: {
    href: string;
    likes: number;
    reposts: number;
    replies: number;
  } = $props();

  let link: HTMLAnchorElement | undefined = $state();
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

  /* the butterfly is sourced from https://flutterby.philhawksworth.dev/ */
</script>

<a
  target="_blank"
  rel="noopener noreferrer"
  {href}
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
      If you'd like to comment, like, or share this post, just click here to open its
      corresponding BlueSky thread!

      <div class="bsky_report">
        <span class="like-stats box">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            class="icon-large"
            class:active={likes > 0}
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
            />
          </svg>
          <span>
            {likes ?? 0}
            likes
          </span>
        </span>
        <span class="repost-stats box">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            class="icon-large"
            fill="none"
            stroke="currentColor"
            class:active={reposts > 0}
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3"
            />
          </svg>
          <span class="margin-left-small">
            {reposts ?? 0}
            reposts
          </span>
        </span>
        <span class="reply-stats box">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            class="icon-large"
            class:active={replies > 0}
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z"
            />
          </svg>
          <span class="margin-left-small">
            {replies ?? 0}
            replies
          </span>
        </span>
      </div>
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
      <StarField stars={generate_starfield()} />
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
  .bluesky-flutter .bsky_report {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 300px;
    padding: 0.5rem;
    border-radius: 0.5rem;
    background-color: var(--color-bg);
    color: var(--muted-color);
    border: 1px solid var(--color-border);
    margin-top: 1rem;
    text-decoration: none;
    font-size: 0.8rem;
  }

  .bluesky-flutter .bsky_report .box {
    display: flex;
    flex-flow: column;
    align-items: center;
    gap: 0.5rem;
  }

  .bluesky-flutter .bsky_report svg {
    width: 1.2rem;
    height: 1.2rem;
    color: var(--subtle-highlight);
    fill: currentColor;
  }

  .bluesky-flutter .bsky_report .repost-stats svg {
    fill: none;
  }

  .bluesky-flutter .bsky_report svg.active {
    color: var(--accent);
  }
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
