<script lang="ts">
  import { wave_ref } from "$lib/stores/homepage.svelte";
</script>

<svg
  bind:clientWidth={wave_ref.width}
  bind:clientHeight={wave_ref.height}
  class="waves"
  preserveAspectRatio="xMidYMid meet"
  viewBox="0 0 960 540"
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  version="1.1"
  ><path
    d="M0 441L40 443.7C80 446.3 160 451.7 240 452C320 452.3 400 447.7 480 434C560 420.3 640 397.7 720 398.2C800 398.7 880 422.3 920 434.2L960 446L960 541L920 541C880 541 800 541 720 541C640 541 560 541 480 541C400 541 320 541 240 541C160 541 80 541 40 541L0 541Z"
    fill="#fa7268"
  ></path><path
    d="M0 464L40 455.7C80 447.3 160 430.7 240 431.8C320 433 400 452 480 460.2C560 468.3 640 465.7 720 462C800 458.3 880 453.7 920 451.3L960 449L960 541L920 541C880 541 800 541 720 541C640 541 560 541 480 541C400 541 320 541 240 541C160 541 80 541 40 541L0 541Z"
    fill="#eb5967"
  ></path><path
    d="M0 470L40 469.7C80 469.3 160 468.7 240 473.7C320 478.7 400 489.3 480 490C560 490.7 640 481.3 720 477.2C800 473 880 474 920 474.5L960 475L960 541L920 541C880 541 800 541 720 541C640 541 560 541 480 541C400 541 320 541 240 541C160 541 80 541 40 541L0 541Z"
    fill="#da3f67"
  ></path><path
    d="M0 477L40 477.8C80 478.7 160 480.3 240 484.8C320 489.3 400 496.7 480 499.2C560 501.7 640 499.3 720 499.3C800 499.3 880 501.7 920 502.8L960 504L960 541L920 541C880 541 800 541 720 541C640 541 560 541 480 541C400 541 320 541 240 541C160 541 80 541 40 541L0 541Z"
    fill="#c62368"
  ></path></svg
>

<style>
  .waves {
    width: 100%;
    height: auto;
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 8;
    pointer-events: none;
    min-width: 1000px;
  }
</style>
