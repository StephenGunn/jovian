<script lang="ts">
  import { fade } from "svelte/transition";
  import Starfield from "$lib/layout/art/StarField.svelte";
  import { browser } from "$app/environment";

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
  href="https://discord.gg/WDnkErt6"
  onmouseenter={() => (hover = true)}
  onmouseleave={() => (hover = false)}
  bind:this={link}
  onmousemove={handle_mousemove}
>
  <div class="background">
    <div class="image">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"
        ><rect width="256" height="256" fill="none" /><path
          d="M247.51,174.39,218,58a16.08,16.08,0,0,0-13-11.88l-36.06-5.92a16.22,16.22,0,0,0-18.26,11.88l-.21.85a4,4,0,0,0,3.27,4.93,155.62,155.62,0,0,1,24.41,5.62,8.2,8.2,0,0,1,5.62,9.7,8,8,0,0,1-10.19,5.64,155.4,155.4,0,0,0-90.8-.1,8.22,8.22,0,0,1-10.28-4.81,8,8,0,0,1,5.08-10.33,156.85,156.85,0,0,1,24.72-5.72,4,4,0,0,0,3.27-4.93l-.21-.85A16.21,16.21,0,0,0,87.08,40.21L51,46.13A16.08,16.08,0,0,0,38,58L8.49,174.39a15.94,15.94,0,0,0,9.06,18.51l67,29.71a16.17,16.17,0,0,0,21.71-9.1l3.49-9.45a4,4,0,0,0-3.27-5.35,158.13,158.13,0,0,1-28.63-6.2,8.2,8.2,0,0,1-5.61-9.67,8,8,0,0,1,10.2-5.66,155.59,155.59,0,0,0,91.12,0,8,8,0,0,1,10.19,5.65,8.19,8.19,0,0,1-5.61,9.68,157.84,157.84,0,0,1-28.62,6.2,4,4,0,0,0-3.27,5.35l3.49,9.45a16.18,16.18,0,0,0,21.71,9.1l67-29.71A15.94,15.94,0,0,0,247.51,174.39ZM92,152a12,12,0,1,1,12-12A12,12,0,0,1,92,152Zm72,0a12,12,0,1,1,12-12A12,12,0,0,1,164,152Z"
        /></svg
      >
    </div>
    <div class="content">
      If you liked this article and have any questions or comments, I'd love to hear from you! Join my Discord
      server to chat with me and connect with other developers. Just click or tap here to join.
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
      var(--accent),
      #00000000
    )
      "
    ></div>
  {/if}
</a>

<style>
  .stars {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
  }

  svg {
    width: 100%;
    height: 100%;
    fill: var(--bg-accent-3);
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
    background: var(--bg-accent-3);
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
    background: radial-gradient(circle, rgba(24, 23, 29, 1) 0%, rgba(22, 20, 28, 1) 100%), black;
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
