<script lang="ts">
  import "$lib/css/reset.css";
  import "$lib/css/app.css";

  // meta
  import Seo from "sk-seo";

  import StarField from "$lib/layout/art/StarField.svelte";
  import Header from "$lib/layout/Header.svelte";
  import Footer from "$lib/layout/Footer.svelte";
</script>

<Seo
  title="JovianMoon.io"
  description="Digital playground for Stephen Gunn featuring blog posts, projects, expiriments, and links to web development resources."
/>

<StarField />
<Header />
<main>
  <slot></slot>
</main>
<Footer />

<style>
</style>
