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
