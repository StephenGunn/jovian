<script lang="ts">
  import "$lib/css/fonts.css";
  import "$lib/css/reset.css";
  import "$lib/css/app.css";
  import "$lib/css/forms.css";

  import Header from "$lib/layout/Header.svelte";
  import Footer from "$lib/layout/Footer.svelte";
  import { dev } from "$app/environment";
</script>

<svelte:head>
  {#if !dev}
    <script
      defer
      src="/script.js"
      data-website-id="e34c081c-f7d3-41ee-9ebf-30baade2e00a"
    ></script>
  {/if}
</svelte:head>

<div class="app">
  <Header />
  <main>
    <slot></slot>
  </main>
  <Footer />
</div>

<style>
  .app {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  main {
    flex: 1;
  }

  @media (max-width: 768px) {
    .app {
      max-width: 100vw;
      overflow: hidden;
    }
  }
</style>
