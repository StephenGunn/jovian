<script lang="ts">
  import { page } from "$app/stores";

  $inspect(page);
</script>

<header>
  {#if $page.url.pathname !== "/"}
    <a href="./"> JovianMoon.io </a>
  {/if}
  <nav>
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/posts">Posts</a></li>
      <li><a href="/projects">Projects</a></li>
      <li><a href="/about">About</a></li>
      <li><a href="/contact">Contact</a></li>
    </ul>
  </nav>
</header>

<style>
</style>
