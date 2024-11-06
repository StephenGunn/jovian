import type { CelestialBodyData } from "$lib/types/schema";

export let metric = $state(false);
export let miles = $state(false);
export let days = $state(false);

class Coords {
  x = $state(0);
  y = $state(0);
}
export const coords = new Coords();

export let jupiter_data: CelestialBodyData = $state({ x: 0, y: 0, width: 0, height: 0, show_info: false });
export let io_data: CelestialBodyData = $state({ x: 0, y: 0, width: 0, height: 0, show_info: false });
export let europa_data: CelestialBodyData = $state({ x: 0, y: 0, width: 0, height: 0, show_info: false });
export let ganymede_data: CelestialBodyData = $state({ x: 0, y: 0, width: 0, height: 0, show_info: false });

export class Directions {
  private directions = [
    "Click to launch the ship.",
    "Click to set your first waypoint.",
    "You can queue waypoints to guide the ship.",
    "Have you tried setting a waypoint to Jupiter?",
    "You can also set waypoints to the moons of Jupiter."
  ] as const;

  public show = $state(true);
  private index = $state(0);
  private maxIndex = this.directions.length - 1;

  current() {
    return `[ ${this.index + 1} / ${this.maxIndex + 1} ] ${this.directions[this.index]}`;
  }

  next(n: number) {
    // only increment by 1 if n is +1 than the current index
    if (n === this.index + 1) {
      this.index = Math.min(this.index + 1, this.maxIndex);
    }
  }

  prev() {
    this.index = Math.max(this.index - 1, 0);
  }

  reset() {
    this.index = 0;
  }

  hide() {
    this.show = false;
  }
}

export let directions = new Directions();
