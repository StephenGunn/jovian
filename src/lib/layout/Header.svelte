<script lang="ts">
  import { page } from "$app/stores";
  import { afterNavigate } from "$app/navigation";

  let width = $state(0);
  let left = $state(0);
  let scroll = $state(0);
  let last_scroll = $state(0);
  let show_header = $state(true);
  let mobile_menu_open = $state(false);

  afterNavigate(() => {
    setTimeout(() => {
      mobile_menu_open = false;
    }, 500);
  });

  const determine_header_visibility = (scroll: number) => {
    if (scroll > 200 && scroll > last_scroll && show_header === true) {
      show_header = false;
    } else if (scroll < last_scroll && show_header === false) {
      show_header = true;
    }
    last_scroll = scroll;
  };

  $inspect($page);

  $effect(() => {
    determine_header_visibility(scroll);
  });

  $effect(() => {
    // disable scroll when mobile menu is open
    if (mobile_menu_open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
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
    if ($page.route.id === "/") {
      if (!home) return;
      set_underline(home);
    } else if ($page.route.id?.includes("/posts")) {
      if (!posts) return;
      set_underline(posts);
    } else if ($page.route.id?.includes("/projects")) {
      if (!projects) return;
      set_underline(projects);
    } else if ($page.route.id?.includes("/about")) {
      if (!about) return;
      set_underline(about);
    } else if ($page.route.id?.includes("/contact")) {
      if (!contact) return;
      set_underline(contact);
    }
  });
</script>

<svelte:window bind:scrollY={scroll} />
<button
  onclick={() => (mobile_menu_open = !mobile_menu_open)}
  aria-label="Mobile menu toggle"
  class:home={$page.route.id === "/"}
  class:scrolled={scroll > 100}
  class:hide={!show_header}
  class:open={mobile_menu_open}
>
  <svg
    class:open={mobile_menu_open}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <g class="line-group line-1" style="transform-origin: center;">
      <line x1="3" y1="6" x2="21" y2="6"></line>
    </g>
    <g class="line-group line-2" style="transform-origin: center;">
      <line x1="3" y1="12" x2="21" y2="12"></line>
    </g>
    <g class="line-group line-3" style="transform-origin: center;">
      <line x1="3" y1="18" x2="21" y2="18"></line>
    </g>
  </svg>
</button>

<header class:open={mobile_menu_open}>
  <nav class:scrolled={scroll > 100} class:hide={!show_header}>
    <ul>
      <li><a bind:this={home} href="/" class:active={$page.route.id === "/"}>Home</a></li>
      <li>
        <a
          bind:this={posts}
          href="/posts"
          class:active={$page.route?.id?.includes("/posts")}>Posts</a
        >
      </li>
      <li>
        <a
          bind:this={projects}
          href="/projects"
          class:active={$page.route?.id?.includes("/projects")}>Projects</a
        >
      </li>
      <li>
        <a
          bind:this={about}
          href="/about"
          class:active={$page.route?.id?.includes("/about")}>About</a
        >
      </li>
      <li>
        <a
          bind:this={contact}
          href="/contact"
          class:active={$page.route?.id?.includes("/contact")}>Contact</a
        >
      </li>
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

  button {
    display: none;
  }

  @media (max-width: 768px) {
    .underline {
      display: none;
    }
    button {
      display: flex;
      justify-content: center;
      align-items: center;
      position: fixed;
      top: 1.5rem;
      right: 1.5rem;
      width: 3rem;
      height: 3rem;
      z-index: 30;
      outline: 1px solid var(--subtle-highlight);
      background-color: var(--semi-transparent);
      backdrop-filter: blur(3px);
      border: none;
      border-radius: 3px;
      transition: transform 0.3s ease;
      transform: translateY(0);
    }

    button.hide {
      transform: translateY(-200%);
    }

    button.home {
      border: none;
      background: none;
    }

    button.open {
      border: none;
      background: none;
      outline: none;
    }

    button svg {
      width: 2.5rem;
      height: 2.2rem;
      color: var(--secondary);
    }

    button svg.open {
      color: var(--primary);
    }

    .line-group {
      transition:
        transform 0.3s ease,
        opacity 0.3s ease;
      transform-origin: center;
    }

    .line-1 {
      /* Top line */
      transform: rotate(0deg) translate(0, 0);
    }

    .line-2 {
      /* Middle line */
      opacity: 1;
    }

    .line-3 {
      /* Bottom line */
      transform: rotate(0deg) translate(0, 0);
    }

    .open .line-1 {
      /* Rotate top line to 45 degrees */
      transform: rotate(45deg) translate(3px, 3px);
    }

    .open .line-2 {
      /* Hide middle line */
      opacity: 0;
    }

    .open .line-3 {
      /* Rotate bottom line to -45 degrees */
      transform: rotate(-45deg) translate(3px, -3px);
    }
    nav.scrolled {
      outline: none;
      background-color: none;
      backdrop-filter: none;
      background: none;
    }
    nav.hide {
      transform: translateY(0);
    }

    header {
      visibility: hidden;
      opacity: 0;
      transition:
        opacity 0.5s,
        visibility 0s 0.5s; /* Delay visibility change */
      display: flex;
      width: 100vw;
      height: 100vh;
      position: fixed;
      background-color: var(--semi-transparent);
      backdrop-filter: blur(3px);
      overflow: hidden;
      top: 0;
      right: 0;
      z-index: 25;
    }

    header.open {
      visibility: visible;
      opacity: 1;
      transition: opacity 0.5s;
    }

    header nav ul {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
      gap: 1rem;
      list-style: none;
      margin: 0;
      padding: 0 0.5rem;
    }

    header nav a {
      display: block;
      color: white;
      text-decoration: none;
      font-family: "Jost", sans-serif;
      font-size: 2rem;
      padding: 1rem;
      position: relative;
      transition: color 0.3s ease;
    }

    header nav a.active {
      color: var(--primary);
    }

    header nav a::after {
      content: "";
      position: absolute;
      left: 0;
      bottom: 0;
      width: 0;
      height: 2px;
      background-color: var(--secondary);
      transition: width 0.3s ease;
    }

    header nav a.active::after {
      width: 100%;
    }

    header nav ul li {
      opacity: 0;
      transform: translateY(20px);
      transition:
        opacity 0.5s ease,
        transform 0.5s ease;
    }

    header.open nav ul li {
      opacity: 1;
      transform: translateY(0);
    }

    /* Apply staggered delay for entrance */
    header.open nav ul li:nth-child(1) {
      transition-delay: 0.1s;
    }
    header.open nav ul li:nth-child(2) {
      transition-delay: 0.2s;
    }
    header.open nav ul li:nth-child(3) {
      transition-delay: 0.3s;
    }
    header.open nav ul li:nth-child(4) {
      transition-delay: 0.4s;
    }
    header.open nav ul li:nth-child(5) {
      transition-delay: 0.5s;
    }
  }
</style>
