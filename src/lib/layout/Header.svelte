<script lang="ts">
  import { page } from "$app/stores";

  let width = $state(0);
  let left = $state(0);
  let scroll = $state(0);
  let last_scroll = $state(0);
  let show_header = $state(true);

  const determine_header_visibility = (scroll: number) => {
    if (scroll > last_scroll && show_header === true) {
      show_header = false;
    } else if (scroll < last_scroll && show_header === false) {
      show_header = true;
    }
    last_scroll = scroll;
  };

  $inspect(show_header, "show_header");

  $effect(() => {
    determine_header_visibility(scroll);
  });

  let home: HTMLAnchorElement | undefined = $state();
  let posts: HTMLAnchorElement | undefined = $state();
  let projects: HTMLAnchorElement | undefined = $state();
  let about: HTMLAnchorElement | undefined = $state();
  let contact: HTMLAnchorElement | undefined = $state();

  const set_underline = (menu_item: HTMLAnchorElement) => {
    const { offsetWidth, offsetLeft } = menu_item;
    width = offsetWidth;
    left = offsetLeft;
  };

  $effect(() => {
    switch ($page.route.id) {
      case "/":
        if (!home) return;
        set_underline(home);
        break;
      case "/posts":
        if (!posts) return;
        set_underline(posts);
        break;
      case "/projects":
        if (!projects) return;
        set_underline(projects);
        break;
      case "/about":
        if (!about) return;
        set_underline(about);
        break;
      case "/contact":
        if (!contact) return;
        set_underline(contact);
        break;
    }
  });
</script>

<svelte:window bind:scrollY={scroll} />
<header>
  <nav class:scrolled={scroll > 100} class:hide={!show_header}>
    <ul>
      <li><a bind:this={home} href="/">Home</a></li>
      <li><a bind:this={posts} href="/posts">Posts</a></li>
      <li><a bind:this={projects} href="/projects">Projects</a></li>
      <li><a bind:this={about} href="/about">About</a></li>
      <li><a bind:this={contact} href="/contact">Contact</a></li>
    </ul>
    <div class="underline" style:left="{left}px" style:width="{width}px"></div>
  </nav>
</header>

<style>
  .underline {
    position: absolute;
    bottom: 2px;
    height: 3px;
    background-color: var(--bg-accent-3);
    z-index: 10;
    transition: all 200ms ease-in-out;
  }
  header {
    position: fixed;
    top: 1rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    justify-content: center;
    z-index: 20;
  }

  nav {
    position: relative;
    padding: 0 1rem;
    border-radius: 2rem;
    transition: all 200ms ease-in-out;
  }

  nav.scrolled {
    outline: 1px solid var(--subtle-highlight);
    background-color: var(--semi-transparent);
    backdrop-filter: blur(3px);
  }

  nav.hide {
    transform: translateY(-130%);
  }

  nav ul {
    display: flex;
    gap: 1rem;
    list-style: none;
    margin: 0;
    padding: 0 0.5rem;
  }

  nav a {
    display: block;
    color: white;
    text-decoration: none;
    font-family: "Jost", sans-serif;
    font-size: 1.3rem;
    padding: 1rem;
    transition: background-color 0.5s;
  }
</style>
