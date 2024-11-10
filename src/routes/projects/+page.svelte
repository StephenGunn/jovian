<script lang="ts">
  import type { Project } from "$lib/types/schema";
  import ProjectLink from "./ProjectLink.svelte";
  import Seo from "sk-seo";
  import { dev } from "$app/environment";

  let { data }: { data: { projects: Project[] } } = $props();
  let { projects } = data;

  const open_graph_image = encodeURI(
    `${dev ? "http://localhost:42069" : "https://jovianmoon.io"}/api/images/pages?title=Projects&link=projects`
  );
</script>

<Seo
  title="Projects - JovianMoon.io"
  description="A list of projects I maintain and want to highlight."
  imageURL={open_graph_image}
/>
<div class="column">
  <h1>Projects</h1>
  <p class="desc">
    Here are some of the projects I actively maintain. (I have many more projects to add!)
  </p>
  <ul>
    {#each projects as project}
      <li>
        <ProjectLink {project} />
      </li>
    {/each}
  </ul>
</div>

<style>
  ul {
    list-style-type: none;
    padding: 0;
  }
  li {
    margin-bottom: 1rem;
  }

  .desc {
    margin-bottom: 1.5rem;
  }

  @media (max-width: 1100px) {
    h1 {
      font-size: 3rem;
    }
  }
</style>
