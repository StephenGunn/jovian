<script lang="ts">
  import "$lib/css/reset.css";
  import "$lib/css/app.css";

  // meta
  import Seo from "sk-seo";

  import Header from "$lib/layout/Header.svelte";
  import Footer from "$lib/layout/Footer.svelte";
</script>

<Seo title="JovianMoon.io" description="JovianMoon.io is a personal website for Jovian Moon." />
<Header />
<main>
  <slot></slot>
</main>

<Footer />

<style>
</style>
