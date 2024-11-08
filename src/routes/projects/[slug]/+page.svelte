<script lang="ts">
  import "$lib/css/projects.css";
  import TOC from "./TOC.svelte";
  import Seo from "sk-seo";
  import StarField from "$lib/layout/art/StarField.svelte";
  import Clipboard from "./Clipboard.svelte";
  import ContactLink from "$lib/layout/ContactLink.svelte";
  import { blog_update_no_time, blog_update_time_since } from "$lib/dates";

  let { data } = $props();
  let { content, meta } = data;

  // insta component
  const Project = content;
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
        <span class="title"> Project categories: </span>
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
    <div class="extra">
      <div class="logo">JovianMoon.io</div>
      <a href="./">
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
        Back to projects</a
      >
    </div>
  </div>
  <article class="project">
    <Project />
  </article>
  <div class="right">
    <TOC />
  </div>
</div>

<div class="contact">
  <ContactLink placement="project" />
</div>

<style>
  .contact {
    max-width: 800px;
    margin: 1rem auto;
    padding: 1rem;
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

  .extra a {
    margin-top: 1rem;
    display: flex;
    padding: 0.5rem;
    gap: 1rem;
    align-items: center;
    color: var(--muted-color);
    text-decoration: none;
  }

  .extra a svg {
    width: 1rem;
    height: 1rem;
    color: var(--bg-accent-1);
  }

  .extra a:hover {
    color: var(--font-color);
  }

  .extra a:hover svg {
    color: var(--accent);
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

  .project {
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

    .content > article {
      grid-area: middle;
    }

    .content > .right {
      grid-area: right;
    }
  }

  @media (max-width: 1200px) {
    .column {
      padding: 8rem 2rem 4rem 2rem;
    }
    .project {
      padding: 2rem;
    }
  }

  @media (max-width: 1000px) {
    .column {
      padding: 8rem 1rem 4rem 2rem;
    }
    .project {
      padding: 0rem;
    }

    .intro .column {
      max-width: 85%;
    }
    .intro h1 {
      font-size: 3rem;
    }
  }
  @media (max-width: 800px) {
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
    .extra a {
      position: absolute;
      top: 1rem;
      left: 1rem;
      color: var(--secondary);
    }
    .extra a svg {
      color: var(--primary);
    }
  }
</style>
