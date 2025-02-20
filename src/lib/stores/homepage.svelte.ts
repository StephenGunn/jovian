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

export let jupiter_data: CelestialBodyData = $state({
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  show_info: false
});
export let io_data: CelestialBodyData = $state({
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  show_info: false
});
export let europa_data: CelestialBodyData = $state({
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  show_info: false
});
export let ganymede_data: CelestialBodyData = $state({
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  show_info: false
});

type QuestStep = {
  id: number;
  description: string;
  next_id?: number;
  completed: boolean;
};

// Define the quest chain as an array of steps
const quest_chain: QuestStep[] = [
  { id: 1, description: "Launch the ship.", next_id: 2, completed: false },
  {
    id: 2,
    description: "Click to set your first waypoint.",
    next_id: 3,
    completed: false
  },
  { id: 3, description: "Queue multiple waypoints.", next_id: 4, completed: false },
  { id: 4, description: "Enter into Jupiter's orbit.", next_id: 5, completed: false },
  {
    id: 5,
    description: "Enter into the orbit of one of Jupiter's moons.",
    completed: false
  }
];

// Create a map for quick lookup by ID
const quest_map = new Map(quest_chain.map((step) => [step.id, step]));

export class Quest {
  public show = $state(true);
  private current_step_id = $state(1);
  private start_time = $state(0);
  private final_time = $state(0);
  private finished = $state(false);

  current() {
    if (this.finished) {
      return "Quest complete! Your time was " + this.time() + " seconds.";
    }

    const current_step = quest_map.get(this.current_step_id);
    if (current_step) {
      return `[ Quest ${current_step.id} / ${quest_map.size} ] ${current_step.description}`;
    }
    return "No current quest step.";
  }

  completed(step_id: number) {
    const current_step = quest_map.get(this.current_step_id);
    const step_to_complete = quest_map.get(step_id);

    if (!step_to_complete) {
      if (dev) {
        console.log(`Step with ID ${step_id} not found.`);
      }
      return;
    }

    if (step_id !== this.current_step_id) {
      if (dev) {
        console.log(
          `Attempted to complete step ${step_id}, but the current step is ${this.current_step_id}.`
        );
      }
      return;
    }

    // Mark the step as complete and set the start time if it's the first step
    step_to_complete.completed = true;
    if (step_id === 1) {
      this.start_time = Date.now();
      if (dev) {
        console.log("Quest started at step 1.");
      }
    }

    if (dev) {
      console.log(`Step ${step_id} marked as complete.`);
    }

    // Progress to the next step if there is one
    if (current_step && current_step.next_id) {
      this.current_step_id = current_step.next_id;
      if (dev) {
        console.log(
          `Progressed to step ${this.current_step_id}: ${quest_map.get(this.current_step_id)?.description}`
        );
      }
    } else {
      this.end();
    }
  }

  reset() {
    this.current_step_id = 1;
    this.finished = false;
    this.start_time = 0;
    this.final_time = 0;
    quest_chain.forEach((step) => (step.completed = false));
    if (dev) {
      console.log("Quest has been reset. All steps are marked as incomplete.");
    }
  }

  end() {
    this.finished = true;
    this.final_time = Date.now() - this.start_time;
    if (dev) {
      console.log("Quest complete!");
    }
  }

  time() {
    // Format time into seconds with milliseconds to the nearest hundredth
    return (this.final_time / 1000).toFixed(2);
  }
}

export let quest = new Quest();

export let wave_ref: {
  width: number | undefined;
  height: number | undefined;
} = $state({
  width: undefined,
  height: undefined
});

export let scene_ref: {
  width: number | undefined;
  height: number | undefined;
} = $state({
  width: undefined,
  height: undefined
});

class RepelAnimation {
  prevX = $state(0);
  prevY = $state(0);
  targetX = $state(0);
  targetY = $state(0);

  MAX_DISPLACEMENT = 30;
  MOVEMENT_MULTIPLIER = 1;

  constructor(options?: { maxDisplacement?: number; multiplier?: number }) {
    if (options) {
      this.MAX_DISPLACEMENT = options.maxDisplacement ?? this.MAX_DISPLACEMENT;
      this.MOVEMENT_MULTIPLIER = options.multiplier ?? this.MOVEMENT_MULTIPLIER;
    }
  }

  set_repel(currentX: number, currentY: number) {
    // Only calculate delta if we have previous positions
    if (this.prevX !== 0 || this.prevY !== 0) {
      // Calculate mouse movement delta
      const deltaX = currentX - this.prevX;
      const deltaY = currentY - this.prevY;

      // If there's movement, update the targets to max values based on direction
      if (Math.abs(deltaX) > 0.1 || Math.abs(deltaY) > 0.1) {
        this.targetX = deltaX > 0 ? -this.MAX_DISPLACEMENT : this.MAX_DISPLACEMENT;
        this.targetY = deltaY > 0 ? -this.MAX_DISPLACEMENT : this.MAX_DISPLACEMENT;
      }
    }

    // Update previous positions
    this.prevX = currentX;
    this.prevY = currentY;

    return { x: Math.round(this.targetX), y: Math.round(this.targetY) };
  }
}

export const repelAnimation = new RepelAnimation();
