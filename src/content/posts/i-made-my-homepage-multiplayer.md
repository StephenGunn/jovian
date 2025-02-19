---
title: I made my homepage multiplayer with websockets
description: And PartyKit made it easier than ever!
date: "2025-2-18"
categories:
  - sveltekit
  - partykit
  - websockets
  - cloudflare
published: true
bluesky_thread_id: "3liij2ctiqc2t"
---

<script>
    import RocketShipBlog from "$lib/components/blog/RocketShipBlog.svelte"
    import AlienShipBlog from "$lib/components/blog/AlienShipBlog.svelte"
</script>

## My Homepage

If you haven't checked out the [home](/) route on this site, take a few minutes to check
it out and fly the little space-ship around. I made the homepage over a weekend to test
out the [Svelte 5](https://svelte.dev/blog/svelte-5-preview) beta. Once Svelte 5
officially launched, I decided to turn it into the landing of my home page. I have a long
history of making space-themed websites and art, so it felt pretty natural.

<RocketShipBlog />

The rocket movement is done with a combination of
[Svelte's Tween](https://svelte.dev/docs/svelte/svelte-motion#Tween) function,
[CSS transitions](https://developer.mozilla.org/en-US/docs/Web/CSS/transition), and
[requestAnimationFrame()](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame).
If you're curious, you can
[read the code for the ship component here](https://github.com/StephenGunn/jovian/blob/main/src/lib/homepage/Ship.svelte).
You can do all sorts of cool stuff like queuing waypoints, entering the orbit of Jupiter
and its three biggest moons, and even follow a short quest line that gives you a speed-run
time after completion.

Either way, I'm really happy with the homepage and have wanted to add the ability to see
other users fly around the site in real-time since I was originally working on the flight
mechanics... so I added it!

## Making it Multiplayer with PartyKit

The integration with [PartyKit](https://www.partykit.io/) was surprisingly
straightforward. Here's how the websocket connection is established and managed:

> note: this is SvelteKit code, of course

```typescript
onMount(async () => {
  party = new PartySocket({
    host: PUBLIC_WS_SERVER,
    room: "space"
  });

  party.addEventListener("message", (event: MessageEvent) => {
    const message = JSON.parse(event.data);
    switch (message.type) {
      case "init":
        aliens = message.aliens.map((alien: AlienData) => ({
          id: alien.id,
          country: alien.country
        }));
        break;
      case "new_alien":
        aliens = [
          ...aliens,
          {
            id: message.id,
            country: message.country
          }
        ];
        break;
      // ... other message handlers
    }
  });
});
```

## Visual Differentiation

My original idea was to have multiple rocket-ships flying around, but I thought that might
get confusing without some sort of strong visual identifier. Instead, I switched other
participants to flying saucers to reduce visual confusion. I also added country flags to
each saucer since a two-letter country code comes with the initial request, providing
another way to differentiate the saucers.

<AlienShipBlog />

## Responsive Movement Patterns

Building responsive sites is challenging, especially when creating fluid, intuitive
interactions that work across different screen sizes. When figuring out how to translate
movement from one screen size to another, I realized I could hook into my existing
waypoint queue system. Instead of using exact pixel dimensions, I send fractions
representing percentage orientations on the screen:

```typescript
function broadcast_waypoint(x: number, y: number) {
  if (!party) return;
  const px = x / window.innerWidth;
  const py = y / window.innerHeight;
  party.send(
    JSON.stringify({
      type: "waypoint",
      x: px,
      y: py
    })
  );
}
```

This means the movement between ships and saucers will only follow the same trajectory if
the browser windows are exactly the same size. The alien ships handle waypoint queuing
with a state-driven approach:

```typescript
class AlienShip {
  id: string;
  x = $state(-100);
  y = $state(-100);
  rotation = $state(0);
  in_motion = $state(false);
  visible = $state(false);
  trip_duration = $state(4000);
  waypoint_queue: { x: number; y: number }[] = $state([]);

  private async fly_to(x: number, y: number) {
    this.calculate_trip_duration(x, y);
    const coords = { x, y };

    await this.delay(200);
    this.in_motion = true;

    const updateInterval = setInterval(() => {
      this.set_banking_angle(coords.x);
    }, 50);

    // Set the tweens to start from current position
    x_move.set(this.x, { duration: 0 });
    y_move.set(this.y, { duration: 0 });

    // Then animate to new position
    x_move.set(coords.x, { duration: this.trip_duration, easing: sineInOut });
    y_move.set(coords.y, { duration: this.trip_duration, easing: sineInOut });

    await this.delay(this.trip_duration);
    clearInterval(updateInterval);

    this.rotation = 0;
    this.in_motion = false;

    if (this.waypoint_queue.length > 0) {
      const next = this.waypoint_queue.shift();
      if (next) {
        this.fly_to(next.x, next.y);
      }
    }
  }

  async add_waypoint(id: string, x: number, y: number) {
    if (id !== this.id) return;
    if (this.in_motion) {
      this.waypoint_queue.push({ x, y });
      return;
    }
    await this.fly_to(x, y);
  }
}
```

The ships smoothly handle multiple waypoints by queuing them up when in motion and
processing them sequentially. They also calculate appropriate trip durations based on
distance and maintain a banking angle during flight for a more natural movement feel.

## PartyKit Made It Easy

I've been talking to web-wizard [@Joshnuss](https://bsky.app/profile/joshnuss.com) about
Cloudflare serverless primitives and integrating them with SvelteKit for a while. While
Durable Objects with Websockets are powerful, they're primitive and proprietary. Setting
up a Durable Object, binding it to a worker, and writing websocket code isn't something
you can quickly implement unless you understand the system well.

Josh has been creating experimental projects with PartyKit for the past month, which
inspired me to give it a try. After building a few small experiments, I wanted to
integrate it into a real project and deploy the server to Cloudflare under a custom
domain.

The server implementation turned out to be quite clean:

```typescript
export default class Server implements Party.Server {
  connections = new Map<string, Party.Connection>();
  aliens = new Map<string, { country: string }>();

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    this.connections.set(conn.id, conn);
    const alien = {
      country: this.get_valid_country_code(ctx.request)
    };
    this.aliens.set(conn.id, alien);

    // Send current aliens to new connection
    const currentAliens = Array.from(this.aliens.entries()).map(([id, data]) => ({
      id,
      ...data
    }));

    conn.send(
      JSON.stringify({
        type: "init",
        aliens: currentAliens
      })
    );
  }
}
```

> note: this is truncated but you can
> [ see all the code in the repo ](https://github.com/stephengunn/jovian)

## In Conclusion

Please check it out and send me a message on Bluesky with your thoughts. Let me know when
you're flying around on my homepage - I would absolutely love to log in and see people
enjoying space as much as I do!
