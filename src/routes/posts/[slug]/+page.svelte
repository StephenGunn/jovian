<script lang="ts">
  import StarField from "$lib/layout/art/StarField.svelte";
  import Clipboard from "./Clipboard.svelte";
  import TOC from "./TOC.svelte";
  import "$lib/css/blog.css";
  import { blog_update_no_time, blog_update_time_since } from "$lib/dates";
  import Seo from "sk-seo";
  import ContactLink from "./ContactLink.svelte";

  let { data } = $props();
  let { content, meta } = data;

  // insta component
  const Post = content;
</script>

<Seo title="{meta.title} - JovianMoon.io" description={meta.description} />
<Clipboard />
<div class="intro">
  <div class="column">
    <h1>{meta.title}</h1>
    <p class="desc">{meta.description}</p>
    <div class="meta">
      <div class="date">
        <span>{blog_update_no_time(meta.date)}</span>
        <span>
          {blog_update_time_since(meta.date)}
        </span>
      </div>
      <div class="categories">
        <span class="title"> Post categories: </span>
        {#each meta.categories as category}
          <span>{category}</span>
        {/each}
      </div>
    </div>
  </div>
  <StarField />
</div>
<div class="content">
  <div class="left">
    <div class="logo">JovianMoon.io</div>
  </div>
  <article class="post">
    <Post />
  </article>
  <div class="right">
    <TOC />
  </div>
</div>

<div class="contact">
  <ContactLink />
</div>

<style>
  .contact {
    max-width: 800px;
    margin: 1rem auto;
  }
  .categories {
    display: flex;
    align-items: center;
    gap: 1.2rem;
    margin-top: 1rem;
    font-size: 80%;
    color: var(--accent);
  }
  .categories .title {
    color: var(--font-color);
  }
  .intro {
    position: relative;
    width: 100%;
    overflow: hidden;
    background: rgb(41, 39, 55);
    background: radial-gradient(
      circle,
      rgba(41, 39, 55, 1) 0%,
      rgba(48, 42, 23, 1) 42%,
      rgba(34, 24, 57, 1) 100%
    );
  }

  .intro h1 {
    text-wrap: balance;
    padding-bottom: 1rem;
  }

  .intro .desc {
    font-size: 125%;
    padding-bottom: 1rem;
    margin-bottom: 1rem;
    border-bottom: 2px dashed var(--bg-accent-2);
  }

  .date {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 80%;
    color: var(--highlight);
  }

  .column {
    width: var(--column-width);
    margin: 0 auto;
    padding: 8rem 5rem 4rem 5rem;
  }

  .content {
    display: grid;
    grid-template-columns: 1fr var(--column-width) 1fr;
  }

  .post {
    padding: 2rem 5rem;
  }

  .left {
    display: flex;
    justify-content: flex-end;
  }

  .right {
    display: flex;
    justify-content: flex-start;
  }

  .logo {
    position: sticky;
    top: 2rem;
    font-size: 2rem;
    font-weight: 500;
    font-family: "Jost", sans-serif;
    color: #f0f0f0;
    margin-top: 2rem;
    padding: 2rem;
    background: #444;
    align-self: flex-start;
    background: radial-gradient(circle, rgba(41, 39, 55, 1) 0%, rgba(34, 24, 57, 1) 100%);
  }
</style>
