<script lang="ts">
  import "$lib/css/fonts.css";
  import "$lib/css/reset.css";
  import "$lib/css/app.css";
  import "$lib/css/forms.css";

  import Header from "$lib/layout/Header.svelte";
  import Footer from "$lib/layout/Footer.svelte";
  import { onMount } from "svelte";
  import { initUmami } from "$lib/stats";

  onMount(() => {
    initUmami();
  });
</script>

<svelte:head>
  <link rel="preconnect" href="https://stats.craftroulette.live" />
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
