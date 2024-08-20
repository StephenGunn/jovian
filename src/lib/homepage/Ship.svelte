<script lang="ts">
  import { tweened } from "svelte/motion";
  import { sineInOut, sineIn } from "svelte/easing";
  import Rocket from "./Rocket.svelte";
  import { coords, jupiter_data, io_data, europa_data, ganymede_data } from "$lib/stores/homepage.svelte.js";
  import { onMount } from "svelte";
  import type { CelestialBodyData, Coords } from "$lib/types/schema";

  class Ship {
    x = $state(300);
    y = $state(1200);
    large = $state(true);
    rotation = $state(-90);
    trip_duration = $state(2000);
    speed = 0.4;
    ping = $state(false);
    ping_coords = $state({ x: 0, y: 0 });
    ignition = $state(false);
    size = $derived(this.large ? 150 : 50);
    orbit_radius = $state(0);
    orbiting = $state(false);
    ship_conatainer_size = $derived(this.large ? 150 : this.orbiting ? this.orbit_radius : 50);
    in_motion = $state(false);
    waypoint_queue: { x: number; y: number }[] = $state([]);
    launched = $state(false);
    orbit_target = $state(0);
    ascent_mode = $state(false);
    descent_mode = $state(false);
    orbit_rotation_transform = $state(0);

    ship_orbit = () => {
      console.log("orbiting");
      if (this.orbiting || this.ascent_mode || this.descent_mode) {
        this.orbit_rotation_transform += 0.25;
      }
      if (this.orbiting || this.ascent_mode || this.descent_mode) {
        requestAnimationFrame(this.ship_orbit);
      }
    };

    set_position(x: number, y: number) {
      this.x = x;
      this.y = y;
    }

    set_waypoint = (x: number, y: number) => {
      if (this.in_motion || this.orbiting) {
        this.waypoint_queue.push({ x, y });
        return;
      }
      this.fly(x, y);
    };

    set_orbit_center(coords: Coords) {
      x_move.set(coords.x, { duration: this.trip_duration, easing: sineIn });
      y_move.set(coords.y, { duration: this.trip_duration, easing: sineIn });
    }

    async set_orbit(number: 0 | 1 | 2 | 3, immediate: boolean = false) {
      this.orbit_target = number;

      await this.delay(immediate ? 0 : this.trip_duration);

      this.orbiting = true;

      switch (number) {
        case 0:
          this.orbit_radius = jupiter_data.width * 2.5;
          this.set_orbit_center({
            x: jupiter_data.x + (jupiter_data.width / 2 - this.size / 2),
            y: jupiter_data.y + (jupiter_data.height / 2 - this.size / 2)
          });
          break;
        case 1:
          this.orbit_radius = 200;
          break;
        case 2:
          this.orbit_radius = 300;
          break;
        case 3:
          this.orbit_radius = 400;
          break;
      }

      this.ship_orbit();
    }

    async leave_orbit() {
      this.ascent_mode = true;
      this.orbiting = false;
      await this.delay(2000);
      this.ascent_mode = false;
      this.check_queue();
    }

    ping_location(x: number, y: number) {
      this.ping_coords = { x, y };
      this.ping = true;
      setTimeout(() => {
        this.ping = false;
      }, 2000);
    }

    // helper for anitmation
    delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    async fly(x: number, y: number, ping: boolean = true) {
      this.set_rotation_angle(x, y);
      this.calculate_trip_duration(x, y);

      const coords = { x: x - this.size / 2, y: y - this.size / 2 };

      if (ping) {
        this.ping_location(coords.x, coords.y);
      }

      await this.delay(200);
      this.in_motion = true;

      x_move.set(coords.x, { duration: this.trip_duration });
      y_move.set(coords.y, { duration: this.trip_duration });

      this.ignition = true;

      await this.delay(this.trip_duration / 2);

      if (this.rotation > 360) {
        this.rotation -= 180;
      } else {
        this.rotation += 180;
      }

      // flip and burn
      this.ignition = false;
      await this.delay(this.trip_duration / 16);
      this.ignition = true;

      await this.delay(this.trip_duration / 2);

      this.ignition = false;
      this.in_motion = false;

      await this.delay(10);
      this.check_queue();
    }

    check_queue() {
      if (this.waypoint_queue.length > 0) {
        const next_coords = this.waypoint_queue.shift();
        if (next_coords) {
          this.fly(next_coords.x, next_coords.y);
        }
      }
    }

    async launch() {
      this.ignition = true;
      this.launched = true;

      const escape_pixelocity = h;

      const offscreen = { x: this.x, y: this.y - escape_pixelocity };

      this.calculate_trip_duration(this.x, this.y - escape_pixelocity);
      const coords = { x: this.x, y: offscreen.y - this.size / 2 };

      await this.delay(200);
      this.in_motion = true;

      x_move.set(coords.x, { duration: this.trip_duration, easing: sineIn });
      y_move.set(coords.y, { duration: this.trip_duration, easing: sineIn });

      await this.delay(this.trip_duration);

      this.large = false;
      this.speed = 0.2;

      this.fly(w * 0.5, h * 0.5, false);
    }

    calculate_trip_duration(x_target: number, y_target: number) {
      const delta_x = x_target - this.x;
      const delta_y = y_target - this.y;
      const distance = Math.sqrt(delta_x * delta_x + delta_y * delta_y);
      const new_trip_duration = distance / this.speed;

      this.trip_duration = new_trip_duration > 2000 ? new_trip_duration : 2000;
    }

    set_rotation_angle(x_target: number, y_target: number) {
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
  }

  const ship = new Ship();

  const x_move = tweened(0, {
    duration: ship.trip_duration,
    easing: sineInOut
  });
  const y_move = tweened(0, {
    duration: ship.trip_duration,
    easing: sineInOut
  });

  $effect(() => {
    ship.set_position($x_move, $y_move);
  });

  const handle_mouse_position = (event: MouseEvent) => {
    coords.x = event.clientX;
    coords.y = event.clientY;
  };

  const check_celestial_position = (coords: Coords, celestial_body: CelestialBodyData) => {
    if (
      coords.x > celestial_body.x &&
      coords.x < celestial_body.x + celestial_body.width &&
      coords.y > celestial_body.y &&
      coords.y < celestial_body.y + celestial_body.height
    ) {
      return true;
    }
    return false;
  };

  const handle_click = () => {
    if (!ship.launched) {
      ship.launch();
      return;
    }

    // CLICKING ON JUPITER
    // check to see if the coords are within the bounds of jupiter
    if (check_celestial_position(coords, jupiter_data)) {
      console.log("hi jupiter", jupiter_data);

      // if we are orbiting jupiter and we click on jupiter
      if (ship.orbit_target === 0 && ship.orbiting) {
        ship.leave_orbit();
        return;
      }

      // if we are not orbiting jupiter but the ship is already over the planet
      if (!ship.orbiting && check_celestial_position({ x: ship.x, y: ship.y }, jupiter_data)) {
        ship.set_orbit(0, true);
        return;
      }

      ship.set_waypoint(coords.x, coords.y);
      ship.set_orbit(0);
      return;
    }

    // check to see if the coords are within the bounds of io
    if (check_celestial_position(coords, io_data)) {
      console.log("hi io");
    }

    // check to see if the coords are within the bounds of europa
    if (check_celestial_position(coords, europa_data)) {
      console.log("hi europa");
    }

    // check to see if the coords are within the bounds of ganymede
    if (check_celestial_position(coords, ganymede_data)) {
      console.log("hi ganymede");
    }

    // if we didn't click on a body but we're orbiting
    if (ship.orbiting) {
      ship.set_waypoint(coords.x, coords.y);

      ship.leave_orbit();
      return;
    }
    //console.log("io", io_data);
    //console.log("europa", europa_data);
    //console.log("ganymede", ganymede_data);
    ship.set_waypoint(coords.x, coords.y);
  };

  let w = $state(0);
  let h = $state(0);

  onMount(() => {
    ship.set_launch_position(w * 0.22, h * 0.745);
  });
</script>

<svelte:window bind:innerWidth={w} bind:innerHeight={h} />

<div class="box" onmousemove={handle_mouse_position} onmousedown={handle_click} role="button" tabindex="-1">
  {#if ship.ping}
    <div
      class="ping"
      style:width="{ship.size}px"
      style:height="{ship.size}px"
      style:top="{ship.ping_coords.y}px"
      style:left="{ship.ping_coords.x}px"
    ></div>
  {/if}
  <div
    class="ship"
    style:top="{ship.y}px"
    style:left="{ship.x}px"
    style:width="{ship.size}px"
    style:height="{ship.size}px"
    style:transform="rotate({ship.rotation}deg)"
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
    </div>
  </div>
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
</div>

<style>
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
    z-index: 10;
  }

  .ship {
    position: absolute;
    color: white;
    transition: transform 400ms;
    transform-origin: center;
    display: flex;
    justify-content: center;
    align-items: center;
    line-height: 2rem;
  }

  .orbit_modifier {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    border-top: 1px solid white;
    border-left: 1px solid blue;
    border-right: 1px solid red;
    border-bottom: 1px solid green;
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
