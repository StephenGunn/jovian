<script lang="ts">
  import "$lib/css/fonts.css";
  import "$lib/css/reset.css";
  import "$lib/css/app.css";
  import "$lib/css/forms.css";

  import Header from "$lib/layout/Header.svelte";
  import Footer from "$lib/layout/Footer.svelte";

  import umami from "@umami/node";
  import { onMount } from "svelte";

  onMount(() => {
    umami.init({
      websiteId: "e34c081c-f7d3-41ee-9ebf-30baade2e00a",
      hostUrl: "https://stats.craftroulette.live"
    });
  });
</script>

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
