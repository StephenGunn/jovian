<script lang="ts">
  import Confetti from "svelte-confetti";
  import Rocket from "./Rocket.svelte";
  import type { CelestialBodyData, Coords } from "$lib/types/schema";
  import { fade, fly } from "svelte/transition";
  import { onMount } from "svelte";
  import { Tween } from "svelte/motion";
  import { debug_mode } from "$lib/data";
  import { sineInOut, sineIn } from "svelte/easing";
  import {
    coords,
    jupiter_data,
    io_data,
    europa_data,
    ganymede_data,
    quest
  } from "$lib/stores/homepage.svelte.js";

  let { broadcast_waypoint }: { broadcast_waypoint: (x: number, y: number) => void } =
    $props();

  class Ship {
    // positioning - start ship off screen to avoid a weird visual jump
    x = $state(-300);
    y = $state(-300);
    z_i = $state(10); // z-index
    ping_coords = $state({ x: 0, y: 0 });

    // visual state
    show_hint = $state(false);
    landed = $state(false);
    large = $state(true);
    rotation = $state(-90);
    ignition = $state(false);
    launched = $state(false);
    ascent_mode = $state(false);
    orbit_radius = $state(0);
    descent_mode = $state(false);
    slow_fade = $state(false);
    flipped = $state(false);

    // movement
    speed = 0.4; // this is changed after launch
    ping = $state(false);
    orbiting = $state(false);
    in_motion = $state(false);
    orbit_target = $state(0);
    trip_counter = $state(0);
    trip_duration = $state(2000);
    orbit_rotation_transform = $state(0);
    waypoint_queue: { x: number; y: number }[] = $state([]);
    target_coords = $state({ x: -1, y: -1 });

    // derrived state
    ship_conatainer_size = $derived(
      this.large ? 150 : this.orbiting ? this.orbit_radius : 50
    );
    size = $derived(this.large ? 150 : 50);

    /////////////////////////////////////////////////////////////////
    // helpers for anitmation sequencing & positioning
    private delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    // set the ship's position without flight or animation
    set_position(x: number, y: number) {
      this.x = x;
      this.y = y;
    }

    // handle navigation commands, if the ship is in motion, add the coords to the queue
    set_waypoint = (x: number, y: number) => {
      // increment the directions
      quest.completed(2);

      if (this.in_motion || this.orbiting || this.ascent_mode || this.descent_mode) {
        this.waypoint_queue.push({ x, y });

        // update the directions text
        if (this.waypoint_queue.length > 0) {
          quest.completed(3);
        }
        return;
      }

      this.fly(x, y);
    };

    // displays the visual marker for the ship's destination
    private async ping_location(x: number, y: number) {
      this.ping_coords = { x, y };
      this.ping = true;
      await this.delay(2000);
      this.ping = false;
    }

    /////////////////////////////////////////////////////////////////
    // flight
    async launch() {
      this.ignition = true;
      this.launched = true;

      // figure out the offscreen coords and flight duration
      const offscreen = { x: this.x, y: this.y - h };
      const coords = { x: this.x, y: offscreen.y - this.size / 2 };
      this.calculate_trip_duration(this.x, this.y - h);

      await this.delay(200);
      this.in_motion = true;

      x_move.set(coords.x, { duration: this.trip_duration, easing: sineIn });
      y_move.set(coords.y, { duration: this.trip_duration, easing: sineIn });

      await this.delay(this.trip_duration);

      // push the ship behind the text
      this.z_i = 5;

      // change ship appearance and speed
      this.large = false;
      this.speed = 0.2;

      // fly to the center of the screen
      this.fly(w * 0.5, h * 0.5, false);

      // increment the directions
      quest.completed(1);
    }

    // fly the ship to the target coords
    private async fly(x: number, y: number, ping: boolean = true) {
      this.flipped = false;
      this.set_rotation_angle(x, y);
      this.calculate_trip_duration(x, y);
      this.slow_fade = false;

      const coords = { x: x - this.size / 2, y: y - this.size / 2 };

      if (ping) {
        this.ping_location(coords.x, coords.y);
      }

      // this will allow us to set the visual representation of where we're flying
      this.target_coords = { x, y };

      await this.delay(200);
      this.in_motion = true;

      x_move.set(coords.x, { duration: this.trip_duration });
      y_move.set(coords.y, { duration: this.trip_duration });

      this.ignition = true;

      await this.delay(this.trip_duration / 2);

      // flip and burn
      this.flipped = true;
      if (this.rotation > 360) {
        this.rotation -= 180;
      } else {
        this.rotation += 180;
      }

      this.ignition = false;
      await this.delay(this.trip_duration / 16);
      this.ignition = true;

      await this.delay(this.trip_duration / 2);

      this.ignition = false;
      this.in_motion = false;
      this.trip_counter++;

      await this.delay(10);

      // handle orbit, if the ship's center stops over a moon or jupiter
      const is_over_body = this.check_if_over_body({ x: this.x, y: this.y });
      if (is_over_body) {
        return;
      }

      this.check_queue();
    }

    private check_queue() {
      if (this.waypoint_queue.length > 0) {
        const next_coords = this.waypoint_queue.shift();
        if (next_coords) {
          this.fly(next_coords.x, next_coords.y);
        }
      }
    }

    private calculate_trip_duration(x_target: number, y_target: number) {
      const delta_x = x_target - this.x;
      const delta_y = y_target - this.y;
      const distance = Math.sqrt(delta_x * delta_x + delta_y * delta_y);
      const new_trip_duration = distance / this.speed;

      // minimum is 2s to avoid weirdness
      this.trip_duration = new_trip_duration > 2000 ? new_trip_duration : 2000;
    }

    private set_rotation_angle(x_target: number, y_target: number) {
      const delta_x = x_target - this.x;
      const delta_y = y_target - this.y;
      const theta_radians = Math.atan2(delta_y, delta_x);

      let theta_degrees = theta_radians * (180 / Math.PI);

      // Normalize to 0-360 degrees
      if (theta_degrees < 0) {
        theta_degrees += 360;
      }

      let delta_angle = theta_degrees - this.rotation;

      // account for the orbit rotation
      delta_angle -= this.orbit_rotation_transform % 360;

      // Normalize the difference to the range -180 to +180 degrees
      if (delta_angle > 180) {
        delta_angle -= 360;
      } else if (delta_angle < -180) {
        delta_angle += 360;
      }

      this.rotation += delta_angle;
      return this.rotation;
    }

    set_launch_position(x: number, y: number) {
      this.x = x;
      this.y = y;
      x_move.set(x, { duration: 0 });
      y_move.set(y, { duration: 0 });
    }

    /////////////////////////////////////////////////////////////////
    // orbital mechanics
    private check_if_over_body(coords: Coords) {
      // center the ship coords
      const centered_ship = { x: coords.x + this.size / 2, y: coords.y + this.size / 2 };

      // using a switch for readability and incase i need to add more features
      switch (true) {
        case this.check_celestial_position(centered_ship, jupiter_data):
          this.set_orbit(0);
          quest.completed(4);
          return true;
        case this.check_celestial_position(centered_ship, io_data):
          this.set_orbit(1);
          quest.completed(5);
          return true;
        case this.check_celestial_position(centered_ship, europa_data):
          this.set_orbit(2);
          quest.completed(5);
          return true;
        case this.check_celestial_position(centered_ship, ganymede_data):
          this.set_orbit(3);
          quest.completed(5);
          return true;
        default:
          return false;
      }
    }

    // figures out if the ship is over a celestial body
    private check_celestial_position(coords: Coords, celestial_body: CelestialBodyData) {
      if (
        coords.x > celestial_body.x &&
        coords.x < celestial_body.x + celestial_body.width &&
        coords.y > celestial_body.y &&
        coords.y < celestial_body.y + celestial_body.height
      ) {
        return true;
      }
      return false;
    }

    // recursive animation for the ship to orbit around the planet
    private ship_orbit = () => {
      if (this.orbiting || this.ascent_mode || this.descent_mode) {
        this.orbit_rotation_transform += 0.25;
      }

      if (this.orbiting || this.ascent_mode || this.descent_mode) {
        // if the orbit is in motion, the orbit center needs to track it
        switch (this.orbit_target) {
          case 1:
            this.adjust_orbit_center(io_data);
            break;
          case 2:
            this.adjust_orbit_center(europa_data);
            break;
          case 3:
            this.adjust_orbit_center(ganymede_data);
            break;
        }

        requestAnimationFrame(this.ship_orbit);
      }
    };

    // move the ship's container to center around the body
    private set_orbit_center(coords: Coords) {
      x_move.set(coords.x, { duration: this.trip_duration, easing: sineIn });
      y_move.set(coords.y, { duration: this.trip_duration, easing: sineIn });
    }

    // for moons in motion while orbiting
    private adjust_orbit_center(moon: CelestialBodyData) {
      x_move.set(moon.x + (moon.width / 2 - this.size / 2), {
        duration: 10,
        easing: sineIn
      });
      y_move.set(moon.y + (moon.height / 2 - this.size / 2), {
        duration: 10,
        easing: sineIn
      });
    }

    // this prevents weirdness from happening while the ship is maneuvering into orbit
    private async set_decent() {
      this.descent_mode = true;
      await this.delay(2000);
      this.descent_mode = false;
    }

    // set the orbit radius and center
    private define_orbit(multiple: number, body: CelestialBodyData) {
      this.orbit_radius = body.width * multiple;
      this.set_orbit_center({
        x: body.x + (body.width / 2 - this.size / 2),
        y: body.y + (body.height / 2 - this.size / 2)
      });

      body.show_info = true;
    }

    // set the orbit target and the center of the orbit
    private async set_orbit(target: 0 | 1 | 2 | 3) {
      this.orbit_target = target;
      this.orbiting = true;
      this.set_decent();

      if (this.waypoint_queue.length > 0) {
        this.waypoint_queue = [];
      }

      switch (target) {
        case 0:
          this.define_orbit(2.5, jupiter_data);
          break;
        case 1:
          this.define_orbit(5, io_data);
          break;
        case 2:
          this.define_orbit(5, europa_data);
          break;
        case 3:
          this.define_orbit(5, ganymede_data);
          break;
      }

      // start the animation
      this.ship_orbit();
    }

    async leave_orbit() {
      this.ascent_mode = true;
      this.orbiting = false;
      await this.delay(2000);
      this.ascent_mode = false;
      this.check_queue();
      jupiter_data.show_info = false;
      io_data.show_info = false;
      ganymede_data.show_info = false;
      europa_data.show_info = false;
    }

    // interactive click handler
    receive_orders(coords: Coords) {
      // multiplayer coords

      if (!this.landed) {
        return;
      }
      if (!this.launched) {
        ship.launch();
        return;
      }

      if (this.descent_mode || this.ascent_mode) {
        return;
      }

      if (this.orbiting) {
        this.leave_orbit();
        return;
      }
      this.set_waypoint(coords.x, coords.y);
    }
  }

  // normal component logic
  const ship = new Ship();

  const x_move = new Tween(0, {
    duration: ship.trip_duration,
    easing: sineInOut
  });
  const y_move = new Tween(0, {
    duration: ship.trip_duration,
    easing: sineInOut
  });

  $effect(() => {
    ship.set_position(x_move.current, y_move.current);
  });

  const handle_mouse_position = (event: MouseEvent) => {
    coords.x = event.clientX;
    coords.y = event.clientY;
  };

  const handle_click = () => {
    ship.receive_orders({ x: coords.x, y: coords.y });
    broadcast_waypoint(coords.x, coords.y);
  };

  // dynamic window position
  let w = $state(0);
  let h = $state(0);

  onMount(() => {
    ship.landed = true;
    quest.reset();

    // Determine where the ship should be launched from, this is not science
    if (w <= 600) {
      ship.set_launch_position(w * 0.15, h * 0.785); // mobile has min-height on waves
    } else if (w <= 800) {
      ship.set_launch_position(w * 0.18, h * 0.85);
    } else if (w <= 1000) {
      ship.set_launch_position(w * 0.22, h * 0.83);
    } else if (w <= 1300) {
      ship.set_launch_position(w * 0.25, h * 0.79);
    } else if (w <= 1600) {
      ship.set_launch_position(w * 0.28, h * 0.79);
    } else {
      ship.set_launch_position(w * 0.3, h * 0.73);
    }

    setTimeout(async () => {
      ship.show_hint = true;
    }, 3000);
  });
