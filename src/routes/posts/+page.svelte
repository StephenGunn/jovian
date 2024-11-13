<script lang="ts">
  import "$lib/css/display_grid.css";
  import type { Post } from "$lib/types/schema";
  import Seo from "sk-seo";
  import BlogLink from "./BlogLink.svelte";
  import { dev } from "$app/environment";
  import { flip } from "svelte/animate";
  import { fade } from "svelte/transition";

  const open_graph_image = encodeURI(
    `${dev ? "http://localhost:42069" : "https://jovianmoon.io"}/api/images/pages?title=Blog Posts&link=posts`
  );

  // data comes in, can't explain that
  let { data } = $props();
  let { categories } = data;

  // making a copy of the posts to prevent possible mutation
  const posts_copy = [...data.posts];

  let active_filters: string[] = $state([]);
  let active_sort: "date" | "alpha" = $state("date");

  // Parses a "YYYY-MM-DD" string into a sortable ISO date string
  const parse_date = (date: string): string => {
    let [year, month, day] = date.split("-");
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toISOString();
  };

  // Sorts posts by the 'updated' date if available, otherwise by 'date'
  const sort_by_date = (posts: Post[]): Post[] => {
    return posts.sort((a, b) =>
      parse_date(b.updated ?? b.date).localeCompare(parse_date(a.updated ?? a.date))
    );
  };

  const sort_by_alpha = (posts: Post[]) => {
    return posts.sort((a, b) => a.title.localeCompare(b.title));
  };

  let posts = $derived.by(() => {
    let temp: Post[] = [];

    if (active_filters.length <= 0) {
      temp = [...posts_copy];
    } else {
      temp = posts_copy.filter((post) => {
        return post.categories.some((cat) => active_filters.includes(cat));
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

  $inspect(posts);
</script>

<Seo
  title="Blog Posts - JovianMoon.io"
  description="Blog posts about the internet, space, svelte, sveltekit, and general web programming."
  imageURL={open_graph_image}
/>

<div class="grid_column">
  <h1>Blog Posts</h1>
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
    {#each posts as post (post.slug)}
      <li animate:flip={{ duration: 200 }}>
        <BlogLink {post} />
      </li>
    {/each}
  </ul>
</div>
