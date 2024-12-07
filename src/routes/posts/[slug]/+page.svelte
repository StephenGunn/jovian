<script lang="ts">
  import StarField from "$lib/layout/art/StarField.svelte";
  import Clipboard from "./Clipboard.svelte";
  import TOC from "./TOC.svelte";
  import "$lib/css/blog.css";
  import { blog_update_no_time, blog_update_time_since } from "$lib/dates";
  import Seo from "sk-seo";
  import ContactLink from "$lib/layout/ContactLink.svelte";
  import { dev } from "$app/environment";
  import Comments from "$lib/components/blog/Comments.svelte";
  import { PUBLIC_BLUESKY_DID } from "$env/static/public";
  import { comment_data } from "./comment_store.svelte";
  import { onDestroy } from "svelte";
  import CommentReport from "./CommentReport.svelte";

  let { data } = $props();
  let { content, meta, slug, stars } = data;

  $inspect(data);

  // insta component
  const Post = content;

  const open_graph_image = encodeURI(
    `${dev ? "http://localhost:42069" : "https://jovianmoon.io"}/api/images/og?title=${meta.title}&link=posts/${slug}&section=Blog Post`
  );

  onDestroy(() => {
    comment_data.updated = false;
  });
</script>

<Seo
  title="{meta.title} - JovianMoon.io"
  description={meta.description}
  keywords={meta.categories}
  imageURL={open_graph_image}
/>

<Clipboard />
<div class="intro">
  <div class="column">
    <a href="./" class="back_to_posts hide_desktop">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"
        ><rect width="256" height="256" fill="none" /><polygon
          points="120 32 24 128 120 224 120 176 184 176 184 80 120 80 120 32"
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="16"
        /><line
          x1="216"
          y1="176"
          x2="216"
          y2="80"
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="16"
        /></svg
      >
      View all blog posts
    </a>
    <h1>{meta.title}</h1>
    <p class="desc">{meta.description}</p>
    <div class="meta">
      <div class="date">
        <span>
          {#if meta.updated}
            Posted
          {/if}
          {blog_update_no_time(meta.date)}
        </span>

        {#if meta.updated}
          <span>(updated {blog_update_no_time(meta.updated)})</span>
        {/if}
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
  <StarField {stars} />
</div>
<div class="content">
  <div class="left">
    <div class="extra">
      <div class="sticker">
        <div class="logo">JovianMoon.io</div>
        {#if meta.bluesky_thread_id}
          <CommentReport />
        {/if}
        <a href="./" class="back_to_posts hide_mobile">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"
            ><rect width="256" height="256" fill="none" /><polygon
              points="120 32 24 128 120 224 120 176 184 176 184 80 120 80 120 32"
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="16"
            /><line
              x1="216"
              y1="176"
              x2="216"
              y2="80"
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="16"
            /></svg
          >
          View all blog posts
        </a>
      </div>
    </div>
  </div>
  <div>
    <article class="post">
      <Post />
    </article>
    <div class="comments" id="comments">
      {#if meta.bluesky_thread_id}
        <Comments did={PUBLIC_BLUESKY_DID} threadId={meta.bluesky_thread_id} />
      {:else}
        <ContactLink placement="article" />
      {/if}
    </div>
  </div>
  <div class="right">
    <TOC />
  </div>
</div>

<style>
  .back_to_posts.hide_desktop {
    display: none;
  }
  .comments {
    padding: 2rem 2.5rem;
    margin: 0 2.5rem;
    border-top: 4px dashed var(--accent);
  }
  .categories {
    display: flex;
    align-items: center;
    gap: 1.2rem;
    margin-top: 1rem;
    font-size: 80%;
    color: var(--accent);
    flex-wrap: wrap;
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

  .extra {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .back_to_posts {
    margin-top: 1rem;
    display: flex;
    gap: 1rem;
    align-items: center;
    color: var(--muted-color);
    text-decoration: none;
  }

  .back_to_posts svg {
    width: 1rem;
    height: 1rem;
    color: var(--bg-accent-1);
  }

  .back_to_posts:hover {
    color: var(--font-color);
  }

  .back_to_posts:hover svg {
    color: var(--accent);
  }

  .back_to_posts {
    border: 1px solid var(--subtle-highlight);
    border-radius: 0.25rem;
    padding: 0.5rem 1rem;
    font-size: 0.7rem;
    text-transform: uppercase;
    font-weight: bold;
    display: flex;
    align-items: center;
  }

  .back_to_posts svg {
    width: 1rem;
    height: 1rem;
    margin-right: 0.5rem;
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
    max-width: 100%;
  }

  .content {
    display: grid;
    grid-template-columns: 1fr var(--column-width) 1fr;
    grid-template-areas: "left middle right";
    max-width: 100%;
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

  .sticker {
    position: sticky;
    top: 2rem;
    margin-top: 2rem;
  }

  .logo {
    font-size: 2rem;
    font-weight: 500;
    font-family: "Jost", sans-serif;
    color: #f0f0f0;
    padding: 2rem;
    background: #444;
    align-self: flex-start;
    background: radial-gradient(circle, rgba(41, 39, 55, 1) 0%, rgba(34, 24, 57, 1) 100%);
  }

  @media (max-width: 1500px) {
    .content {
      max-width: var(--column-width);
      margin: 0 auto;
      padding: 0 2rem;
      grid-template-columns: 1fr 1fr; /* Two equally spaced columns */
      grid-template-rows: auto auto; /* Two rows: one for outer columns, one for middle column */
      grid-template-areas:
        "left right"
        "middle middle";
      gap: 2rem;
    }

    .content > .left {
      grid-area: left;
      justify-content: center;
    }

    .content > .right {
      grid-area: right;
    }
  }

  @media (max-width: 1200px) {
    .column {
      padding: 8rem 2rem 4rem 2rem;
    }
    .post {
      padding: 2rem;
    }
  }

  @media (max-width: 1000px) {
    .column {
      padding: 8rem 2rem 4rem 2rem;
    }
    .post {
      padding: 0rem;
    }
    .comments {
      padding: 1rem 0;
      margin: 0;
      border-top: 2px dashed var(--bg-accent-3);
    }

    .intro h1 {
      font-size: 3rem;
    }
  }
  @media (max-width: 800px) {
    .back_to_posts.hide_desktop {
      display: flex;
    }
    .back_to_posts.hide_mobile {
      display: none;
    }
    .content {
      grid-template-columns: 1fr;
      grid-template-areas:
        "left"
        "right"
        "middle";
      padding: 0 1rem;
    }

    .content > .left {
      max-width: fit-content;
      margin: 0 auto;
    }

    .content > .right {
      grid-area: right;
    }

    .back_to_posts {
      position: absolute;
      top: 1rem;
      left: 1rem;
      color: var(--secondary);
      border: none;
    }
    .back_to_posts svg {
      color: var(--primary);
    }
  }
</style>
