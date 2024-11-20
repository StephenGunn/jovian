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
  let show_filters = $state(false);

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
  <h1>Projects</h1>
  <div class="filters">
    <div class="categories">
      <button
        onclick={() => {
          show_filters = !show_filters;
          if (!show_filters) {
            active_filters = [];
          }
        }}
        class="no_focus"
        class:active_filter={show_filters}
      >
        Filter
        {#if show_filters}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"
            ><rect width="256" height="256" fill="none" /><path
              d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm37.66,130.34a8,8,0,0,1-11.32,11.32L128,139.31l-26.34,26.35a8,8,0,0,1-11.32-11.32L116.69,128,90.34,101.66a8,8,0,0,1,11.32-11.32L128,116.69l26.34-26.35a8,8,0,0,1,11.32,11.32L139.31,128Z"
            /></svg
          >
        {:else}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"
            ><rect width="256" height="256" fill="none" /><path
              d="M227.81,66.76l-.08.09L160,139.17v55.49A16,16,0,0,1,152.87,208l-32,21.34A16,16,0,0,1,96,216V139.17L28.27,66.85l-.08-.09A16,16,0,0,1,40,40H216a16,16,0,0,1,11.84,26.76Z"
            /></svg
          >
        {/if}
      </button>
      {#each categories as item, index}
        {#if show_filters}
          <button
            in:fade={{ delay: 20 * index, duration: 50 }}
            out:fade={{ delay: 20 * (categories.length - index), duration: 50 }}
            onclick={() => set_filter(item.category)}
            class:active={active_filters.includes(item.category)}>{item.category}</button
          >
        {/if}
      {/each}
    </div>

    <div class="sort">
      <button
        class:active={active_sort === "date"}
        onclick={() => (active_sort = "date")}
      >
        Date
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"
          ><rect width="256" height="256" fill="none" /><path
            d="M229.66,141.66l-96,96a8,8,0,0,1-11.32,0l-96-96A8,8,0,0,1,32,128H72V48A16,16,0,0,1,88,32h80a16,16,0,0,1,16,16v80h40a8,8,0,0,1,5.66,13.66Z"
          /></svg
        >
      </button>
      <button
        class:active={active_sort === "alpha"}
        onclick={() => (active_sort = "alpha")}
      >
        Alpha
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"
          ><rect width="256" height="256" fill="none" /><path
            d="M229.66,141.66l-96,96a8,8,0,0,1-11.32,0l-96-96A8,8,0,0,1,32,128H72V48A16,16,0,0,1,88,32h80a16,16,0,0,1,16,16v80h40a8,8,0,0,1,5.66,13.66Z"
          /></svg
        >
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
