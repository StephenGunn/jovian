<script lang="ts">
  import { fade } from "svelte/transition";
  import { Tween } from "svelte/motion";
  import { sineInOut } from "svelte/easing";
  import { onMount, tick } from "svelte";
  import { code_to_emoji } from "$lib/utility";
  import { innerWidth, innerHeight } from "svelte/reactivity/window";

  let {
    id,
    country,
    size = 30
  }: {
    id: string;
    country: string;
    size?: number;
  } = $props();

  class AlienShip {
    id: string;
    x = $state(-100);
    y = $state(-100);
    rotation = $state(0);
    in_motion = $state(false);
    visible = $state(false);
    trip_duration = $state(4000);
    waypoint_queue: { x: number; y: number }[] = $state([]);
    initialized = $state(false); // Add this to track initialization

    constructor(id: string) {
      this.id = id;
    }

    private delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    set_position(x: number, y: number) {
      // No special initialization logic - just set the position
      this.x = x;
      this.y = y;
    }

    private async fly_to(x: number, y: number) {
      this.calculate_trip_duration(x, y);
      // Remove the size/2 offset from here since it's handled in the template
      const coords = { x, y };

      await this.delay(200);
      this.in_motion = true;

      const updateInterval = setInterval(() => {
        this.set_banking_angle(coords.x);
      }, 50);

      // Set the tweens to start from current position
      x_move.set(this.x, { duration: 0 });
      y_move.set(this.y, { duration: 0 });

      // Then animate to new position
      x_move.set(coords.x, { duration: this.trip_duration, easing: sineInOut });
      y_move.set(coords.y, { duration: this.trip_duration, easing: sineInOut });

      await this.delay(this.trip_duration);
      clearInterval(updateInterval);

      this.rotation = 0;
      this.in_motion = false;

      if (this.waypoint_queue.length > 0) {
        const next = this.waypoint_queue.shift();
        if (next) {
          this.fly_to(next.x, next.y);
        }
      }
    }

    show() {
      this.visible = true;
    }

    hide() {
      this.visible = false;
    }

    private calculate_trip_duration(x_target: number, y_target: number) {
      const delta_x = x_target - this.x;
      const delta_y = y_target - this.y;
      const distance = Math.sqrt(delta_x * delta_x + delta_y * delta_y);
      const speed = 0.1;
      const new_trip_duration = distance / speed;
      this.trip_duration = new_trip_duration > 4000 ? new_trip_duration : 4000;
    }

    private set_banking_angle(x_target: number) {
      const delta_x = x_target - this.x;
      const MAX_BANK_ANGLE = 10;

      if (Math.abs(delta_x) < 1) {
        this.rotation = this.rotation * 0.8;
      } else {
        const bank_angle = Math.sign(delta_x) * MAX_BANK_ANGLE;
        this.rotation = this.rotation * 0.8 + bank_angle * 0.2;
      }
    }

    async add_waypoint(id: string, x: number, y: number) {
      if (id !== this.id) return;
      if (this.in_motion) {
        this.waypoint_queue.push({ x, y });
        return;
      }
      await this.fly_to(x, y);
    }
  }

  const alien = new AlienShip(id);
  const x_move = new Tween(0, {
    duration: alien.trip_duration,
    easing: sineInOut
  });
  const y_move = new Tween(0, {
    duration: alien.trip_duration,
    easing: sineInOut
  });

  $effect(() => {
    alien.set_position(x_move.current, y_move.current);
  });

  const random_in_range = (min: number, max: number, padding: number = 0) => {
    return Math.random() * (max - padding) + min;
  };

  onMount(async () => {
    await tick();

    const h_pad = size * 1.5;
    const v_pad = size * 1.2;

    const s_height = innerHeight?.current ?? window.innerHeight;
    const m_height = s_height * 0.7;

    const x = random_in_range(
      h_pad,
      (innerWidth?.current ?? window.innerWidth) - h_pad,
      size
    );

    const y = random_in_range(v_pad, m_height - v_pad, size);

    alien.set_position(x, y);
    alien.show();
  });

  export const add_waypoint = (id: string, x: number, y: number) => {
    if (id !== alien.id) return;
    console.log("adding waypoint", x, y);
    alien.add_waypoint(alien.id, x, y);
  };
</script>

{#if alien.visible}
  <div
    class="alien"
    style:top="{alien.y}px"
    style:left="{alien.x}px"
    style:width="{size}px"
    style:height="{size}px"
    style:transform="rotate({alien.rotation}deg)"
    in:fade={{ duration: 1000 }}
  >
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
    <div class="country">{code_to_emoji(country)}</div>
  </div>
{/if}

<style>
  .alien {
    position: absolute;
    transition: transform 400ms;
    transform-origin: center;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 5;
  }

  .alien svg {
    width: 2rem;
    height: auto;
  }
  .country {
    position: absolute;
    bottom: 40%;
    left: 90%;
    font-size: 0.6rem;
  }
</style>
