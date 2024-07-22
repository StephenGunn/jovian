<script lang="ts">
  let { data } = $props();
  let { content, meta } = data;
</script>

<svelte:component this={content} />
