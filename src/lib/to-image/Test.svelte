<svelte:options css="injected" />

<script lang="ts">
  let { text = "hello" }: { text: string } = $props();
</script>

<div id="container">
  <h1>
    {text} world!
  </h1>
</div>

<style>
  #container {
    width: 1200px;
    height: 600px;
    display: flex;
    align-items: center;
    font-family: "Jost";
    justify-content: center;
    position: relative;
    background: radial-gradient(
      circle,
      rgba(63, 94, 251, 1) 0%,
      rgba(252, 70, 107, 1) 100%
    );
  }
  h1 {
    color: red;
    font-size: 75px;
    display: flex;
  }
</style>
