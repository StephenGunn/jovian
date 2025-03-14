<script lang="ts">
  import { fade } from "svelte/transition";
  import type { Post } from "$lib/types/schema";
  import Starfield from "$lib/layout/art/StarField.svelte";
  import { blog_update_no_time, blog_update_time_since } from "$lib/dates";
  import { browser } from "$app/environment";
  import { generate_starfield } from "$lib/layout/generate_starfield.svelte";
  const { post }: { post: Post } = $props();

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
</script>

<a
  href="/posts/{post.slug}"
  onmouseenter={() => (hover = true)}
  onmouseleave={() => (hover = false)}
  bind:this={link}
  onmousemove={handle_mousemove}
  transition:fade={{ duration: 200 }}
>
  <div class="background">
    <div class="content">
      <div class="title">
        {post.title}
      </div>
      <div class="date">
        <span>
          {#if post.updated}
            updated
          {:else}
            posted
          {/if}
          {blog_update_no_time(post.updated ?? post.date)}</span
        >
        <span>
          {blog_update_time_since(post.updated ?? post.date)}
        </span>
      </div>
      <div class="desc">
        {post.description}
      </div>
      <div class="categories">
        {#each post.categories as category}
          <span>{category}</span>
        {/each}
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
    <Starfield stars={generate_starfield()} />
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
      var(--accent),
      #00000000
    )
      "
    ></div>
  {/if}
</a>

<style>
  a {
    color: var(--accent);
    border-radius: 0.5rem;
    padding: 2px;
    background: var(--bg-accent-2);
    position: relative;
    display: flex;
    height: 100%;
    text-decoration: none;
    overflow: hidden;
  }
  a:focus {
    outline: 2px solid var(--accent);
  }
  .background {
    overflow: hidden;
    border-radius: 0.45rem;
    gap: 0.25rem;
    position: relative;
    flex-flow: column;
    background: radial-gradient(circle, rgba(24, 23, 29, 1) 0%, rgba(22, 20, 28, 1) 100%),
      black;
    text-decoration: none;
    display: flex;
    width: 100%;
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
    display: flex;
    flex-flow: column;
  }
  a .title {
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--font-color);
    margin-bottom: 0.5rem;
    padding: 1rem 1.5rem;
    min-height: 8rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid var(--bg-accent-1);
    text-align: center;
    text-wrap: balance;
  }

  a .date {
    display: flex;
    justify-content: space-between;
    font-size: 80%;
    align-items: center;
    gap: 1.5rem;
    color: var(--accent);
    padding: 1rem;
  }
  a .desc {
    padding: 0rem 1rem;
    font-size: 1rem;
    color: var(--font-color);
    flex-grow: 1;
  }

  a .categories {
    display: flex;
    align-items: center;
    gap: 1.2rem;
    padding: 1rem;
    font-size: 80%;
    color: var(--primary);
    flex-wrap: wrap;
    font-weight: bold;
  }

  a .categories span {
    position: relative;
    white-space: nowrap;
  }

  a .categories span::before {
    content: "";
    position: absolute;
    width: 120%;
    height: 110%;
    background: var(--semi-transparent);
    left: -10%;
    top: -5%;
    z-index: -1;
    border-radius: 0.25rem;
  }

  .categories span:nth-of-type(odd)::before {
    transform: rotate(-1deg);
  }

  .categories span:nth-of-type(even)::before {
    transform: rotate(1deg);
  }
</style>
