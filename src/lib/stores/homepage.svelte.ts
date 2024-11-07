import type { CelestialBodyData } from "$lib/types/schema";
import { dev } from "$app/environment";

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

const quest_chain = [
  "Launch the ship.",
  "Click to set your first waypoint.",
  "Queue multiple waypoints.",
  "Enter into Jupiter's orbit.",
  "Enter into the orbit of one of Jupiter's moons."
] as const;

// Utility type to create a union of numeric indices up to the length of a tuple
type CreateTupleIndices<
  T extends readonly any[],
  Result extends number[] = []
> = Result["length"] extends T["length"]
  ? Result[number]
  : CreateTupleIndices<T, [...Result, Result["length"]]>;

// Type representing valid indices of the quest_chain array
type ValidIndex = CreateTupleIndices<typeof quest_chain>;

// Type guard to check if a number is a ValidIndex
function isValidIndex(index: number): index is ValidIndex {
  return index >= 0 && index < quest_chain.length;
}

export class Quest {
  public show = $state(true);
  private index = $state(0);
  private maxIndex = quest_chain.length - 1;
  private startTime = $state(0);
  private finalTime = $state(0);
  private completed = $state(false);

  current() {
    if (this.completed) {
      return "Quest complete! Your time was " + this.time() + " seconds.";
    }
    return `[ Quest ${this.index + 1} / ${this.maxIndex + 1} ] ${quest_chain[this.index]}`;
  }

  next(n: number) {
    if (!isValidIndex(n)) {
      if (dev) {
        console.log(`Invalid step index: ${n}`);
      }
      return;
    }

    // Allow the first call to be `next(0)`
    if (this.index === 0 && n === 0) {
      if (dev) {
        console.log("Starting quest at step 0.");
      }
      this.index = n;
      return;
    }

    // Check if the step is in the correct order
    if (n !== this.index + 1) {
      if (dev) {
        console.log(`Attempted to move to step ${n}, but the next step should be ${this.index + 1}.`);
      }
      return;
    }

    // Progress to the next step if it's in the correct order
    this.index = n;

    if (dev) {
      console.log(`Progressed to step ${this.index}.`);
    }

    // Check if the last step is reached
    if (this.index === this.maxIndex) {
      this.end();
    }
  }

  reset() {
    this.index = 0;
    if (dev) {
      console.log("Quest has been reset.");
    }
  }

  end() {
    this.completed = true;
    this.finalTime = Date.now() - this.startTime;
    if (dev) {
      console.log("Quest complete!");
    }
  }

  time() {
    // format time into seconds and milliseconds to the nearest hundredth
    return this.finalTime / 1000;
  }
}

export let quest = new Quest();
