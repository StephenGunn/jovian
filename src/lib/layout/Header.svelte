<script lang="ts">
  import { page } from "$app/state";
  import { afterNavigate } from "$app/navigation";
  import { onMount, tick } from "svelte";
  import HoverGlow from "$lib/layout/HoverGlow.svelte";

  let scroll = $state(0);
  let last_scroll = $state(0);
  let show_header = $state(true);
  let mobile_menu_open = $state(false);

  let hoverBg = $state({ width: 0, height: 0, x: 0, y: 0, opacity: 0, scale: 0.8 });
  let navElement: HTMLElement | undefined = $state();
  let ulElement: HTMLElement | undefined = $state();
  let menuHovered = $state(false);

  const isHomepage = $derived(page.route.id === "/");
  let activeBg = $state({ width: 0, height: 0, x: 0, y: 0, opacity: 0, scale: 0.8 });

  const updateActiveBg = () => {
    const activeLink = ulElement?.querySelector("a.active") as HTMLAnchorElement;
    if (!activeLink || !ulElement) {
      activeBg = { width: 0, height: 0, x: 0, y: 0, opacity: 0, scale: 0.8 };
      return;
    }

    const rect = activeLink.getBoundingClientRect();
    const ulRect = ulElement.getBoundingClientRect();

    activeBg = {
      width: rect.width,
      height: rect.height,
      x: rect.left - ulRect.left,
      y: rect.top - ulRect.top,
      opacity: isHomepage && !menuHovered ? 0 : 1,
      scale: isHomepage && !menuHovered ? 0.8 : 1
    };
  };

  // Update on navigation
  afterNavigate(async () => {
    mobile_menu_open = false;
    // Wait for DOM to update
    await tick();
    updateActiveBg();
  });

  // Update when menu hover changes
  $effect(() => {
    if (menuHovered || !isHomepage) {
      updateActiveBg();
    }
  });

  // Initial positioning on mount
  onMount(async () => {
    await tick();
    updateActiveBg();
  });

  const determine_header_visibility = (scroll: number) => {
    if (scroll > 200 && scroll > last_scroll && show_header === true) {
      show_header = false;
    } else if (scroll < last_scroll && show_header === false) {
      show_header = true;
    }
    last_scroll = scroll;
  };

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

  const handleLinkHover = (e: MouseEvent, isActive: boolean | undefined) => {
    if (!ulElement) return;

    const link = e.currentTarget as HTMLAnchorElement;
    const rect = link.getBoundingClientRect();
    const ulRect = ulElement?.getBoundingClientRect();

    if (ulRect) {
      hoverBg = {
        width: rect.width,
        height: rect.height,
        x: rect.left - ulRect.left,
        y: rect.top - ulRect.top,
        opacity: isActive ? 0 : 1,
        scale: isActive ? 0.8 : 1
      };
    }
  };

  const handleMouseLeave = () => {
    hoverBg.opacity = 0;
    hoverBg.scale = 0.8;
  };
</script>

<svelte:window bind:scrollY={scroll} />
<button
  class="mobile-menu-toggle"
  onclick={() => (mobile_menu_open = !mobile_menu_open)}
  aria-label="Mobile menu toggle"
  class:home={page.route.id === "/"}
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
  <nav
    bind:this={navElement}
    data-sveltekit-preload-code
    class:scrolled={scroll > 100}
    class:hide={!show_header}
    onmouseenter={() => (menuHovered = true)}
    onmouseleave={() => (menuHovered = false)}
  >
    <HoverGlow transparent={scroll <= 100}>
      <ul bind:this={ulElement} onmouseleave={handleMouseLeave}>
        <div class="nav-backgrounds">
          <div
            class="active-bg"
            style="
              width: {activeBg.width}px;
              height: {activeBg.height}px;
              transform: translate({activeBg.x}px, {activeBg.y}px) scale({activeBg.scale});
              opacity: {activeBg.opacity};
            "
          ></div>
          <div
            class="hover-bg"
            style="
              width: {hoverBg.width}px;
              height: {hoverBg.height}px;
              transform: translate({hoverBg.x}px, {hoverBg.y}px) scale({hoverBg.scale});
              opacity: {hoverBg.opacity};
            "
          ></div>
        </div>
        <li>
          <a
            href="/"
            class:active={page.route.id === "/"}
            onmouseenter={(e) => handleLinkHover(e, page.route.id === "/")}>Home</a
          >
        </li>
        <li>
          <a
            href="/posts"
            class:active={page.route?.id?.includes("/posts")}
            onmouseenter={(e) => handleLinkHover(e, page.route?.id?.includes("/posts"))}
            >Posts</a
          >
        </li>
        <li>
          <a
            href="/projects"
            class:active={page.route?.id?.includes("/projects")}
            onmouseenter={(e) =>
              handleLinkHover(e, page.route?.id?.includes("/projects"))}>Projects</a
          >
        </li>
        <li>
          <a
            href="/about"
            class:active={page.route?.id?.includes("/about")}
            onmouseenter={(e) => handleLinkHover(e, page.route?.id?.includes("/about"))}
            >About</a
          >
        </li>
        <li>
          <a
            href="/contact"
            class:active={page.route?.id?.includes("/contact")}
            onmouseenter={(e) => handleLinkHover(e, page.route?.id?.includes("/contact"))}
            >Contact</a
          >
        </li>
      </ul>
    </HoverGlow>
  </nav>
</header>

<style>
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

  nav.hide {
    transform: translateY(-130%);
  }

  nav ul {
    display: flex;
    gap: 0.5rem;
    list-style: none;
    margin: 0;
    padding: 0.5rem;
    position: relative;
    z-index: 1;
  }

  nav a {
    display: block;
    color: white;
    text-decoration: none;
    font-family: "Jost", sans-serif;
    font-size: 1.3rem;
    padding: 0.8rem 1rem;
    margin: 2px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 2rem;
    position: relative;
  }

  nav a.active {
    color: white;
  }

  .nav-backgrounds {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
  }

  .active-bg,
  .hover-bg {
    position: absolute;
    top: 0;
    left: 0;
    border-radius: 2rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: transform, width, height, opacity;
    transform-origin: center;
  }

  .active-bg {
    background: rgba(147, 51, 234, 0.08);
    box-shadow:
      inset 0 0 20px rgba(147, 51, 234, 0.1),
      inset 0 0 40px rgba(255, 255, 255, 0.02);
    backdrop-filter: blur(10px);
  }

  .hover-bg {
    background: rgba(255, 255, 255, 0.05);
    box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(5px);
  }

  @keyframes glowPulse {
    0%,
    100% {
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
  }
  nav a:focus {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
    border-radius: 2rem;
  }

  button.mobile-menu-toggle {
    display: none;
  }

  @media (max-width: 768px) {
    .nav-backgrounds {
      display: none;
    }
    button.mobile-menu-toggle {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 0;
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

    button.hide.mobile-menu-toggle {
      transform: translateY(-200%);
    }

    button.home.mobile-menu-toggle {
      border: none;
      background: none;
    }

    button.open.mobile-menu-toggle {
      border: none;
      background: none;
      outline: none;
    }

    button.mobile-menu-toggle svg {
      width: 2.5rem;
      height: 2.2rem;
      color: var(--secondary);
    }

    button.mobile-menu-toggle svg.open {
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
      align-items: center;
      justify-content: center;
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

    header nav {
      display: flex;
      align-items: center;
      justify-content: center;
      height: auto;
      transform: none;
    }

    header nav ul {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 100%;
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
      background: rgba(147, 51, 234, 0.08);
      border-radius: 1rem;
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
