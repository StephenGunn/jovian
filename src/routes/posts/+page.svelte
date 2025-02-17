<script lang="ts">
  import "$lib/css/display_grid.css";
  import type { Post } from "$lib/types/schema";
  import Seo from "sk-seo";
  import BlogLink from "./BlogLink.svelte";
  import { dev } from "$app/environment";
  import { flip } from "svelte/animate";
  import { fade } from "svelte/transition";
  import RSS from "phosphor-svelte/lib/Rss";

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
  let show_filters = $state(false);

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
  <div class="title">
    <h1>Blog Posts</h1>
    <a href="/rss.xml" class="rss">
      RSS Feed
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"
        ><rect width="256" height="256" fill="none" /><path
          d="M56,136a64,64,0,0,1,64,64"
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="16"
        /><path
          d="M56,88A112,112,0,0,1,168,200"
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="16"
        /><path
          d="M56,40A160,160,0,0,1,216,200"
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="16"
        /><circle cx="60" cy="196" r="12" /></svg
      >
    </a>
  </div>
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
    {#each posts as post (post.slug)}
      <li animate:flip={{ duration: 200 }}>
        <BlogLink {post} />
      </li>
    {/each}
  </ul>
</div>

<style>
  .title {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .title .rss {
    color: white;
    border-radius: 0.5rem;
    font-size: 0.8rem;
    padding: 0.3rem 0.9rem;
    font-weight: 600;
    margin: 0;
    background: transparent;
    outline: 1px solid var(--bg-accent-2);
    border: none;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
  }

  .title .rss svg {
    width: 0.75rem;
    height: 0.75rem;
    color: var(--primary);
    fill: currentColor;
  }

  @media (max-width: 500px) {
    .title {
      flex-flow: column;
      gap: 0.5rem;
      align-items: flex-start;
    }
  }
</style>