</script>

<svelte:window bind:innerWidth={w} bind:innerHeight={h} />

{#snippet Waypoint(x: number, y: number, target: boolean)}
  <div
    class="waypoint"
    class:target
    class:hide={target && ship.flipped}
    style:width="{ship.size}px"
    style:height="{ship.size}px"
    style:top="{y}px"
    style:left="{x}px"
    transition:fade={{ duration: 100 }}
  >
    &times;
  </div>
{/snippet}

{#each ship.waypoint_queue as waypoint}
  {@render Waypoint(waypoint.x, waypoint.y, false)}
{/each}

{#if ship.target_coords.x !== -1 && ship.target_coords.y !== -1 && ship.trip_counter > 0}
  {@render Waypoint(ship.target_coords.x, ship.target_coords.y, true)}
{/if}

<div
  class="box"
  onmousemove={handle_mouse_position}
  onmousedown={handle_click}
  role="button"
  tabindex="-1"
  aria-hidden="true"
></div>
{#if ship.ping}
  <div
    class="ping"
    style:width="{ship.size}px"
    style:height="{ship.size}px"
    style:top="{ship.ping_coords.y}px"
    style:left="{ship.ping_coords.x}px"
    aria-hidden="true"
  ></div>
{/if}
{#if ship.landed}
  <div
    class="ship"
    style:z-index={ship.z_i}
    style:top="{ship.y}px"
    style:left="{ship.x}px"
    style:width="{ship.size}px"
    style:height="{ship.size}px"
    style:transform="rotate({ship.rotation}deg)"
    in:fly={{ delay: 1500, duration: 1500, x: 50 }}
    aria-hidden="true"
  >
    <div
      class="orbit_modifier"
      style:width="{ship.ship_conatainer_size}px"
      style:height="{ship.ship_conatainer_size}px"
      style:transform="rotate({ship.orbit_rotation_transform}deg)"
    >
      <Rocket
        ignition={ship.ignition || ship.orbiting || ship.ascent_mode || ship.descent_mode}
        size={ship.size}
        launched={ship.launched}
        decent_mode={ship.descent_mode}
        orbit_mode={ship.orbiting}
        orbit_size={40}
      />
      {#if !ship.launched && ship.show_hint}
        <div
          class="click_me"
          in:fly={{ duration: 500, x: 30 }}
          out:fly={{ duration: 100, x: 30 }}
        >
          Hey, {w >= 1000 ? "click" : "tap"} to launch!
        </div>
      {/if}
      {#if ship.ignition}
        <div
          class="sparks"
          in:fade={{ duration: 25 }}
          out:fade={{ duration: ship.slow_fade ? 200 : 20 }}
        >
          <Confetti
            infinite
            cone
            noGravity
            size={ship.size < 100 ? 3 : 6}
            colorArray={["#ff6c34", "#ffdb2b"]}
            fallDistance="20px"
            xSpread={0.1}
            x={ship.size < 100 ? [0.2, -0.2] : [0.4, -0.4]}
            y={ship.size < 100 ? [0.1, 0.1] : [0.4, 0.4]}
          />
        </div>
      {/if}
    </div>
  </div>
{/if}
{#if ship.trip_counter === 1 && !ship.in_motion}
  <div
    class="where_to"
    style:z-index={ship.z_i}
    style:top="{ship.y - ship.size * 0.6}px"
    style:left="{ship.x - ship.size * 0.6}px"
    transition:fly={{ duration: 100, x: 30 }}
    aria-hidden="true"
  >
    Where to, hoss?
  </div>
{/if}
{#if debug_mode}
  <div class="debug">
    <p>Mouse X: {coords.x}</p>
    <p>Mouse Y: {coords.y}</p>
    <p>Ship X: {ship.x}</p>
    <p>Ship Y: {ship.y}</p>
    <p>Ship Rotation: {ship.rotation}</p>
    <p>Ship Trip Duration: {ship.trip_duration}</p>
    <p>Ship Orbiting: {ship.orbiting}</p>
    <p>Ship Orbit Radius: {ship.orbit_radius}</p>
    <p>Ship Orbit Target: {ship.orbit_target}</p>
    <p>
      Ship Container Size: {ship.ship_conatainer_size}
    </p>
    <p>Ship size: {ship.size}</p>
  </div>
{/if}

<style>
  .sparks {
    position: absolute;
    left: 10%;
    bottom: 40%;
    width: 20%;
    height: 20%;
    z-index: 2;
    pointer-events: none;
    transform: rotate(-90deg);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .waypoint {
    position: absolute;
    color: var(--primary);
    font-size: 1rem;
    z-index: 10;
    display: flex;
    justify-content: center;
    align-items: center;
    transform: translate(-50%, -50%);
    z-index: 1;
    transition: opacity 200ms;
  }

  .waypoint.target {
    color: var(--secondary);
  }

  .waypoint.hide {
    opacity: 0;
  }
  .ping {
    position: absolute;
    border: 2px solid white;
    border-radius: 50%;
    animation: pulse 1s infinite;
  }
  .debug {
    position: absolute;
    top: 4rem;
    left: 0;
    color: white;
    z-index: 2;
    font-size: 0.6rem;
  }
  .box {
    position: absolute;
    width: 100%;
    height: 100%;
    font-size: 2rem;
    overflow: hidden;
    z-index: 15;
  }

  .ship {
    position: absolute;
    color: white;
    transition: transform 400ms;
    transform-origin: center;
    display: flex;
    justify-content: center;
    z-index: 8;
    align-items: center;
    line-height: 2rem;
  }

  .where_to {
    position: absolute;
    font-family: "Jost", sans-serif;
    font-weight: 300;
    color: white;
    z-index: 10;
    font-size: 13px;
  }

  .click_me {
    position: absolute;
    top: 125%;
    left: 41%;
    transform: rotate(90deg);
    font-family: "Jost", sans-serif;
    font-weight: 300;
    color: white;
    z-index: 10;
    font-size: 14px;
    line-height: 1.4;
    width: 200px;
  }
  .orbit_modifier {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    /*border-top: 1px solid white;*/
    /*border-left: 1px solid blue;*/
    /*border-right: 1px solid red;*/
    /*border-bottom: 1px solid green;*/
    border-radius: 50%;
    transition:
      2s width ease-out,
      2s height ease-out;
  }

  @keyframes pulse {
    0% {
      transform: scale(0);
      opacity: 0;
    }
    50% {
      opacity: 0.2;
    }
    100% {
      opacity: 0;
      transform: scale(1);
    }
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>
