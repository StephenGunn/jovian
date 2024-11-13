<script lang="ts">
  import "$lib/css/display_grid.css";
  import type { Project } from "$lib/types/schema";
  import ProjectLink from "./ProjectLink.svelte";
  import Seo from "sk-seo";
  import { dev } from "$app/environment";
  import { fade } from "svelte/transition";
  import { flip } from "svelte/animate";

  const open_graph_image = encodeURI(
    `${dev ? "http://localhost:42069" : "https://jovianmoon.io"}/api/images/pages?title=Projects&link=projects`
  );

  // data comes in, can't explain that
  let { data } = $props();
  let { categories } = data;

  // making a copy of the projects to prevent possible mutation
  const projects_copy = [...data.projects];

  let active_filters: string[] = $state([]);
  let active_sort: "date" | "alpha" = $state("alpha");

  // Parses a "YYYY-MM-DD" string into a sortable ISO date string
  const parse_date = (date: string): string => {
    let [year, month, day] = date.split("-");
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toISOString();
  };

  // Sorts projects by the 'updated' date if available, otherwise by 'date'
  const sort_by_date = (projects: Project[]): Project[] => {
    return projects.sort((a, b) =>
      parse_date(b.updated ?? b.date).localeCompare(parse_date(a.updated ?? a.date))
    );
  };

  const sort_by_alpha = (projects: Project[]) => {
    return projects.sort((a, b) => a.title.localeCompare(b.title));
  };

  let projects = $derived.by(() => {
    let temp: Project[] = [];

    if (active_filters.length <= 0) {
      temp = [...projects_copy];
    } else {
      temp = projects_copy.filter((project) => {
        return project.categories.some((cat) => active_filters.includes(cat));
      });
    }

    if (active_sort === "date") {
      return sort_by_date(temp);
    } else {
      return sort_by_alpha(temp);
    }
  });

  const set_filter = (category: string) => {
    if (active_filters.includes(category)) {
      active_filters = active_filters.filter((cat) => cat !== category);
    } else {
      active_filters = [...active_filters, category];
    }
  };

  $inspect(projects);
</script>

<Seo
  title="Projects - JovianMoon.io"
  description="A list of projects I maintain and want to highlight."
  imageURL={open_graph_image}
/>

<div class="grid_column">
  <p>(I have lot's more projects to add! They are coming!)</p>
  <h1>Projects</h1>
  <div class="filters">
    <div class="categories">
      {#each categories as item}
        <button
          onclick={() => set_filter(item.category)}
          class:active={active_filters.includes(item.category)}>{item.category}</button
        >
      {/each}
      {#if active_filters.length > 0}
        <button transition:fade={{ duration: 100 }} onclick={() => (active_filters = [])}
          >&times;</button
        >
      {/if}
    </div>

    <div class="sort">
      <button
        class:active={active_sort === "date"}
        onclick={() => (active_sort = "date")}
      >
        Date
      </button>
      <button
        class:active={active_sort === "alpha"}
        onclick={() => (active_sort = "alpha")}
      >
        Alpha
      </button>
    </div>
  </div>
  <ul>
    {#each projects as project (project.slug)}
      <li animate:flip={{ duration: 200 }}>
        <ProjectLink {project} />
      </li>
    {/each}
  </ul>
</div>
