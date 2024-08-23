<script lang="ts">
  import { page } from "$app/stores";

  $inspect(page);

  let width = $state(0);
  let left = $state(0);
  let scroll = $state(0);

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

  $inspect($page);
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
  <nav class:scrolled={scroll > 100}>
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
    background-color: rgba(255, 255, 255, 0.1);
    z-index: 10;
    transition: all 200ms ease-in-out;
  }
  header {
    position: fixed;
    top: 1rem;
    left: 0;
    width: 100%;
    display: flex;
    justify-content: center;
    z-index: 20;
  }

  nav {
    position: relative;
    padding: 0 1rem;
    border-radius: 2rem;
  }

  nav.scrolled {
    outline: 1px solid rgba(255, 255, 255, 0.1);
    background-color: rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
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
