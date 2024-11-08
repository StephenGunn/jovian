<script lang="ts">
  import { onMount } from "svelte";

  let TOC = $state("");

  const generate_table_of_contents = () => {
    const headers = document.querySelectorAll("h2, h3, h4, h5, h6");
    let table_of_contents = "<ul>";

    headers.forEach((header) => {
      const id = header.id;
      const tag = header.tagName;
      const text = header.textContent;

      if (id && tag) {
        table_of_contents += `<li><a href="#${id}">${text}</a></li>`;
      }
    });

    table_of_contents += "</ul>";

    return table_of_contents;
  };

  onMount(() => {
    TOC = generate_table_of_contents();
  });
</script>

{#if TOC !== ""}
  <aside>
    <section class="toc">
      <div class="title">Table of contents</div>
      {@html TOC}
    </section>
  </aside>
{/if}

<style>
  aside {
    margin-top: 2rem;
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
  }
</style>
