<script lang="ts">
  import { Tween } from "svelte/motion";
  import { sineInOut } from "svelte/easing";

  class FishState {
    x = $state(0);
    y = $state(0);
    in_motion = $state(false);
    waypoint_queue: { x: number; y: number }[] = $state([]);
    trip_duration = $state(1500);

    private delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    set_position(x: number, y: number) {
      this.x = x;
      this.y = y;
    }

    swim_to = (x: number, y: number) => {
      if (this.in_motion) {
        this.waypoint_queue.push({ x, y });
        return;
      }

      this.fly_to(x, y);
    };

    private calculate_trip_duration(target_x: number, target_y: number) {
      const distance = Math.sqrt(
        Math.pow(target_x - this.x, 2) + Math.pow(target_y - this.y, 2)
      );
      // Scale duration based on distance (min 500ms, max 3000ms)
      this.trip_duration = Math.min(Math.max(distance * 2, 500), 3000);
    }

    private async fly_to(x: number, y: number) {
      this.calculate_trip_duration(x, y);

      this.in_motion = true;

      // Set tweens to current position first
      x_move.set(this.x, { duration: 0 });
      y_move.set(this.y, { duration: 0 });

      // Then animate to new position
      x_move.set(x, { duration: this.trip_duration, easing: sineInOut });
      y_move.set(y, { duration: this.trip_duration, easing: sineInOut });

      await this.delay(this.trip_duration);

      this.in_motion = false;

      // Process queue
      if (this.waypoint_queue.length > 0) {
        const next = this.waypoint_queue.shift();
        if (next) {
          this.fly_to(next.x, next.y);
        }
      }
    }
  }

  const fish_state = new FishState();
  const x_move = new Tween(0);
  const y_move = new Tween(0);

  // Update actual position when tweens change
  $effect(() => {
    fish_state.x = x_move.current;
    fish_state.y = y_move.current;
  });

  // Expose methods for parent
  export function swim_to(x: number, y: number) {
    fish_state.swim_to(x, y);
  }

  export function set_position(x: number, y: number) {
    fish_state.set_position(x, y);
    x_move.set(x, { duration: 0 });
    y_move.set(y, { duration: 0 });
  }
</script>

<!-- Your fish (bigger, different color) -->
<circle cx={fish_state.x} cy={fish_state.y} r="15" fill="#3b82f6" opacity="0.8" />
