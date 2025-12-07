<script lang="ts">
  import { Tween } from "svelte/motion";
  import { sineInOut } from "svelte/easing";
  import { fade } from "svelte/transition";

  let { id, country }: { id: string; country: string } = $props();

  // Random starting position (will be set on mount)
  const randomX = Math.random() * 800; // Approximate tank width
  const randomY = Math.random() * 400; // Approximate tank height

  class OtherFishState {
    x = $state(randomX);
    y = $state(randomY);
    in_motion = $state(false);
    visible = $state(true); // Show immediately
    waypoint_queue: { x: number; y: number }[] = $state([]);
    trip_duration = $state(2000);

    private delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    set_position(x: number, y: number) {
      this.x = x;
      this.y = y;
    }

    private calculate_trip_duration(target_x: number, target_y: number) {
      const distance = Math.sqrt(
        Math.pow(target_x - this.x, 2) + Math.pow(target_y - this.y, 2)
      );
      this.trip_duration = Math.min(Math.max(distance * 2, 500), 3000);
    }

    async fly_to(x: number, y: number) {
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

    show() {
      this.visible = true;
    }
  }

  const other_fish_state = new OtherFishState();
  const x_move = new Tween(randomX);
  const y_move = new Tween(randomY);

  // Update actual position when tweens change
  $effect(() => {
    other_fish_state.x = x_move.current;
    other_fish_state.y = y_move.current;
  });

  // Expose method for parent
  export function swim_to(x: number, y: number) {
    if (other_fish_state.in_motion) {
      other_fish_state.waypoint_queue.push({ x, y });
      return;
    }
    other_fish_state.fly_to(x, y);
  }
</script>

{#if other_fish_state.visible}
  <circle cx={other_fish_state.x} cy={other_fish_state.y} r="12" fill="#ef4444" opacity="0.6" transition:fade />
{/if}
