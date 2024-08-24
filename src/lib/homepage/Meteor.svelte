<script lang="ts">
  import Star from "$lib/layout/art/Star.svelte";
  let { size, start }: { size: number; start: { x: number; y: number } } = $props();
</script>

<div class="meteor" style:top="{start.y}px" style:left="{start.x}px">
  <div class="star" style:width="{size}px" style:height="{size}px">
    <Star size="{size}px" />
  </div>
  <div class="tail" style:height="{size / 6 >= 1 ? size / 6 : 1}px"></div>
</div>

<style>
  .meteor {
    position: absolute;
    animation: meteor 9s linear forwards;
    width: 300px;
    height: 300px;
    z-index: 1;
  }

  .star {
    position: absolute;
    top: 50%;
    left: 0;
    animation: rotate 1000ms linear infinite;
    transform-origin: center;
  }

  .tail {
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.1), transparent);
    transform: translateY(-50%);
  }

  @keyframes meteor {
    0% {
      transform: translate(0, 0) rotate(-45deg);
      opacity: 1;
    }
    17% {
      opacity: 0;
    }
    100% {
      transform: translate(-200vw, 200vw) rotate(-45deg);
    }
  }

  @keyframes rotate {
    from {
      transform: translateY(-50%) rotate(0deg);
    }
    to {
      transform: translateY(-50%) rotate(360deg);
    }
  }
</style>
