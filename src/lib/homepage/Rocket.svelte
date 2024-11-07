<script lang="ts">
  import { fadeScale } from "$lib/fade_scale";
  import { fade } from "svelte/transition";
  import { onMount } from "svelte";
  onMount(() => {
    setTimeout(() => {
      show = true;
    }, 1000);
  });
  let show = $state(false);
  let {
    ignition,
    launched,
    orbit_mode,
    decent_mode,
    orbit_size,
    size
  }: {
    ignition: boolean;
    launched: boolean;
    orbit_mode: boolean;
    decent_mode: boolean;
    orbit_size: number;
    size: number;
  } = $props();
</script>

<svg
  version="1.1"
  viewBox="0 0 50 50"
  xmlns="http://www.w3.org/2000/svg"
  style="--fins: #6c7b92; --body: #a1abba; --max: {size}px; --orbit_size: {orbit_size}px"
  class:orbit_mode={orbit_mode || decent_mode}
  class:launched
>
  <defs>
    <clipPath id="rocketj">
      <path d="m2088 574h538v372h-538z" />
    </clipPath>
    <clipPath id="rocketi">
      <path
        d="m2378.2 574.91c422.76 646.28 550.22 1319.1 327.44 2019.3l-668.68-1.9688c-217.18-627.9-125.68-1302.1 341.24-2017.3z"
        clip-rule="evenodd"
      />
    </clipPath>
    <clipPath id="rocketh">
      <path d="m2207 2735h325v779h-325z" />
    </clipPath>
    <clipPath id="rocketg">
      <path
        d="m2366.6 3774.4c-205.54-260.98-274.14-601.84-178.22-1038.7h356.45c101.65 403.57 43.094 750.1-178.23 1038.7z"
        clip-rule="evenodd"
      />
    </clipPath>
    <clipPath id="rocketf">
      <path d="m2262 2760h217v519h-217z" />
    </clipPath>
    <clipPath id="rockete">
      <path
        d="m2366.6 3774.4c-205.54-260.98-274.14-601.84-178.22-1038.7h356.45c101.65 403.57 43.094 750.1-178.23 1038.7z"
        clip-rule="evenodd"
      />
    </clipPath>
    <clipPath id="rocketd">
      <path d="m2229 1110h281v259h-281z" />
    </clipPath>
    <clipPath id="rocketc">
      <path
        d="m2369.4 1070.2c101.52 0 183.93 75.98 183.93 169.57s-82.41 169.57-183.93 169.57c-101.51 0-183.93-75.98-183.93-169.57s82.422-169.57 183.93-169.57z"
        clip-rule="evenodd"
      />
    </clipPath>
    <clipPath id="rocketb">
      <path d="m2277 1510h185v170h-185z" />
    </clipPath>
    <clipPath id="rocketa">
      <path
        d="m2369.4 1483.3c66.726 0 120.9 49.938 120.9 111.46 0 61.512-54.172 111.46-120.9 111.46-66.723 0-120.89-49.949-120.89-111.46 0-61.52 54.168-111.46 120.89-111.46z"
        clip-rule="evenodd"
      />
    </clipPath>
  </defs>

  {#if show && !launched}
    <ellipse
      in:fadeScale={{ delay: 500, duration: 1000, baseScale: 0.2 }}
      out:fadeScale={{ duration: 100, baseScale: 0 }}
      id="shadow"
      cx="24.326"
      cy="39.05"
      rx="22.3"
      ry="2.96"
      style="fill:#333;paint-order:fill markers stroke;stroke-width:0;opacity: 0.2"
    />
  {/if}
  <g transform="matrix(.98207 0 0 .98207 4.5473 .44835)">
    <g fill-rule="evenodd">
      <path
        d="m13.279 40.063 3.1117-8.506-1.2147-8.0542s-3.7806 1.5334-3.9631 3.1277c-0.31628 2.76 0.68749 10.955 2.0661 13.433"
        fill="var(--fins)"
        style="stroke-width:.015628"
      />
      <path
        d="m28.373 40.071-3.1117-8.506 1.2147-8.0542s3.7806 1.5334 3.9631 3.1277c0.31626 2.76-0.68749 10.955-2.0661 13.433"
        fill="var(--fins)"
        style="stroke-width:.015628"
      />
      <path
        d="m20.853 1.1221e-6c6.6066 10.1 8.5985 20.615 5.117 31.557l-10.45-0.030756c-3.394-9.8124-1.9641-20.349 5.3327-31.526"
        fill="var(--body)"
        style="stroke-width:.015628"
      />
    </g>
    <g transform="matrix(.015627 0 0 .015627 -16.312 -8.9844)" clip-path="url(#rocketj)">
      <g clip-path="url(#rocketi)">
        <path d="m2625.1 574.91h-536.87v370.51h536.87v-370.51" fill="var(--fins)" fill-rule="evenodd" />
      </g>
    </g>
    {#if ignition}
      <path
        d="m20.672 50c-3.2121-4.0785-4.2841-9.4052-2.7852-16.232h5.5704c1.5886 6.3068 0.67344 11.722-2.7852 16.232"
        fill="#ff6c34"
        fill-rule="evenodd"
        style="stroke-width:.015628"
        in:fade={{ duration: 300 }}
        out:fade={{ duration: 30 }}
      />
      <g transform="matrix(.015627 0 0 .015627 -16.312 -8.9844)" clip-path="url(#rocketh)">
        <g clip-path="url(#rocketg)">
          <path
            d="m2367.4 3513.9c-148.49-195.54-198.05-450.92-128.75-778.22h257.5c51.109 210.44 46.148 400.18-15.48 568.99-26.922 73.742-64.66 143.49-113.27 209.23"
            fill="#ffdb2b"
            fill-rule="evenodd"
            in:fade={{ duration: 500 }}
            out:fade={{ duration: 50 }}
          />
        </g>
      </g>
      <g transform="matrix(.015627 0 0 .015627 -16.312 -8.9844)" clip-path="url(#rocketf)">
        <g clip-path="url(#rockete)">
          <path
            d="m2369.1 3278.8c-98.938-130.3-131.97-300.48-85.789-518.58h171.59c48.93 201.49 20.742 374.5-85.801 518.58"
            fill="#ff5"
            fill-rule="evenodd"
            in:fade={{ duration: 50 }}
            out:fade={{ duration: 10 }}
          />
        </g>
      </g>
    {/if}
    <g fill-rule="evenodd">
      <path
        d="m24.407 32.159h-7.3477s0.07802 0.98105 0.17893 1.2491c0.10084 0.26817 0.27915 0.35162 0.42633 0.35974 1.0817 0.05982 4.9698 0.05281 6.0641 0 0.1705-0.0083 0.37714-0.13003 0.50117-0.31737 0.15444-0.23337 0.1772-1.2915 0.1772-1.2915"
        fill="#005988"
        style="stroke-width:.015628"
      />
      <path
        d="m25.997 31.422h-10.517s0.02801 0.40571 0.09925 0.52871c0.0636 0.1097 0.12442 0.20767 0.32799 0.20877 1.5412 0.0076 8.1233 0.03968 9.6592 0 0.14895-0.0039 0.27446-0.14693 0.34619-0.26975 0.07173-0.12301 0.08405-0.46773 0.08405-0.46773"
        fill="#3d7ead"
        style="stroke-width:.015628"
      />
      <path
        d="m20.716 7.7398c1.5865 0 2.8744 1.1874 2.8744 2.65 0 1.4626-1.2879 2.65-2.8744 2.65-1.5864 0-2.8744-1.1874-2.8744-2.65 0-1.4626 1.288-2.65 2.8744-2.65"
        fill="#343434"
        style="stroke-width:.015628"
      />
    </g>
    <g transform="matrix(.015627 0 0 .015627 -16.312 -8.9844)" clip-path="url(#rocketd)">
      <g clip-path="url(#rocketc)">
        <path
          d="m2369.4 1111c77.098 0 139.7 57.711 139.7 128.79 0 71.07-62.602 128.78-139.7 128.78-77.102 0-139.69-57.711-139.69-128.78 0-71.078 62.59-128.79 139.69-128.79"
          fill="#71dcf1"
          fill-rule="evenodd"
        />
      </g>
    </g>
    <path
      d="m20.716 14.196c1.0428 0 1.8893 0.78039 1.8893 1.7418 0 0.96127-0.84656 1.7418-1.8893 1.7418-1.0427 0-1.8892-0.78058-1.8892-1.7418 0-0.96139 0.8465-1.7418 1.8892-1.7418"
      fill="#343434"
      fill-rule="evenodd"
      style="stroke-width:.015628"
    />
    <g transform="matrix(.015627 0 0 .015627 -16.312 -8.9844)" clip-path="url(#rocketb)">
      <g clip-path="url(#rocketa)">
        <path
          d="m2369.4 1510.1c50.68 0 91.816 37.93 91.816 84.648 0 46.723-41.137 84.652-91.816 84.652-50.672 0-91.82-37.93-91.82-84.652 0-46.719 41.148-84.648 91.82-84.648"
          fill="#71dcf1"
          fill-rule="evenodd"
        />
      </g>
    </g>
    <path
      d="m20.716 22.953s1.2966 1.7906 1.2997 2.7529c8e-3 2.5489-1.2513 12.539-1.2513 12.539s-1.4766-10.017-1.4847-12.566c-3e-3 -0.96359 1.4363-2.7261 1.4363-2.7261"
      fill="var(--fins)"
      fill-rule="evenodd"
      style="stroke-width:.015628"
    />
  </g>
</svg>

<style>
  svg {
    width: 100%;
    height: 100%;
    transform: rotate(90deg);
    position: absolute;
    top: 0;
    left: 0;
    transition: all 2s ease-out;
    transform-origin: center;
  }

  svg.launched {
    transform-origin: center;
    max-width: var(--max);
    max-height: var(--max);
  }

  svg.orbit_mode {
    transform: rotate(46deg) translateX(60%) scale(50%);
  }
</style>
