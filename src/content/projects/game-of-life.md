---
title: Conway's Game of Life
description: "Life implemented in Svelte 4 using the DOM as a way to test the framework."
date: "2022-07-01"
categories:
  - sveltekit
  - svelte 4
  - experiment
  - open source
published: true
project_status: "Live"
repo_url: "https://github.com/StephenGunn/game-of-life-svelte"
live_url: "https://life.jovianmoon.io/"
---

<script lang="ts">
    import ProjectLinks from '$lib/layout/ProjectLinks.svelte';
</script>

<ProjectLinks repo="https://github.com/StephenGunn/game-of-life-svelte" link="https://life.jovianmoon.io/" />

## Conway's Game of Life

I've always loved the simplicity of Conway's Game of Life. When I started the project, I
knew it had been done a thousand times before, but I wanted to see how well Svelte 4 could
handle it using the DOM instead of a more traditional `<canvas>` element.

I ended up adding some extra features, like the ability to draw on the grid, place
gliders, and control the size and speed. I built this over a weekend. It was a fun
project.

## Using the DOM

I purposely chose to use the DOM to see how well Svelte 4 could handle it. I was
pleasantly surprised by how well it worked.

Granted, I am not redrawing elements but only toggling classes. Here is the svelte
component that represents a single cell:

```svelte
<script lang="ts">
  import { cell_size, game } from "$lib/game/data";

  export let row: number = 0;
  export let column: number = 0;

  // does this cell still exist on the game board?
  $: available = ($game ?? []).length > row || ($game[column] ?? []).length > column;

  // cellular automaton
  $: alive = available && $game[row] && $game[row][column] && $game[row][column] === 1;
</script>

<div
  class="cell"
  class:alive
  style:width="{$cell_size}px"
  style:height="{$cell_size}px"
/>

<style>
  .cell {
    border: 1px solid var(--accent);
    background: transparent;
    font-size: 0.5rem;
    display: grid;
    place-content: center;
    color: var(--muted);
    overflow: hidden;
  }
  .cell:hover {
    background: var(--muted);
  }

  .alive {
    background: var(--primary);
    color: var(--background);
    font-weight: bold;
  }
</style>
```

## Drawing a Responsive Grid

I wanted to make the grid responsive, but I couldn't use plain old CSS because I needed to
build the grid in JavaScript. I ended up using a `derived` store to determine the grid
based on the window size. It also adjusts to the size of the window if it changes.

```typescript
export const grid = derived([container, cell_size], ([$container, $cell_size]) => ({
  // two are subtracted from total columns for desktop, one for mobile
  columns: Math.floor($container.w / $cell_size) - ($container.w > 768 ? 2 : 1),
  // one is subtracted from total rows for desktop, three for mobile
  rows: Math.floor($container.h / $cell_size) - ($container.w > 768 ? 1 : 4),
  pixel_w: Math.floor($container.w / $cell_size) * $cell_size,
  pixel_h: Math.floor($container.h / $cell_size) * $cell_size,
  // cell manipulations are repeated here to help with positioning of the grid
  // the orphaned width is used for the margin on mobile too, to create a nice looking set of margins
  orphaned_w:
    ($container.w % $cell_size) + ($container.w > 768 ? $cell_size * 2 : $cell_size) - 1,
  orphaned_h:
    $container.w > 768
      ? ($container.h % $cell_size) + $cell_size
      : ($container.w % $cell_size) + $cell_size - 1
}));
```

## Drawing on the Grid

I added the ability to draw on the grid while the game is running. There is a second grid
on top of the game grid that stores the drawn state until the mouse click is released, at
which point the new state is merged into the game state. This prevented the game from
being paused while drawing.

I also added the ability to place gliders on the grid. This was a fun feature to add. The
state of the glider is stored in 2D arrays, and I think they are cute, so here they are:

```typescript
type CustomShape = (0 | 1)[][];

// keeping these in the same order as I include them below
const glider_ne: CustomShape = [
  [1, 1, 0],
  [0, 1, 1],
  [1, 0, 0]
];
const glider_se: CustomShape = [
  [1, 0, 0],
  [0, 1, 1],
  [1, 1, 0]
];
const glider_sw: CustomShape = [
  [0, 0, 1],
  [1, 1, 0],
  [0, 1, 1]
];
const glider_nw: CustomShape = [
  [0, 1, 1],
  [1, 1, 0],
  [0, 0, 1]
];

// add gliders to array
export const gliders = [glider_ne, glider_se, glider_sw, glider_nw];

// direction is index of group array
export const shape_direction = writable(1);
```

## The Game Logic

I will admit, I would like to go back and refactor this to be more efficient. I used a
`setInterval` when I should've used a `while` loop or even recursion. I was just having
fun and wanted to be able to slow the game down at will... but life is not that fun when
it's slow.

```typescript
const count_neighbors = (row: number, column: number) => {
  // we are using another set of nested loops to count all of our neighbors
  // using the modulus op to do the wrap-around check... This was hard.
  // subtract the value of the original cell (it's not a neighbor to itself)
  // to not throw off the count.
  let neighbors_found = 0;

  // 3x3 sub-grid
  for (let relative_row = -1; relative_row < 2; relative_row++) {
    for (let relative_column = -1; relative_column < 2; relative_column++) {
      // wrap-around logic
      let target_row = (row + relative_row + $grid.rows) % $grid.rows;
      let target_column = (column + relative_column + $grid.columns) % $grid.columns;
      neighbors_found += $game[target_row][target_column];
    }
  }
  neighbors_found -= $game[row][column];
  return neighbors_found;
};

let game_loop: ReturnType<typeof setInterval>;
const next_step = () => {
  // if nothing is left, stop the game before we loop through everything.
  if ($currently_alive === 0) {
    $is_currently_playing = false;
    clearInterval(game_loop);
  }

  // init our next frame in row -> column standard
  let next_generation: (0 | 1)[][];
  next_generation = new Array($grid.rows);
  for (let row = 0; row < $grid.rows; row++) {
    next_generation[row] = new Array($grid.columns);
  }

  // count our generation
  $generation += 1;

  // iterate through our game
  for (let row = 0; row < $grid.rows; row++) {
    for (let column = 0; column < $grid.columns; column++) {
      // let's try and make this a little nicer
      let state = $game[row][column];
      const neighbors = count_neighbors(row, column);
      if (state === 0 && neighbors === 3) {
        next_generation[row][column] = 1;
      } else if (state === 1 && (neighbors < 2 || neighbors > 3)) {
        next_generation[row][column] = 0;
      } else {
        next_generation[row][column] = state;
      }
    }
  }

  // check if there is draw data to work into the next frame
  if ($draw_this_data.length) {
    for (let cell = 0; cell < $draw_this_data.length; cell++) {
      next_generation[$draw_this_data[cell][0]][$draw_this_data[cell][1]] = 1;
    }

    // clear out the store
    $draw_this_data = [];
  }

  // overwrite our game state with our next step.
  $game = next_generation;
};
```

## Conclusion

This is one of those projects that I am really glad I built. It was a lot of fun, and I
learned quite a bit. I hope you check it out and have some fun with it too.

Let me know if you hack it into something cool. I'd love to see it
