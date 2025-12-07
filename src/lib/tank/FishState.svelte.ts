import { Tween } from "svelte/motion";
import { sineInOut } from "svelte/easing";

export type FishDirection = "east" | "west";

export class FishState {
  x = $state(0);
  y = $state(0);
  facing: FishDirection = $state("east");
  in_motion = $state(false);
  visible = $state(true);
  waypoint_queue: { x: number; y: number }[] = $state([]);
  trip_duration = $state(1500);

  // Tween instances for smooth movement
  x_move: Tween<number>;
  y_move: Tween<number>;

  constructor(initial_x: number = 0, initial_y: number = 0) {
    this.x = initial_x;
    this.y = initial_y;
    this.x_move = new Tween(initial_x);
    this.y_move = new Tween(initial_y);

    // Update position when tweens change
    $effect(() => {
      this.x = this.x_move.current;
      this.y = this.y_move.current;
    });
  }

  private delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  set_position(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.x_move.set(x, { duration: 0 });
    this.y_move.set(y, { duration: 0 });
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

  private update_facing_direction(target_x: number) {
    // If moving to the right, face east; if moving to the left, face west
    if (target_x > this.x) {
      this.facing = "east";
    } else if (target_x < this.x) {
      this.facing = "west";
    }
    // If target_x === this.x, keep current facing
  }

  private async fly_to(x: number, y: number) {
    this.calculate_trip_duration(x, y);
    this.update_facing_direction(x);

    this.in_motion = true;

    // Set tweens to current position first
    this.x_move.set(this.x, { duration: 0 });
    this.y_move.set(this.y, { duration: 0 });

    // Then animate to new position
    this.x_move.set(x, { duration: this.trip_duration, easing: sineInOut });
    this.y_move.set(y, { duration: this.trip_duration, easing: sineInOut });

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

  hide() {
    this.visible = false;
  }
}
