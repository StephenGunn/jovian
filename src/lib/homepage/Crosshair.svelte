<script lang="ts">
  import { coords, jupiter_data } from "$lib/stores/homepage.svelte.js";
</script>

<div class="box"></div>

<style>
  .box {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: 1;
  }
</style>
