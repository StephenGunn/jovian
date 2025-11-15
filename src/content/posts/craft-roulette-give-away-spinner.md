---
title:
  "Building the Craft Roulette Giveaway Spinner: Three Years of Interactive OBS
  Development"
description:
  Building an automated prize wheel system with Svelte, WebSockets, Stream Deck, and
  Directus to manage weekly giveaways for hundreds of contributors.
date: "2025-11-15"
categories:
  - sveltekit
  - obs
  - directus
  - elgato
  - websockets
published: true
bluesky_thread_id: "3m5ox7m35i22t"
---

<script lang="ts">
    import GiveawaySpinner from '$lib/components/blog/GiveawaySpinner.svelte';
    import ProjectLayout from "$lib/components/blog/svgs/SpinnerDiagram.svelte"
    import MediaPlayer from '$lib/layout/MediaPlayer.svelte';
</script>

## Overview

[Craft Roulette](https://craftroulette.live) is a weekly live card-making challenge show I
started with my mom at the start of the 2020 pandemic lockdown. What began as a fun live
stream to 9 viewers turned into a real business with hundreds of weekly contributors and
paying members.

<MediaPlayer video="https://github.com/user-attachments/assets/18b4951c-8e17-42c1-88a1-4d2b2cf68f32" />

> note: This giveaway had ~2.5k unique names as contestants. The spin is a 20 second
> constant length.

Each YouTube live stream features a new, randomized art challenge. We invite the entire
audience to participate in the challenge and submit their finished projects through the
website, which enters them into a weekly giveaway drawing.

As our challenge grew, I knew I needed a way to handle our giveaways. It was easy when we
had 10 contributors, but got messy at low numbers like 20. imagine trying 100, let alone
500 by hand.

Since I use web tech for everything (with a postgres database as the source of truth),
I've been able to automate a lot of the show's complexity. The show is designed to run in
a self-sustaining cycle - last week's contributors power this week's giveaway, this week's
winners get saved to the database, and the cycle continues. This post focuses on the
giveaway spinner - how it loads data, how the spinning physics work, and how it connects
to my Stream Deck for live control. I built the first version over three years ago and
have been adding features ever since to reduce our weekly overhead.

<!-- VIDEO/GIF PLACEHOLDER: Spinner in action -->

## The Demo

<GiveawaySpinner />

## System Architecture Summary

The giveaway spinner uses a similar HTTP → WebSocket → Browser Source architecture to what
I detailed in my previous post about
[interactive OBS overlays](/posts/making-an-interactive-obs-overlay-with-cloudflare-durable-objects-and-svelte).
Here's the quick version:

1. Stream Deck sends HTTP requests to a Node.js WebSocket server
2. The server validates the request and forwards it as a WebSocket message
3. The browser source (running in OBS at 1920x1080px) receives the message and triggers
   actions
4. WebSocket RPC-style commands rather than syncing state - the browser sources maintain
   their own state

<ProjectLayout />

> note: I might be able to connect directly to my websocket server from my Stream Deck but
> prefer to avoid the chance of instability. Using HTTP requests has been 100% rock solid
> for years.

The stream overlays are all in a single SvelteKit application. The root `+layout.svelte`
contains a static 1920x1080px absolutely-positioned `<div>` that functions as my screen
canvas. All visual elements (the colorful wheel, the name picker, the winners list, and
sponsor tags) are absolutely positioned layers inside this canvas that respond to
WebSocket commands.

> note: It's really fun to develop with a static canvas size.

### Browser Source Communication via Local Storage

Inside of OBS, Browser Sources behave like individual browser tabs do - they are isolated
browser instances, but we can get them to share state via localStorage. I use Svelte
stores tied to localStorage to sync state across all 30+ browser sources that power the
show.

There's a dedicated OBS scene just for data loading - a single browser source with no
visual content that loads all episode data from Directus into localStorage. Since OBS lets
you configure whether a browser source loads when it's not visible, this "data loader"
scene runs in the background and populates localStorage for all the other overlays to
consume.

This architecture means each overlay maintains its own state using reactive Svelte stores,
and they all stay in sync through localStorage rather than constantly fetching from the
database.

## Loading Contributors from the Database

The spinner loads contributors from the previous episode, creating a self-sustaining
weekly cycle. When the show goes live for episode 200, the spinner is populated with
everyone who submitted a project for episode 199. This means the show essentially runs
itself - each week's content automatically feeds into the next week's giveaway.

The data loading happens through a SvelteKit server endpoint that queries the Directus
database:

> note: Code examples have been refactored for clarity. This application was originally
> built with Svelte 3, upgraded to Svelte 4, and uses an outdated version of SvelteKit.
> Since it's not customer-facing, upgrading isn't a priority. Examples use Svelte 3/4
> syntax since Svelte 5 is significantly different.

```typescript
// loader/+server.ts - Fetching contributors from Directus
// Note: Using my custom Directus API abstraction (built before the official SDK)
export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();

  // Query Directus for the episode with all its contributions
  const episode_query: Episode[] = await api({
    target: "/items/episodes",
    method: "SEARCH",
    clearance: "NONE"
  }).access({
    sort: "-episode_number",
    fields: [
      "episode_number",
      "public_contributions.name",
      "public_contributions.email",
      "public_contributions.exclude_from_give_away"
    ],
    filter: {
      _and: [
        { status: "published" },
        { date: { _lte: "$NOW" } },
        { episode_number: body.episode_number }
      ]
    },
    limit: 1,
    deep: {
      public_contributions: {
        _limit: -1,
        _sort: ["-date_created"],
        _filter: {
          status: "published"
        }
      }
    }
  });

  const episode = episode_query[0];

  // Process and deduplicate contributor names
  const all_names = nice_names(episode.public_contributions ?? []);

  return json({
    episode_number: episode.episode_number,
    names: all_names
  });
};
```

Key features of the data loading:

- Fetches all published contributions from the target episode (doesn't filter for
  `exclude_from_give_away` in the query so I can log how many opted out)
- Filters out contributors who opted out of the giveaway during processing
- Removes show guests from the pool (they can't win their own show!)
- Deduplicates names to ensure fairness, just in case a duplicate made it past all of my
  other checks
- Returns contributors with enough data to save the winners after the spins

The filtering logic is important for fairness. I compare the contribution list against the
guest database and remove any matches:

```typescript
// Filtering logic for removing guests from the contributor pool
// Get list of all guests
const guests: Guest[] = await api({
  target: "/items/guests",
  method: "SEARCH",
  clearance: "NONE"
}).access({
  fields: ["name"],
  limit: -1
});

// Filter out any guests from the contributor list
const names: Contributor[] = all_names.filter(
  (contributor: Contributor) =>
    guests.filter((e) => e.name === contributor.name).length === 0
);
```

## Episode Navigation

Due to the unpredicability of live streaming, I needed a nimble way to load data incase
something weird happened. I can navigate between episodes to test or reload data.

I send HTTP requests from my Stream Deck to the WebSocket server with the function name as
part of the request path. The server translates that to a string and sends it over
WebSocket, which the overlay listens for:

- `load_next_giveaway_ep` - Load the next episode's contributors
- `load_prev_giveaway_ep` - Load the previous episode's contributors
- `refresh_giveaway_data` - Reload the current episode's data

```typescript
// Episode navigation WebSocket handlers in +page.svelte
import { socket } from "$api/socket";

socket.on("load_next_giveaway_ep", () => {
  if (!browser) return;
  get_new_episode("next");
});

socket.on("load_prev_giveaway_ep", () => {
  if (!browser) return;
  get_new_episode("prev");
});

socket.on("refresh_giveaway_data", async () => {
  if (!browser) return;
  const new_data = await get_data(episode_number);
  names = new_data.names;
  episode_number = new_data.episode_number;
});

const get_new_episode = async (direction: "next" | "prev") => {
  if (direction === "next") {
    episode_number = episode_number + 1;
    if (episode_number > (data.episode_max ?? 9999)) {
      episode_number = 1;
    }
  } else {
    episode_number = episode_number - 1;
    if (episode_number < 1) {
      episode_number = data.episode_max ?? 9999;
    }
  }
  const new_data = await get_data(episode_number);
  names = new_data.names;
  episode_number = new_data.episode_number;
};
```

This has been a life-saver when OBS crashed mid-show and tried to load next week's data
(when it was non-existant) due to my query not being quite right. I was able to quickly
navigate to the correct data, live on air, and proceed without anyone really knowing what
they just saw.

## The Physics of the Spin

The spinner uses a velocity-based animation system that utilizes Svelte's reactive motion
tween stores. When I press the spin button on my Stream Deck, it calculates how far the
list should scroll, resulting in a deterministic giveaway system.

### Calculating Velocity

The velocity calculation ensures the wheel spins at least 2-3 times through the entire
list:

```typescript
// Velocity calculation from Picker.svelte
const NAME_HEIGHT = 58; // 58px looked good on stream
const PICKER_OFFSET = 540; // Picker pointer position at vertical center (1080px / 2)
const MIN_ROTATIONS = 2; // Minimum number of times to spin through the full list
const MAX_ROTATIONS = 3; // Maximum number of times to spin through the full list

const generate_velocity = () => {
  const list_height = names.length * NAME_HEIGHT;
  const min_spin = list_height * MIN_ROTATIONS;
  const max_spin = list_height * MAX_ROTATIONS;
  const velocity = random_num(min_spin, max_spin);

  // Add offset so names starting above the picker zone get a fair chance
  return velocity + PICKER_OFFSET;
};

const random_num = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1) + min);
```

The 540px offset is critical - it compensates for the picker pointer being in the middle
of the screen. Without it, names at the top of the list would never have a chance to win
because they start above the picker zone. By adding 540px to every spin velocity, even the
first entries move down through the picker zone, giving everyone an equal chance.

[ ADD VISUAL OF WHY THIS MATTERS ]

### Dynamic List Stacking

The name list is displayed as a scrolling column. Since the spin distance is designed to
exceed the height of a single list, I dynamically append additional copies of the name
array as needed:

```typescript
// Dynamic list stacking from Picker.svelte
export const spin_me = async () => {
  start_from = -move_to;
  move_to += generate_velocity();

  // Calculate how many name lists we need for this spin distance
  const old_stacks = stack_length;
  stack_length = Math.floor((move_to + PICKER_OFFSET) / names_height);
  const new_stacks = stack_length - old_stacks;

  // Append additional name arrays as needed
  if (new_stacks === 1) wheel.push(names);
  else if (new_stacks === 2) wheel.push(names, names);
  else if (new_stacks === 3) wheel.push(names, names, names);

  wheel = wheel;
  spin = true;
};
```

The `stack_length` tracks how many name list copies are currently rendered. This is
essential for calculating the winner's actual index later - we need to know which
iteration of the list they landed on.

Here's the key: we never reset `move_to`. Each spin adds to the previous position, so if
the first spin moved 2000px and the second spin moves 1800px, we're now at 3800px total.
This means the starting position for each subsequent spin is essentially random, which
helps ensure fairness across multiple prize drawings in a single show.

### The Animation Technique

The actual scrolling animation uses CSS custom properties and a keyframe animation. When
`spin_me()` is called, it sets CSS variables that drive the animation:

```svelte
<!-- In Picker.svelte -->
<div
  class="names"
  class:activateSpin={spin}
  class:staticPosition={!spin}
  style:--startFrom="{start_from}px"
  style:--moveTo="{-move_to}px"
  onanimationend={set_winner} // Fires when animation completes
>
  {#each wheel as name_list}
    <div class="list">
      {#each name_list as name}
        <div class="name">{name.name}</div>
      {/each}
    </div>
  {/each}
</div>

<style>
  .activateSpin {
    animation: spin 20s cubic-bezier(0.215, 0.61, 0.355, 1);
  }

  .staticPosition {
    transform: translateY(var(--moveTo));
  }

  @keyframes spin {
    0% {
      transform: translateY(var(--startFrom));
    }
    100% {
      transform: translateY(var(--moveTo));
    }
  }

  .names {
    will-change: transform;
  }
</style>
```

The `--startFrom` and `--moveTo` CSS variables are dynamically set based on the calculated
position. I use `translateY` for the transform to ensure GPU acceleration. I tried every
CSS trick I could find to optimize GPU rendering - `will-change: transform`,
`transform: translateZ(0)`, different animation properties - but with 2500+ names
scrolling thousands of pixels, some stuttering is inevitable. The 20-second duration with
the cubic-bezier easing function provides smooth deceleration that mimics a physical wheel
losing momentum.

**Here's the beautiful part:** I only calculate two numbers in JavaScript - the starting
position and the ending position. CSS handles all the interpolation between those values.
There's no JavaScript running during the 20-second animation calculating frame positions
or updating transforms. CSS's animation engine does all the heavy lifting, smoothly
interpolating from `--startFrom` to `--moveTo` using the cubic-bezier timing function.
This means the browser's highly-optimized rendering engine handles thousands of
intermediate calculations without any number crunching from me. I just set the start, set
the end, and let CSS do what it does best.

### Finding the Winner

After the 20-second animation completes, I calculate which name landed in the "winner
zone":

```typescript
// Winner calculation from Picker.svelte
const set_winner = () => {
  // Step 1: Find which name element is at the picker position
  // move_to = total pixels scrolled (e.g., 3500px)
  // PICKER_OFFSET = 540px (half of 1080px screen)
  // NAME_HEIGHT = 58px per name
  // Result: which name index across ALL appended lists
  winner_id = Math.floor((move_to + PICKER_OFFSET) / NAME_HEIGHT);
  // Example: (3500 + 540) / 58 = 69.65... → 69

  // Step 2: Convert from stacked list index back to original array index
  // stack_length tells us how many complete list cycles fit in our current position
  // If we have 15 names and stack_length is 4, we need to account for 3 previous lists
  let original_id = winner_id - names.length * (stack_length - 1);
  // Example: 69 - 15 * (4 - 1) = 69 - 45 = 24

  // Step 3: Handle edge case where we're still outside the original array bounds
  if (original_id >= names.length) {
    original_id -= names.length;
  }
  // Example: if original_id was 24 and names.length is 15, then 24 - 15 = 9

  // Step 4: Check if they already won during this giveaway session
  if (winners.indexOf(original_id) == -1) {
    winners.push(original_id);
    // Add to winner details with prize info
  } else {
    already_won.push(original_id);
  }
};
```

The math works like this:

1. **Find absolute position**: Add the total scroll distance to the picker offset, divide
   by name height to get which name element is at the picker
2. **Account for stacked lists**: Use `stack_length` to subtract the names from previous
   list iterations
3. **Normalize to original array**: If still outside bounds, subtract one more list length
4. **Check for duplicates**: If they already won, mark them and spin again

If someone lands in the winner zone who already won, they don't get added to the winners
list again and get a special "already won" striped background pattern and I spin again.

## Visual Feedback: The Pointer and Confetti

### The Picker Pointer

The pointer (or "nib") is positioned at the vertical center of the screen (540px on a
1080px canvas), indicating the winner zone. When the wheel is spinning, it has a subtle
animation that makes it look like it's being hit by the wheel's movement:

```svelte
<!-- Pointer.svelte -->
<script lang="ts">
  export let spinning: boolean;
</script>

<svg
  class="pointer"
  class:spinning
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 256 256"
>
  <path
    d="M132.94,231.39A8,8,0,0,1,128,224V184H48a16,16,0,0,1-16-16V88A16,16,0,0,1,48,72h80V32a8,8,0,0,1,13.66-5.66l96,96a8,8,0,0,1,0,11.32l-96,96A8,8,0,0,1,132.94,231.39Z"
  />
</svg>

<style>
  .pointer {
    position: absolute;
    top: 540px;
    right: calc(100% + 0.5rem);
    width: 2.5rem;
    height: 2.5rem;
    fill: red;
    transition: transform 0.1s ease-out;
  }

  .pointer.spinning {
    animation: pointer-wobble 0.15s ease-in-out infinite;
  }

  @keyframes pointer-wobble {
    0%,
    100% {
      transform: translateX(0);
    }
    50% {
      transform: translateX(-4px);
    }
  }
</style>
```

The wobble animation creates the illusion that the spinning names are physically hitting
the pointer as they scroll past.

### Confetti Celebration

When a winner is selected, confetti animates from the picker zone:

```typescript
// In Picker.svelte
const set_winner = () => {
  show_confetti = true;
  spin = false;
  // ... winner calculation ...
};
```

The confetti uses simple CSS animations to create falling particles that celebrate each
win, giving viewers immediate visual feedback that someone has been selected.

## Managing Winners During the Show

Winners display in real-time on the left side of the screen using a Svelte store:

```typescript
// Winner store and prize assignment in Picker.svelte
const set_winner = () => {
  // ... winner calculation code ...

  if (winners.indexOf(original_id) == -1) {
    winners.push(original_id);

    const new_winner = {
      ...names[original_id]
    };

    // Assign prize based on current slide
    if ($slide === 0) new_winner.prize = "Big Winner";
    if ($slide === 1) new_winner.prize = "Handmade Card";
    if ($slide === 2) new_winner.prize = "Goodie Bag";
    if ($slide > 2) new_winner.prize = "SPONSOR: " + $sponsors[$slide - 3].name;

    $winner_details = [...$winner_details, new_winner];
  }
};
```

> note: This prize assignment system works but I'm currently developing a better prize
> management system that will update this logic.

Each winner is assigned a prize based on which "slide" I'm currently on:

- **Slide 0**: Big Winner (the main prize)
- **Slide 1**: Handmade Card
- **Slide 2**: Goodie Bag
- **Slides 3+**: Sponsor prizes (loaded from episode data)

I can delete the last winner live on-air if needed, which immediately updates the visual
display:

```typescript
// Delete last winner function
const delete_last = () => {
  $winner_details.pop();
  $winner_details = $winner_details;
};
```

> note: the Svelte 4 store with assignment required for reactivity.

## The Sponsor Slide System

Each episode has different sponsor prizes. The overlay dynamically loads sponsor data and
creates slides for each one:

```typescript
// Sponsor slide calculation
let total: number = $sponsors.length + 2; // +2 for static slides
```

Stream Deck buttons control slide navigation via WebSocket commands:

```typescript
// Sponsor slide navigation in Controls.svelte
const next = () => {
  $slide = $slide === total ? 0 : $slide + 1;
};

const prev = () => {
  $slide = $slide === 0 ? total : $slide - 1;
};

const reset = () => {
  $slide = 0;
};

socket.on("giveaway_sponsor_next", () => {
  if (!browser) return;
  next();
});

socket.on("giveaway_sponsor_prev", () => {
  if (!browser) return;
  prev();
});

socket.on("giveaway_sponsor_reset", () => {
  if (!browser) return;
  reset();
});
```

Visual tags appear at the bottom indicating whether the current prize is "Official Prize"
or "Spin Sponsor":

```svelte
<!-- Sponsor tag display logic in +page.svelte -->
{#if $slide === 1 || $slide === 2}
  <div
    class="sponsorTag"
    in:fly={{ y: -100, duration: 500 }}
    out:fly={{ y: 100, duration: 500 }}
  >
    Official Prize
  </div>
{:else if $slide > 2}
  <div
    class="sponsorTag"
    in:fly={{ delay: 200, y: -100, duration: 500 }}
    out:fly={{ y: 100, duration: 500 }}
  >
    Spin Sponsor
  </div>
{/if}
```

## Stream Deck Integration

The SvelteKit overlay listens for six main WebSocket commands that I trigger from Stream
Deck buttons:

```typescript
// Available WebSocket commands
socket.on("giveaway_spin", () => {
  if (!browser) return;
  spinMe();
});

socket.on("giveaway_sponsor_next", () => {
  if (!browser) return;
  next();
});

socket.on("giveaway_sponsor_prev", () => {
  if (!browser) return;
  prev();
});

socket.on("giveaway_sponsor_reset", () => {
  if (!browser) return;
  reset();
});

socket.on("giveaway_save", () => {
  if (!browser) return;
  save();
});

socket.on("giveaway_delete_last", () => {
  if (!browser) return;
  delete_last();
});
```

Each Stream Deck button sends an HTTP POST request that gets translated by the WebSocket
server. The security validation happens at the server level before forwarding to connected
clients.

## Saving Winners and Prize Claiming Automation

After we've selected all winners, I press a "Save Winners" button on my Stream Deck. This
triggers the most important part of the automation:

```typescript
// Save function from Controls.svelte
const save = async () => {
  if ($winner_details.length === 0) return;

  await fetch("/giveaway/save", {
    method: "POST",
    body: JSON.stringify({
      winners: $winner_details,
      episode: episode_number + 1
    })
  });
};
```

The `episode_number + 1` accounts for the fact that I'm loading the previous episode's
contributor data. Since the show runs serially (episode 199, then 200, then 201), when I
load episode 199's contributors for the giveaway, I need to save the winners to episode
200 - the current episode airing live.

The save endpoint merges new winners with any existing winners (in case I run the giveaway
twice) and deduplicates:

```typescript
// Save endpoint - save/+server.ts
const uniq = (contributors: Contributor[]) =>
  contributors.filter(
    (value, index, self) => index === self.findIndex((t) => t.name === value.name)
  );

export const POST: RequestHandler = async ({ request }) => {
  const { winners, episode } = await request.json();

  // Get the target episode
  const target_episode_raw: Episode[] = await api({
    target: "/items/episodes",
    method: "SEARCH",
    clearance: "NONE"
  }).access({
    fields: ["id", "winners"],
    limit: 1,
    sort: ["-date"],
    filter: {
      episode_number: { _eq: episode }
    }
  });

  const target_id = target_episode_raw[0].id;
  let already_won = target_episode_raw[0].winners ?? [];

  // Merge and deduplicate
  let final_winners = uniq([...already_won, ...winners]);

  await api({
    target: `/items/episodes/${target_id}`,
    method: "PATCH",
    clearance: "ADMIN"
  }).access({ winners: final_winners });

  return new Response(null, { status: 204 });
};
```

Once the winners are saved to the database, the prize claim form on the Craft Roulette
website becomes available with the new data. Winners can immediately claim their prizes
without any manual intervention.

This automation has saved hours of weekly administrative work. Previously, we'd manually
email each winner, wait for responses, and track everything in spreadsheets. Now it's
instantaneous.

## Development Mode Features

In development mode, the overlay shows an on-screen control panel:

```svelte
<!-- Dev controls display logic -->
{#if dev}
  <div id="controls">
    <button on:click={() => dispatch("spin")}> Spin </button>
    <button on:click={next}> Next Slide </button>
    <button on:click={prev}> Prev Slide </button>
    <button on:click={reset}> Show Rules </button>
    <button on:click={delete_last}> Delete Last </button>
    <button on:click={save}> Save Winners </button>
  </div>
{/if}
```

This makes testing the entire system easier without needing to set up the WebSocket server
and Stream Deck.

## The Component Architecture

The main page is composed of several Svelte components:

**+page.svelte** - Main orchestrator

- Manages timing and state
- Handles WebSocket connection
- Controls visual choreography

**Picker.svelte** - The spinning name column

- Scrolling animation
- Winner calculation
- Confetti trigger

**Winners.svelte** - Winner display panel

- Shows selected winners
- Displays prize categories
- Updates in real-time

**Controls.svelte** - Remote command handlers

- WebSocket event listeners
- Save mechanism
- Slide navigation

**BottomBar.svelte** - Episode and count display

**Confetti.svelte** - Celebration animation

Each component communicates through Svelte stores and props, keeping the architecture
clean and maintainable.

## Three Years of Evolution

The system has evolved significantly since the first version:

**Year 1** (2022): Basic spinning functionality with manual winner recording

**Year 2** (2023): Added multiple prize support, sponsor integration, and visual
improvements

**Year 3** (2024-2025): Full prize claim automation, improved reliability, episode
navigation

The current iteration I'm working on further automates the prize fulfillment process now
that I better understand what can be automated.

## Extending These Concepts

The patterns I've used here apply to many streaming scenarios:

- **HTTP → WebSocket bridge**: External control without maintaining persistent connections
- **Static positioned overlays**: Reliable visual layouts in OBS
- **Self-sustaining data cycles**: Last week's content powers this week's show, creating a
  perpetual loop that requires minimal manual intervention
- **Real-time state sync**: Changes propagate instantly to all viewers
- **Stream Deck integration**: Using outbound HTTP requests keeps it simple

These same techniques could power polling systems, auction management, leaderboards,
interactive games, or custom alerts.

## Conclusion

What started as a simple prize wheel has evolved into a sophisticated system that handles
data loading, animation choreography, real-time state management, and automated prize
claiming. The WebSocket architecture gives flexibility for control, while the database
integration ensures accuracy and enables automation.

The best part is watching the system work flawlessly live on-air each week while we focus
on creating content rather than managing spreadsheets.

If you're building custom stream overlays or automation systems, I hope this breakdown
gives you some ideas for your own projects.
