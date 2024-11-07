<script lang="ts">
  import type { Post } from "$lib/types/schema";
  import BlogLink from "./BlogLink.svelte";
  let { data }: { data: { posts: Post[] } } = $props();
  let { posts } = data;

  import Seo from "sk-seo";
</script>

<Seo
  title="Blog Posts - JovianMoon.io"
  description="Blog posts about the internet, space, svelte, sveltekit, and general web programming."
/>
<div class="column">
  <h1>Blog Posts</h1>
  <p class="desc">I promise I'll write more about Svelte and things.</p>
  <ul>
    {#each posts as post}
      <li>
        <BlogLink {post} />
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
