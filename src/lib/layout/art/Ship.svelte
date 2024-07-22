<script lang="ts">
  import { tweened } from "svelte/motion";
  import { sineInOut } from "svelte/easing";

  class Ship {
    width = 30;
    height = 30;
    x = $state(200);
    y = $state(200);
    rotation = $state(89);
    trip_duration = $state(2000);
    speed = 0.15;
    ping = $state(false);
    ping_coords = $state({ x: 0, y: 0 });

    set_position(x: number, y: number) {
      this.x = x;
      this.y = y;
    }

    ping_location(x: number, y: number) {
      this.ping_coords = { x, y };
      this.ping = true;
      setTimeout(() => {
        this.ping = false;
      }, 2000);
    }

    fly(x: number, y: number) {
      this.set_rotation_angle(x, y);
      this.calculate_trip_duration(x, y);
      // use the width and height to offset the ship center
      // to the mouse click position
      const coords = { x: x - this.width / 2, y: y - this.height / 2 };
      this.ping_location(coords.x, coords.y);

      setTimeout(() => {
        x_move.set(coords.x, { duration: this.trip_duration });
        y_move.set(coords.y, { duration: this.trip_duration });
      }, 200);

      // flip the ship 180 degrees half way through the flight for breaking burn
      setTimeout(() => {
        this.rotation += 180;
      }, this.trip_duration / 2);
    }

    calculate_trip_duration(x_target: number, y_target: number) {
      const delta_x = x_target - this.x;
      const delta_y = y_target - this.y;

      // Calculate the distance to the target
      const distance = Math.sqrt(delta_x * delta_x + delta_y * delta_y);

      // Calculate the trip duration based on the distance and speed
      const new_trip_duration = distance / this.speed;

      console.log(`distance: ${distance}`);

      this.trip_duration = new_trip_duration > 2000 ? new_trip_duration : 2000;
    }

    set_rotation_angle(x_target: number, y_target: number) {
      const delta_x = x_target - this.x;
      const delta_y = y_target - this.y;

      console.log(`x_target: ${x_target}, y_target: ${y_target}`);
      console.log(`x: ${this.x}, y: ${this.y}`);

      console.log(`delta_x: ${delta_x}, delta_y: ${delta_y}`);
      // Calculate the angle in radians
      const theta_radians = Math.atan2(delta_y, delta_x);

      // Convert radians to degrees
      let theta_degrees = theta_radians * (180 / Math.PI);

      // Normalize to 0-360 degrees
      if (theta_degrees < 0) {
        theta_degrees += 360;
      }

      // Calculate the difference between the current rotation and the target angle
      let delta_angle = theta_degrees - this.rotation;

      // Normalize the difference to the range -180 to +180 degrees
      if (delta_angle > 180) {
        delta_angle -= 360;
      } else if (delta_angle < -180) {
        delta_angle += 360;
      }

      // Update the rotation to the new angle
      this.rotation += delta_angle;

      return this.rotation;
    }
  }

  const ship = new Ship();

  const x_move = tweened(200, {
    duration: ship.trip_duration,
    easing: sineInOut
  });
  const y_move = tweened(400, {
    duration: ship.trip_duration,
    easing: sineInOut
  });

  $effect(() => {
    ship.set_position($x_move, $y_move);
  });

  class Coords {
    x = $state(0);
    y = $state(0);
  }
  const coords = new Coords();

  const handle_mouse_position = (event: MouseEvent) => {
    coords.x = event.clientX;
    coords.y = event.clientY;
  };

  const handle_click = () => {
    ship.fly(coords.x, coords.y);
  };

  //$inspect(ship.x, ship.y, ship.rotation);
</script>

<div class="box" onmousemove={handle_mouse_position} onmousedown={handle_click}>
  {#if ship.ping}
    <div
      class="ping"
      style:width="{ship.width}px"
      style:height="{ship.height}px"
      style:top="{ship.ping_coords.y}px"
      style:left="{ship.ping_coords.x}px"
    ></div>
  {/if}
  <div
    class="ship"
    style:top="{ship.y}px"
    style:left="{ship.x}px"
    style:width="{ship.width}px"
    style:height="{ship.height}px"
    style:transform="rotate({ship.rotation}deg)"
  >
    >
  </div>
  <div class="debug">
    <p>Mouse X: {coords.x}</p>
    <p>Mouse Y: {coords.y}</p>
    <p>Ship X: {ship.x}</p>
    <p>Ship Y: {ship.y}</p>
    <p>Ship Rotation: {ship.rotation}</p>
    <p>Ship Trip Duration: {ship.trip_duration}</p>
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
    width: 2rem;
    height: 2rem;
    transition: transform 400ms;
    transform-origin: center;
    display: flex;
    justify-content: center;
    align-items: center;
    line-height: 2rem;
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
</style>
