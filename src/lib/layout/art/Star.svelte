<script lang="ts">
  const {
    size = "1rem",
    left = "0%",
    top = "0%",
    opacity = 1
  }: {
    size?: string;
    left?: string;
    top?: string;
    opacity?: number;
  } = $props();
</script>

<svg
  style:left
  style:top
  style:opacity
  style:width={size}
  style:height={size}
  style="position: absolute; z-index: 1;"
  viewBox="0 0 50 50"
  version="1.1"
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    style="fill:var(--star);stroke:var(--star);stroke-width:0;stroke-linejoin:round;paint-order:fill markers stroke"
    d="m 14.180657,31.334797 c -1.653717,0 -4.6075584,-13.07614 -5.7769132,-14.245495 C 7.234389,15.919948 -5.8417511,12.966107 -5.8417511,11.31239 c 0,-1.6537175 13.0761399,-4.6075584 14.2454946,-5.7769132 1.1693548,-1.1693548 4.1231955,-14.2454949 5.7769125,-14.245495 1.653717,0 4.607558,13.0761399 5.776913,14.2454947 1.169355,1.1693547 14.245495,4.123195 14.245495,5.7769125 0,1.653717 -13.07614,4.607558 -14.245495,5.776913 -1.169354,1.169355 -4.123195,14.245495 -5.776912,14.245495 z"
    transform="translate(10.819344,13.687611)"
  />
</svg>
