<script lang="ts">
  import "$lib/css/reset.css";
  import "$lib/css/app.css";

  // meta

  import Header from "$lib/layout/Header.svelte";
  import Footer from "$lib/layout/Footer.svelte";
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
</style>
