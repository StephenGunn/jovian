<script lang="ts">
  import { onMount } from "svelte";
  let TOC = $state("");
  let activeId = $state("");
  let isMobile = $state(false);

  const checkIsMobile = () => {
    isMobile = window.innerWidth < 768;
  };

  const generate_table_of_contents = () => {
    const headers = document.querySelectorAll("h2, h3, h4, h5, h6");
    let table_of_contents = "<ul>";
    headers.forEach((header) => {
      const id = header.id;
      const tag = header.tagName;
      const text = header.textContent;
      if (id && tag) {
        const level = parseInt(tag.substring(1)) - 2; // H2 = level 0, H3 = level 1, etc.
        const indent = level > 0 ? `style="margin-left: ${level * 1.2}rem"` : "";

        // Add SVG icons, which will be conditionally styled based on active state
        const chevronIcon = `<span class="icon ${id === activeId ? "active" : ""}" data-id="${id}">
          ${
            isMobile
              ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"/><polyline points="136 168 88 216 40 168" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><polyline points="232 72 88 72 88 216" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></svg>'
              : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" fill="none"/><polyline points="200 208 120 128 200 48" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><polyline points="120 208 40 128 120 48" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></svg>'
          }
        </span>`;

        table_of_contents += `<li ${indent}>${chevronIcon}<a href="#${id}" class="${id === activeId ? "active" : ""}" data-id="${id}">${text}</a></li>`;
      }
    });
    table_of_contents += "</ul>";
    return table_of_contents;
  };

  const handleScroll = () => {
    const headers = document.querySelectorAll("h2, h3, h4, h5, h6");

    // Find the current active header based on scroll position
    for (let i = headers.length - 1; i >= 0; i--) {
      const header = headers[i] as HTMLElement;
      // Account for scroll-margin-top: 120px in the document
      if (header.getBoundingClientRect().top <= 121) {
        if (header.id !== activeId) {
          activeId = header.id;
          TOC = generate_table_of_contents(); // Regenerate TOC with new active state
        }
        break;
      }
    }
  };

  onMount(() => {
    checkIsMobile();
    TOC = generate_table_of_contents();

    // Add event listeners
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", () => {
      checkIsMobile();
      TOC = generate_table_of_contents();
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", checkIsMobile);
    };
  });
</script>

{#if TOC !== ""}
  <aside>
    <section class="toc">
      <div class="title">Table of contents</div>
      <div class="toc-container">
        {@html TOC}
      </div>
    </section>
  </aside>
{/if}

<style>
  aside {
    margin-top: 2rem;
    padding-right: 1rem;
  }

  section {
    position: sticky;
    top: 2rem;
    z-index: 15;
  }

  .title {
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--font-color);
    margin-bottom: 0.5rem;
  }

  .toc-container {
    max-height: 85vh;
    overflow-y: auto;
    padding-right: 0.5rem;
    /* Use theme variables for scrollbar styling */
    scrollbar-width: thin;
    scrollbar-color: var(--accent) transparent;
  }

  .toc-container::-webkit-scrollbar {
    width: 6px;
  }

  .toc-container::-webkit-scrollbar-track {
    background: transparent;
  }

  .toc-container::-webkit-scrollbar-thumb {
    background-color: var(--accent);
    border-radius: 3px;
  }

  :global(.toc ul) {
    list-style: none;
    padding-left: 0;
    margin: 0;
  }

  :global(.toc li) {
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
  }

  :global(.toc a) {
    text-decoration: none;
    color: var(--font-color);
    transition: all 0.2s ease;
    font-size: 0.8rem;
    flex: 1;
  }

  :global(.toc a.active) {
    opacity: 1;
    font-weight: 600;
    color: var(--accent);
  }

  :global(.toc .icon) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 12px;
    height: 12px;
    margin-right: 0.5rem;
    color: var(--secondary);
    opacity: 0.7;
  }

  :global(.toc .icon.active) {
    opacity: 1;
    color: var(--accent);
  }

  :global(.toc .icon svg) {
    width: 100%;
    height: 100%;
  }

  @media (max-width: 768px) {
    .toc-container {
      max-height: 50vh;
    }

    aside {
      width: 100%;
      margin: 0;
      padding: 0;
    }
    .toc .title {
      width: 100%;
      max-width: 100%;
    }

    :global(.toc a) {
      font-size: 1rem;
    }

    :global(.toc a.active) {
      font-weight: normal;
      color: var(--font-color);
    }
  }
</style>
