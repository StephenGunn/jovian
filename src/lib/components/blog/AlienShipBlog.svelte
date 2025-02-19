<script lang="ts">
  import { generate_starfield } from "$lib/layout/generate_starfield.svelte";
  import StarField from "$lib/layout/art/StarField.svelte";
  import Rocket from "$lib/homepage/Rocket.svelte";
  import Confetti from "svelte-confetti";
</script>

<div class="comp">
  <div class="starfield">
    <div class="alien">
      <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 1372.87 636.63">
        <defs>
          <style>
            .st0 {
              fill: #87d3e3;
            }

            .st1 {
              fill: #c62368;
            }

            .st2 {
              fill: #67bdc9;
            }

            .st3 {
              fill: #c7eef2;
            }
          </style>
        </defs>
        <ellipse class="st1" cx="688.96" cy="445.65" rx="666.95" ry="164.78" />
        <g>
          <path
            class="st0"
            d="M341.43,384.53c197.27,38.22,410.9,42.23,611.83,16.75C889.23-114.15,505.48-24.44,373.33,234.29h.1c-20.82,46.55-34.39,99.44-32,150.24Z"
          />
          <path
            class="st2"
            d="M933.42,403.87c34.33-5.08,70.17-9.09,103.34-17.5.22-51.6-11.27-102.82-32.67-149.5h.1c-57.89-125.76-185.41-208.55-325.35-208.55,0,0,240.66,53.01,254.58,375.55Z"
          />
          <ellipse
            class="st3"
            cx="487.72"
            cy="182.64"
            rx="76.03"
            ry="32.38"
            transform="translate(13.7 398.36) rotate(-45)"
          />
        </g>
      </svg>

      <div class="flag">🏴‍☠️</div>
    </div>

    <StarField stars={generate_starfield()} />
  </div>
</div>

<style>
  .comp {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    gap: 1.5rem;
    position: relative;
  }

  .alien {
    position: absolute;
    width: 30%;
    height: 30%;
    left: 35%;
    top: 35%;
    z-index: 4;
  }

  .flag {
    font-size: 2rem;
    position: absolute;
    left: 80%;
    bottom: 60%;
  }

  .starfield {
    width: 100%;
    aspect-ratio: 16 / 9;
    overflow: hidden;
    position: relative;
    border-radius: 1rem;
    border: 1px solid var(--bg-accent-3);
  }

  @media (max-width: 800px) {
    .starfield {
      aspect-ratio: 1 / 1;
    }
  }
</style>
