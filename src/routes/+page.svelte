<script lang="ts">
  import Waves from "$lib/layout/art/Waves.svelte";
  import Orbits from "$lib/layout/art/Orbits.svelte";
  import StarField from "$lib/layout/art/StarField.svelte";
  import Crosshair from "$lib/layout/art/Crosshair.svelte";
  import Ship from "$lib/layout/art/Ship.svelte";
</script>

<div class="box">
  <h1>Jovian Moon</h1>
  <Ship />
  <Crosshair />
  <StarField />
  <Waves />
  <Orbits />
</div>

<style>
  .box {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgb(41, 39, 55);
    overflow: hidden;
    background: radial-gradient(
      circle,
      rgba(41, 39, 55, 1) 0%,
      rgba(48, 42, 23, 1) 42%,
      rgba(34, 24, 57, 1) 100%
    );
  }
  h1 {
    position: absolute;
    top: 20%;
    left: 5%;
    font-size: clamp(3.125rem, 11.547vw + 0.137rem, 9.375rem);
    line-height: clamp(3.125rem, 11.547vw + 0.137rem, 9.375rem);
  }
</style>
