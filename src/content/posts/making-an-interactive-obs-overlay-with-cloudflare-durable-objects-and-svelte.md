---
title: Making an interactive OBS stream overlay with Cloudflare Durable Objects and Svelte
description:
  Control a dynamic stream overlay from an Elgato Streamdeck in an OBS Browser Source that
  you can self host.
date: "2025-2-25"
categories:
  - svelte
  - obs
  - cloudflare
  - websockets
  - partykit
published: true
bluesky_thread_id: "3lj72vkd3xc2o"
---

<script>
    import ProjectLayout from "$lib/components/blog/svgs/StreamChapters.svelte"
    import MediaPlayer from '$lib/layout/MediaPlayer.svelte';
</script>

## What we'll be making

In this post I'll be walking through the steps to create a **single service** web app that
can be loaded in an OBS Browser Source and controlled via an Elgato Stream Deck. This
isn't a beginner tutorial - I'll assume you have knowledge of web development,
command-line tools, and both frontend and backend technologies. But if you have a tech
background and aren't familiar with all these specific technologies, you should still be
able to follow along and find this useful.

I've spent years leveraging web tech to enhance live-streaming setups, and I wanted to
show the complete process of building something that showcases some of the tricks I've
learned. This is the first in what might become a series of articles about stream tech,
depending on interest.

We'll be building a "stream chapters" overlay that shows viewers what topics you've
covered and what's coming up next during your stream. You'll be able to:

- Navigate between chapters
- Mark chapters as completed
- Edit the chapter list on the fly
- See all changes instantly reflected across all viewers in real-time

Here's what the final product will look like:

<MediaPlayer video="https://github.com/user-attachments/assets/9bb75cc5-200f-43c0-8f5f-4d81114f9850" />

The tech stack we'll be using:

- npm (or pnpm) for package management
- Svelte for our reactive UI
- TypeScript for type safety
- Vite for our development environment
- Cloudflare Workers & Durable Objects for our backend
- PartyServer for WebSocket communication

<ProjectLayout />

The cool thing about this project is that it deploys entirely to Cloudflare Workers, with
[Durable Objects](https://developers.cloudflare.com/durable-objects/) maintaining state
for each `room`. This means you can have as many separate overlays as you need (one per
stream/channel), with each getting its own isolated instance that automatically scales
with demand. No servers to maintain, no infrastructure headaches - just push your code and
Cloudflare handles the rest.

The real magic happens in how we'll connect the Stream Deck to our overlay through HTTP
endpoints that instantly broadcast changes via WebSockets.

## Demo & Code

If you just want to dig into the code or checkout the demo, both are available online and
are free to use however you like.

- [The Demo - https://chapters.jovianmoon.io](https://chapters.jovianmoon.io)
- [The Code - https://github.com/StephenGunn/stream-chapters](https://github.com/StephenGunn/stream-chapters)

You'll find everything you need to get started in the repository. The project includes a
few key features worth highlighting:

- **URL parameter control** that lets you customize the view (admin panels, chapters only,
  etc.)
- **HTTP endpoints** for Stream Deck integration via simple POST requests
- **Isolated rooms** so you can have multiple overlays without interference
- **[ Websocket Hibernation ](https://developers.cloudflare.com/durable-objects/best-practices/websockets/#websocket-hibernation-api)**
  to keep Cloudflare costs minimal

The repository includes detailed setup instructions, but we'll be covering everything
step-by-step in this post. If you're curious about how it all fits together, stick around
as we build it from scratch!

## OBS and Browser Sources

If you know anything about live-streaming, you've more than likely heard about OBS. It's a
fantastic program that is free, open-source, and extremely powerful. OBS has a slightly
steeper learning curve than other streaming software that gained popularity during the
pandemic when everyone suddenly became a streamer... But the trade-off is worth it - you
can make OBS do almost anything.

For this project, I'll be taking advantage of one of the default source types that comes
stock with OBS: the Browser Source. As the name suggests, it's literally just a browser
embedded inside of OBS. You can load local HTML files or remote URLs into it. The browser
runs on the [ Chromium Embedded Framework (CEF) ](https://github.com/chromiumembedded) -
which is essentially Chrome, though sometimes the features lag behind the official Chrome
releases.

Once you add a browser source to your scene, you can configure several important
parameters:

- A `URL` or `Local File` to load
- The exact `width` and `height` dimensions
- Custom CSS that gets injected into the page (this will be important later!)
- Various control options like refresh behavior and shutdown behavior

The Browser Source is incredibly powerful because it lets us bring the full capabilities
of modern web development right into our stream layouts. Since our overlay will be a web
app, we can make it responsive, interactive, and connect it to external services - all
things that would be difficult or impossible with traditional image or video sources.

We'll loop back around to the details of setting up OBS much later in the post, but it's
good to know your target environment from the beginning.

## Initializing the project

We'll be using
[Josh Nuss' `partyvite-svelte` starter](https://github.com/joshnuss/partyvite-svelte) that
will setup 🎈 PartyServer ⨉ ⚡️ Vite ⨉ 🧡 Svelte ⨉ ⛅️ Cloudflare Workers for us with a
simple command.

You'll want to navigate to the place you want to initialize the application and use this
command:

```bash:install
pnpm create cloudflare@latest --template github:joshnuss/partyvite-svelte
```

It will ask what directory we want to install the application in, this will also function
as the application name so I will enter `stream-chapters`:

```
👋 Welcome to create-cloudflare v2.38.2!
🧡 Let's get started.
📊 Cloudflare collects telemetry about your usage of Create-Cloudflare.

Learn more at: https://github.com/cloudflare/workers-sdk/blob/main/packages/create-cloudflare/telemetry.md
──────────────────────────────────────────────────────────────────────────────────────────────────────────

╭ Create an application with Cloudflare Step 1 of 3
│
╰ In which directory do you want to create your application? also used as application name
stream-chapters
```

The next step will ask if we want to use Git as our version control, I will select `Yes`.
I love Git.

> note: My first experience with version control was in 2008 and was with Subversion. I
> have never fully recovered. **shudders**

The final step asks us if we want to deploy the app immediately to Cloudflare. I am going
to select `No` and work on the application on our local system. You would need to have a
properly configured Cloudflare account with Wrangler installed on your system to deploy,
but we can just run this application locally for this tutorial.

## The basic project setup

If you navigate into your newly created directory, you'll notice quite a few files
in-place. Welcome to modern web developent. If I run a quick `tree` command I get

```
├── index.html
├── node_modules
│   ├── ...truncated...
├── package.json
├── pnpm-lock.yaml
├── public
│   ├── partykit.png
│   ├── svelte.svg
│   └── vite.svg
├── README.md
├── src
│   ├── app.css
│   ├── App.svelte
│   └── main.ts
├── svelte.config.js
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── worker
│   └── server.ts
└── wrangler.json
```

The important files that we need to cover before we go any further are, from top to
bottom:

- Everything in the `src` directory, this is the frontend source where our Svelte app
  lives
- `worker/server.ts` is where our backend Durable Object code lives and our websocket
  server is defined
- `wrangler.json` is our Cloudflare configuration file where we create our service
  bindings and deployment settings

Before we dive into the code, we need to take a look at that last file, the
`wrangler.json`. This configuration is what tells Cloudflare how to deploy our application
and sets up the critical relationship between our frontend and our stateful backend.

## Wrangler.json and Cloudflare Bindings

Cloudflare as a platform offers some exceptionally powerful tools for developers to
wrangle. I have removed a bunch of comments from this file that aren't supposed to be in a
`.json` - if you open the file in any halfway decent editor like `vscode` or godlike
development environment like `neovim`, it will yell at for the comments. But you should
still check them out because they describe how the file works.

The `wrangler.json` file is the heart of how Cloudflare deploys and configures your
application. It's where we tell Cloudflare about our Durable Objects, which are the
persistent, stateful components that will power our real-time functionality. Unlike
traditional serverless functions that are ephemeral, Durable Objects maintain state
between requests, making them perfect for our WebSocket-based overlay.

What makes this setup so powerful is how it combines these components:

- The Worker acts as our HTTP server, handling both static assets and API requests
- Durable Objects maintain state that persists between connections
- WebSockets provide real-time communication with all connected clients
- PartyServer gives us a super-simple websocket API

This combination lets us create a stateful, real-time application that still benefits from
the serverless deployment model - we don't need to manage any infrastructure, and
everything scales automatically.

Let's modify our `wrangler.json` to use `StreamChapters` as our Durable Object class name:

```json
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "stream-chapters",
  "main": "./worker/server.ts",
  "compatibility_date": "2025-02-04",
  "assets": {
    "directory": "./public"
  },
  "durable_objects": {
    "bindings": [
      {
-       "name": "MyServer",
+       "name": "StreamChapters",
-       "class_name": "MyServer",
+       "class_name": "StreamChapters"
      }
    ]
  },
  "migrations": [
    {
      "tag": "v1",
-     "new_classes": ["MyServer"],
+     "new_classes": ["StreamChapters"]
    }
  ],
  "observability": {
    "enabled": true
  }
}
```

You could keep the `MyServer` name and be fine, it might even be easier, but this gives us
an excuse to look into these mission critical files. This is all we need for our
Cloudflare config.

The `bindings` section is particularly important - it's what allows our Worker code to
talk to our Durable Object instances. Each `room` will act as an instance of our
`StreamChapters` class and will maintain its own state independently from all other rooms.
This means you could have different streams using different room names, and they'll each
have their own chapter lists and active states without interfering with each other.

## The Durable Object Backend Code

The next thing we'll look at is the Durable Object / Cloudflare Worker code located in
`worker/server.ts`. We'll have to do some renaming to match our changes in the
`wrangler.json` file:

```typescript
import { Server, type Connection, routePartykitRequest } from "partyserver";

type Env = {
-  MyServer: DurableObjectNamespace<MyServer>;
+  StreamChapters: DurableObjectNamespace<StreamChapters>;
};

-export class MyServer extends Server<Env> {
+export class StreamChapters extends Server<Env> {
  onMessage(conn: Connection, message: string) {
    console.log("message from client:", message);

    conn.send("hello from server");
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    return (
      (await routePartykitRequest(request, env)) ||
      new Response("Not found", {
        status: 404
      })
    );
  }
} satisfies ExportedHandler<Env>;
```

Matching the class name and `Env` type to match our `wrangler.json` is required for the
Cloudflare Services to work correctly. This might seem a little bit like magic, but it's
just platform-specific code that connects all the parts together.

The `Server` class we're extending comes from PartyServer, which handles a lot of the
WebSocket boilerplate for us. Our `StreamChapters` class will manage a single "room" of
connections, with each client that connects to the same room name getting the same Durable
Object instance.

The `routePartykitRequest` function in the fetch handler is what routes incoming requests
to the correct Durable Object instance based on the URL path. It's this routing that
allows us to have separate rooms with their own isolated state.

Right now this server doesn't do much - it just logs messages and replies with "hello from
server" - but we'll expand it soon to manage our chapters state and handle all the actions
our overlay needs.

## The Svelte Frontend Code

If you look inside of `./src/App.svelte`, you'll find our frontend code. To get the very
basics working, we will have to change one line in our connection code.

```svelte
<script lang="ts">
  import PartySocket from "partysocket";
  import { onMount } from "svelte";

  const ws = new PartySocket({
    host: window.location.host,
    room: "room1",
-    party: "my-server"
+    party: "stream-chapters"
  });

  let message = $state();

  onMount(() => {
    ws.addEventListener("message", onMessage);
    ws.send("hello from the client!");
  });

  function onMessage(event: MessageEvent) {
    message = event.data;
  }
</script>
```

The `party` should be set to the name of the application we specified when we set up our
initial install. We named this application `stream-chapters`, so we will need to set our
party to that.

The `PartySocket` object is what handles our WebSocket connection, with three key
parameters:

- `host`: The server to connect to (we're using the current hostname)
- `room`: Which specific room to join (each room gets its own Durable Object instance)
- `party`: The name of our application, which should match what we defined in our setup

This simple change connects our frontend to the correct backend service. The WebSocket
connection will automatically be established when the component mounts, sending a greeting
message and listening for responses.

> note: If you're familiar with SvelteKit... This is not SvelteKit and does not include
> features like routing. This is a Svelte application and SvelteKit functionality will not
> work.

If everything is setup correctly, we should be able to spin up our local development
environment and see our work, without errors, in the browser.

## Starting your local development environment

One of the coolest parts about Josh's `partyvite-svelte` starter is how it leverages both
Cloudflare's Wrangler CLI and Vite to run the project in a single service. If we were
using Cloudflare's Durable Objects with `SvelteKit`, we would need to spin up two servers
for our local development environment.

You should be able to run the dev command that is specified in our `package.json`

```bash:start-command
pnpm dev
```

And if the server config is setup correctly you should see something like

```
  VITE v6.1.0  ready in 524 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

and if you put the `http://localhost:5173/` into your browser, you should see the Frontend
load without error. It should have the vite, svelte, and partykit logos, a heading, and
some text, but the important part is:

```
hello from server
```

and in your terminal you should see something like

```
Connection b444400e-801f-40b0-b9ab-d4817bcc739f connected to StreamChapters:room1

message from client: hello from the client!
```

This means that we have a working websocket connection between your browser and your
Durable Object! If you've ever tried building something using websockets from scratch,
you'll know how awesome this is.

The beauty of this setup is that it's all running in a single process - your local
Wrangler development server is handling both the frontend assets and the WebSocket
connections. This makes for a super smooth development experience, and also mirrors how it
will work in production on Cloudflare.

> note: If you forgot to update something, you'll get an error like:

```
Did you forget to add a durable object binding to the class in your wrangler.toml?
```

Wrangler files can be `json`, `jsonc`, or `toml` - so don't worry about that specific
error too much if you see it.

## Project Cleanup

We need to go through and remove some of the stuff we don't need from our project. I will
detail what I delete and where. It isn't much but it will help us in the next sections
where we build our app.

First, let's remove the logo files from inside `./public`. There should be three files,
let's delete them all but don't remove the directory - we'll need to keep it around. You
can add any static assets you want to serve here.

```
- ./public/partykit.png
- ./public/svelte.svg
- ./public/vite.svg
```

In the `./src` directory, remove everything from the `app.css` file, but keep it there.

```
- ./src/app.css
```

and in the `./src/App.svelte` file, we'll want to remove anything inside of the `<main>`
and `<style>` tags to make way for our custom built application. we won't need.

```svelte:App.svelte
<script lang="ts">
  import PartySocket from "partysocket";
  import { onMount } from "svelte";

  const ws = new PartySocket({
    host: window.location.host,
    room: "room1",
    party: "stream-chapters"
  });

  let message = $state();

  onMount(() => {
    ws.addEventListener("message", onMessage);
    ws.send("hello from the client!");
  });

  function onMessage(event: MessageEvent) {
    message = event.data;
  }
</script>

<main>
-  <div>
-    <a href="https://vite.dev" target="_blank" rel="noreferrer">
-      <img src="/vite.svg" class="logo" alt="Vite Logo" />
-    </a>
-    <a href="https://svelte.dev" target="_blank" rel="noreferrer">
-      <img src="/svelte.svg" class="logo svelte" alt="Svelte Logo" />
-    </a>
-    <a href="https://partykit.io" target="_blank" rel="noreferrer">
-      <img src="/partykit.png" class="logo" alt="PartyKit Logo" />
-    </a>
-  </div>
-  <h1>Vite + Svelte + PartyKit</h1>
-  <p class="read-the-docs">Click on the PartyKit, Vite and Svelte logos to learn more</p>
-  <div class="card">
-    {message}
-  </div>
</main>

<style>
-  .logo {
-    height: 6em;
-    padding: 1.5em;
-    will-change: filter;
-    transition: filter 300ms;
-  }
-  .logo:hover {
-    filter: drop-shadow(0 0 2em #646cffaa);
-  }
-  .logo.svelte:hover {
-    filter: drop-shadow(0 0 2em #ff3e00aa);
-  }
-  .read-the-docs {
-    color: #888;
-  }
</style>
```

One thing to note about the images we just deleted, if you look at the `<img>` tags, they
were served from `./` but lived in our `./public` directory, so if we want to serve any
static files in our app, we'll need to place it in the `./public` directory

We also won't touch the stuff in the `<script>` tag, but we will be changing it in the
near future.

That's about it for cleanup. Now we can build.

## Let's get down to business!

> You know when I'm down to just my socks, it's time for business. That's why they call
> them business socks. - Jemaine (Flight of the Conchords)

I have tried to keep this project as simple as I can so anyone with knowledge of
TypeScript (or JavaScript), HTML, and CSS should be able to grasp the basics of how the
project works. There is some `svelte magic` in the UI layer but it's required.

If you've never used or looked into svelte before, I would highly recommend it. You can
see how few lines of code generate a highly dynamic and interactive user interface and
display.

## Understanding the Architecture

Before we dive into the code, let's talk about how everything fits together:

1. Our **Durable Object** functions as our backend state store. Each "room" gets its own
   instance that maintains the current state of chapters.

2. **WebSockets** provide real-time communication between our UI and the Durable Object,
   making all changes instant across all connected clients.

3. **HTTP Endpoints** allow external tools like Stream Deck to send commands without
   maintaining a WebSocket connection.

4. The **Svelte UI** presents different views based on URL parameters - a full admin UI,
   just the chapters list for your stream, or just the admin panel.

This architecture gives us flexibility while keeping things as simple as possible.

## The Server (Durable Object)

Let's look at the full server implementation first, then I'll explain the key aspects:

```typescript:./worker/server.ts
import { Server, type Connection, routePartykitRequest } from "partyserver";

import type { Chapter, Message } from "../src/types";

type Env = {
  StreamChapters: DurableObjectNamespace<StreamChapters>;
};

export class StreamChapters extends Server<Env> {
  // turn on Cloudflare's websocket hibernation
  readonly options = {
    hibernate: true,
  };

  active_chapter = 0;
  chapters: Chapter[] = [
    {
      title: "Chapter 1",
      completed: false,
    },
  ];

  syncAll() {
    this.broadcast(
      JSON.stringify({
        type: "sync",
        chapters: this.chapters,
        active_chapter: this.active_chapter,
      }),
    );
  }

  syncActive() {
    this.broadcast(
      JSON.stringify({
        type: "sync",
        active_chapter: this.active_chapter,
      }),
    );
  }

  remove(index: number) {
    // Remove the chapter
    this.chapters = [
      ...this.chapters.slice(0, index),
      ...this.chapters.slice(index + 1),
    ];

    // Adjust active_chapter if needed
    if (index <= this.active_chapter) {
      this.active_chapter = Math.max(0, this.active_chapter - 1);
    }

    this.syncAll();
  }

  add() {
    this.chapters.push({
      title: `Chapter ${this.chapters.length + 1}`,
      completed: false,
    });
    this.syncAll();
  }

  update(index: number, title: string) {
    // Update with the exact title string, even if empty
    this.chapters[index].title = title;
    this.syncAll();
  }

  next() {
    if (this.active_chapter < this.chapters.length - 1) {
      this.active_chapter += 1;
    } else {
      this.active_chapter = 0;
    }
    this.syncActive();
  }

  prev() {
    if (this.active_chapter > 0) {
      this.active_chapter -= 1;
    } else {
      this.active_chapter = this.chapters.length - 1;
    }
    this.syncActive();
  }

  toggle() {
    this.chapters[this.active_chapter].completed =
      !this.chapters[this.active_chapter].completed;
    this.syncAll();
  }

  onConnect(conn: Connection) {
    conn.send(
      JSON.stringify({
        type: "sync",
        chapters: this.chapters,
        active_chapter: this.active_chapter,
      }),
    );
  }

  onMessage(_conn: Connection, message: string) {
    try {
      const data = JSON.parse(message) as Message;

      if (data.type) {
        switch (data.type) {
          case "next":
            this.next();
            return;
          case "prev":
            this.prev();
            return;
          case "toggle":
            this.toggle();
            return;
          case "add":
            this.add();
            return;
          case "remove":
            if (data.index !== undefined) {
              this.remove(data.index);
            }
            return;
          case "update":
            if (data.index !== undefined && data.title !== undefined) {
              // Allow empty strings by checking for undefined, not truthy
              this.update(data.index, data.title);
            }
            return;
          case "sync":
            if (data.chapters) {
              this.chapters = data.chapters;
            }
            if (data.active_chapter !== undefined) {
              this.active_chapter = data.active_chapter;
            }
            this.syncAll();
            return;
        }
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  }

  async onRequest(request: Request) {
    if (request.method === "POST") {
      try {
        const data = await request.json<Message>();

        if (data.type) {
          switch (data.type) {
            case "next":
              this.next();
              break;
            case "prev":
              this.prev();
              break;
            case "toggle":
              this.toggle();
              break;
            case "add":
              this.add();
              break;
            case "remove":
              if (data.index !== undefined) {
                this.remove(data.index);
              }
              break;
            case "update":
              if (data.index !== undefined && data.title !== undefined) {
                // Allow empty strings by checking for undefined, not truthy
                this.update(data.index, data.title);
              }
              break;
            default:
              return new Response("Invalid action type", { status: 400 });
          }
          return new Response("Action completed");
        }
        return new Response("Missing action type", { status: 400 });
      } catch (error) {
        console.error("Error processing request:", error);
        return new Response("Bad request", { status: 400 });
      }
    }
    return new Response("Method not allowed", { status: 405 });
  }
}

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext) {
    return (
      (await routePartykitRequest(request, env)) ||
      new Response("Not found", {
        status: 404,
      })
    );
  },
} satisfies ExportedHandler<Env>;
```

### Key Elements of the Durable Object

Here are the important parts to understand:

1. **State Management**: The Durable Object maintains the chapters list and which chapter
   is active. Every instance (one per room) has its own isolated state.

```typescript
active_chapter = 0;
chapters: Chapter[] = [
  {
    title: "Chapter 1",
    completed: false,
  },
];
```

2. **WebSocket Handling**: The `onMessage` method processes all WebSocket messages from
   clients, updating state and broadcasting changes.

```typescript
onMessage(_conn: Connection, message: string) {
  try {
    const data = JSON.parse(message) as Message;
    if (data.type) {
      switch (data.type) {
        case "next":
          this.next();
          return;
        // other cases...
      }
    }
  } catch (error) {
    console.error("Error processing message:", error);
  }
}
```

3. **HTTP API**: The `onRequest` method exposes an HTTP API that accepts the same commands
   as WebSockets. This is critical for integrating with Stream Deck.

```typescript
async onRequest(request: Request) {
  if (request.method === "POST") {
    try {
      const data = await request.json<Message>();
      // Process commands similar to onMessage
    } catch (error) {
      console.error("Error processing request:", error);
      return new Response("Bad request", { status: 400 });
    }
  }
  return new Response("Method not allowed", { status: 405 });
}
```

4. **Broadcasting Updates**: The `syncAll` and `syncActive` methods notify all connected
   clients of changes. This is what makes our overlay update in real-time.

```typescript
syncAll() {
  this.broadcast(
    JSON.stringify({
      type: "sync",
      chapters: this.chapters,
      active_chapter: this.active_chapter,
    }),
  );
}
```

The HTTP-to-WebSocket bridge is one of the most powerful aspects here. It allows us to
send commands through simple HTTP requests (like from Stream Deck or any other tool) that
get translated into real-time updates for all connected viewers.

## Type Definitions

Before we go any futher, let's look at our shared type definitions:

```typescript:./src/types.ts
export type Chapter = {
  title: string;
  completed: boolean;
};

export type MessageTypes =
  | "sync"
  | "next"
  | "prev"
  | "add"
  | "remove"
  | "update"
  | "toggle";

export type Message = {
  type?: MessageTypes;
  chapters?: Chapter[];
  active_chapter?: number;
  index?: number;
  title?: string;
};
```

These types are shared between the frontend and backend, allowing TypeScript to help us
keep everything consistent. The `Message` type defines all the possible data that can be
sent over WebSockets or HTTP.

I would suggest adding a brief introduction before showing the full component, such as:

## The Svelte App

Now let's look at our main App component that handles both the UI display and WebSocket
communication. This component is responsible for:

- Establishing and maintaining the WebSocket connection
- Rendering different views based on URL parameters
- Managing the local state and syncing with the server
- Providing user controls for managing chapters

The complete component with all its features is shown below:

```svelte:./src/App.svelte
<script lang="ts">
  import type { Chapter, Message } from "./types";

  import { onMount } from "svelte";
  import PartySocket from "partysocket";

  import Check from "./components/Check.svelte";
  import Editor from "./components/Editor.svelte";
  import Pointer from "./components/Pointer.svelte";
  import Controls from "./components/Controls.svelte";

  // constants
  const PADDING_UNIT = 15;

  // Parse URL search parameters
  const url_params = new URLSearchParams(window.location.search);
  const room_name = url_params.get("room") || "default";
  const show_admin = url_params.get("admin") !== "false";
  const admin_only = url_params.get("admin_only") === "true";
  const chapters_only = url_params.get("chapters_only") === "true";

  // reactive state
  let chapters: Chapter[] = $state([]);
  let chapter_divs: HTMLDivElement[] = $state([]);
  let active_chapter = $state(0);

  // websocket connection
  const ws = new PartySocket({
    host: window.location.host,
    room: room_name,
    party: "stream-chapters",
  });

  onMount(() => {
    ws.addEventListener("message", onMessage);
  });

  const onMessage = (event: MessageEvent) => {
    const message: Message = JSON.parse(event.data);

    if (message.type !== "sync") return;

    if (message.chapters) {
      chapters = message.chapters;
    }

    if (message.active_chapter !== undefined) {
      active_chapter = message.active_chapter;
    }
  };

  const next = () => {
    ws.send(JSON.stringify({ type: "next" }));
  };

  const prev = () => {
    ws.send(JSON.stringify({ type: "prev" }));
  };

  const remove = (index: number) => {
    ws.send(JSON.stringify({ type: "remove", index }));
  };

  const add = () => {
    ws.send(JSON.stringify({ type: "add" }));
  };

  const update = (index: number, title: string) => {
    ws.send(JSON.stringify({ type: "update", index, title }));
  };

  const toggle = () => {
    ws.send(JSON.stringify({ type: "toggle" }));
  };

  const toggleChapterCompleted = (index: number) => {
    // First update local state to give instant feedback
    chapters[index].completed = !chapters[index].completed;
    // Then sync with server
    ws.send(
      JSON.stringify({
        type: "sync",
        chapters,
        active_chapter,
      }),
    );
  };

  // Calculate pointer position
  let pointer_from_top = $derived.by(() => {
    let height = 0;
    for (let i = 0; i <= active_chapter; i++) {
      if (!chapter_divs[i]) continue;

      if (i === active_chapter) {
        height += chapter_divs[i].clientHeight / 2;
      } else {
        height += chapter_divs[i].clientHeight;
      }

      height += PADDING_UNIT;
    }
    return height;
  });
</script>

<main class:admin_only class:chapters_only>
  {#if show_admin && !chapters_only}
    <div class="admin">
      <Controls {next} {prev} {toggle} />
      <Editor {chapters} {remove} {add} {update} {toggleChapterCompleted} />
      <div class="about">

          href="https://jovianmoon.io/posts/making-an-interactive-obs-overlay-with-cloudflare-durable-objects-and-svelte"
          target="_blank"
          rel="noopener noreferrer"
        >
          Read blog post
        </a>
      </div>
    </div>
  {/if}

  {#if !admin_only}
    <div
      class="chapters"
      style:padding="{PADDING_UNIT}px"
      style:gap="{PADDING_UNIT}px"
    >
      <Pointer {pointer_from_top} />
      {#each chapters as chapter, index}
        <div
          class="chapter"
          class:completed={chapter.completed}
          bind:this={chapter_divs[index]}
        >
          <Check checked={chapter.completed} />
          {chapter.title}
        </div>
      {/each}
    </div>
  {/if}

  {#if show_admin && !chapters_only}
    <div class="room_info">
      Room: {room_name}
    </div>
  {/if}
</main>

<style>
  main {
    position: absolute;
    top: 0;
    left: 0;
    width: 1920px;
    height: 1080px;
    outline: 2px solid red;
  }

  main.admin_only {
    position: relative;
    width: auto;
    height: auto;
    max-width: 300px;
    outline: none;
  }

  main.chapters_only {
    position: relative;
    width: auto;
    height: auto;
    outline: none;
    margin-left: 3rem;
  }

  .chapters {
    position: absolute;
    top: 0;
    right: 0;
    height: 1080px;
    width: 400px;
    display: flex;
    flex-direction: column;
    background: rgba(0, 0, 0, 0.5);
  }

  main.chapters_only .chapters {
    position: relative;
  }

  .chapter {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: rgba(255, 255, 255, 0.8);
    padding: 1rem;
    border-radius: 1rem;
    font-weight: bold;
    font-size: 1.5rem;
    line-height: 1.2;
  }

  .chapter.completed {
    background: rgba(0, 255, 0, 0.5);
  }

  .room_info {
    position: absolute;
    bottom: 1rem;
    left: 1rem;
    background: rgba(255, 255, 255, 0.8);
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-weight: bold;
  }

  .admin {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    position: absolute;
    top: 1rem;
    left: 1rem;
  }

  .admin_only .admin,
  .admin_only .room_info {
    position: relative;
    top: 0;
    left: 0;
  }

  .admin_only .room_info {
    margin: 0.5rem auto;
    text-align: center;
  }

  .about {
    font-size: 0.75rem;
    text-align: center;
    background: #fff;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
  }
</style>
```

Let's highlight some important parts of this component:

#### URL Parameter Control

```typescript
// Parse URL search parameters
const url_params = new URLSearchParams(window.location.search);
const room_name = url_params.get("room") || "default";
const show_admin = url_params.get("admin") !== "false";
const admin_only = url_params.get("admin_only") === "true";
const chapters_only = url_params.get("chapters_only") === "true";
```

This allows us to control the display mode by simply changing the URL. For example:

- `?room=stream1` - Connects to a specific room
- `?admin=false` - Hides all admin controls
- `?admin_only=true` - Shows only the admin panel
- `?chapters_only=true` - Shows only the chapters list

#### WebSocket Communication

```typescript
const next = () => {
  ws.send(JSON.stringify({ type: "next" }));
};

const prev = () => {
  ws.send(JSON.stringify({ type: "prev" }));
};
```

Each action is just a simple message sent over the WebSocket connection. This keeps our
code clean and maintainable.

#### Dynamic Pointer Position

```typescript
let pointer_from_top = $derived.by(() => {
  let height = 0;
  for (let i = 0; i <= active_chapter; i++) {
    if (!chapter_divs[i]) continue;
    if (i === active_chapter) {
      height += chapter_divs[i].clientHeight / 2;
    } else {
      height += chapter_divs[i].clientHeight;
    }
    height += PADDING_UNIT;
  }
  return height;
});
```

This calculation uses Svelte's `$derived` to automatically recalculate the pointer
position whenever the active chapter changes or the DOM updates.

For the active chapter, we only add half its height to position the pointer in the middle
of the chapter element rather than at its bottom edge. This creates a visual indicator
that points directly at the center of the currently active chapter.

#### Responsive Layout

```css
main {
  position: absolute;
  top: 0;
  left: 0;
  width: 1920px;
  height: 1080px;
  outline: 2px solid red;
}

main.admin_only {
  position: relative;
  width: auto;
  height: auto;
  max-width: 300px;
  outline: none;
}
```

The CSS adapts based on the URL parameters, making the component work both as a fullscreen
OBS overlay and as a standalone admin panel.

## The Components

The `Check.svelte` and `Pointer.svelte` are basic components that hold some SVG code, I
will list them below but they aren't that interesting.

```svelte:./src/components/Check.svelte
<script lang="ts">
  let { checked }: { checked: boolean } = $props();
</script>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  {#if checked}
    <rect width="256" height="256" fill="none" /><polyline
      points="88 136 112 160 168 104"
      fill="none"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="16"
    />
  {/if}
  <circle
    cx="128"
    cy="128"
    r="96"
    fill="none"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="16"
  /></svg
>

<style>
  svg {
    width: 2rem;
    height: 2rem;
    flex-shrink: 0;
  }
</style>
```

```svelte:./src/components/Pointer.svelte
<script lang="ts">
  import { fade } from "svelte/transition";
  let { pointer_from_top }: { pointer_from_top: number } = $props();
</script>

{#if pointer_from_top > 0}
  <svg
    transition:fade
    class="pointer"
    style:top="{pointer_from_top}px"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 256 256"
    ><rect width="256" height="256" fill="none" /><path
      d="M132.94,231.39A8,8,0,0,1,128,224V184H48a16,16,0,0,1-16-16V88A16,16,0,0,1,48,72h80V32a8,8,0,0,1,13.66-5.66l96,96a8,8,0,0,1,0,11.32l-96,96A8,8,0,0,1,132.94,231.39Z"
    /></svg
  >
{/if}

<style>
  .pointer {
    width: 2.5rem;
    height: 2.5rem;
    position: absolute;
    right: calc(100% + 0.2rem);
    fill: red;
    transition: top 200ms ease-in-out;
    transform: translateY(-50%);
  }
</style>
```

The `transition: top 200ms ease-in-out;` controls the animation of the pointer arrow.

The Controls component provides a simple interface for navigating through chapters and
toggling their completion status. With just three buttons, users can move to the previous
chapter, mark the current chapter as completed/incomplete, and advance to the next
chapter.

This is the same functionality that we can adapt to our Stream Deck, but in the browser. I
always add a browser version of the controls in my stream overlays for testing an
emergancies.

> Note: Notice how we pass functions as props, this is the Svelte 5 way of doing things.

```svelte:./src/components/Controls.svelte
<script lang="ts">
  let {
    next,
    prev,
    toggle,
  }: {
    next: () => void;
    prev: () => void;
    toggle: () => void;
  } = $props();
</script>

<div class="controls">
  <button onclick={prev}> Prev </button>
  <button style:flex="1 1 auto" onclick={toggle}> Toggle Completed </button>
  <button onclick={next}> Next </button>
</div>

<style>
  .controls {
    background: #fff;
    padding: 1rem;
    border-radius: 0.5rem;
    display: flex;
    gap: 0.25rem;
  }
</style>
```

The Editor component gives us a flexible way to manage our chapter list. It provides a
complete interface for adding, removing, renaming, and marking chapters as completed. This
component is particularly useful when used independently with the ?admin_only=true URL
parameter.

```svelte:./src/components/Editor.svelte

<script lang="ts">
  import type { Chapter } from "../types";

  let {
    chapters,
    remove,
    add,
    update,
    toggleChapterCompleted,
  }: {
    chapters: Chapter[];
    remove: (index: number) => void;
    add: () => void;
    update: (index: number, title: string) => void;
    toggleChapterCompleted: (index: number) => void;
  } = $props();
</script>

<div class="editor">
  {#each chapters as chapter, index}
    <div class="chapter">
      <input
        type="checkbox"
        checked={chapter.completed}
        onchange={() => toggleChapterCompleted(index)}
      />
      <input
        type="text"
        value={chapter.title}
        oninput={(e) => update(index, e.currentTarget.value)}
      />
      <button onclick={() => remove(index)}> &times; </button>
    </div>
  {/each}
  <button class="add" onclick={add}> Add new chapter </button>
</div>

<style>
  .editor {
    background: #fff;
    padding: 1rem;
    border-radius: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .chapter {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .add {
    margin-top: 0.5rem;
  }

  input {
    flex: 1 1 auto;
  }
</style>

```

## The app.css

Remember the blank `app.css` file?

This is some minimal reset stuff that should be applied globally and not in the Svelte
component `<style>` tag

```css:./src/app.css
*,
*::before,
*::after {
  box-sizing: border-box;
}

* {
  margin: 0;
}

body {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  padding: 0;
}
```

## Wrangler.json

We added a custom deployment target for the worker.

```json:wrangler.json

{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "stream-chapters",
  "main": "./worker/server.ts",
+  "routes": [
+    {
+      "pattern": "chapters.jovianmoon.io",
+      "custom_domain": true
+    }
+  ],
  "compatibility_date": "2025-02-04",
  "assets": {
    "directory": "./public"
  },
  "durable_objects": {
    "bindings": [
      {
        "name": "StreamChapters",
        "class_name": "StreamChapters"
      }
    ]
  },
  "migrations": [
    {
      "tag": "v1",
      "new_classes": ["StreamChapters"]
    }
  ],
  "observability": {
    "enabled": true
  }
}

```

And that's it for the code! It's quite a bit to just take in, especially if you aren't
familiar with Cloudflare, websockets, or Svelte. If you aren't, congratulations on getting
this far.

The beauty of this setup is how these technologies work together to create something
greater than the sum of their parts:

- **Svelte** gives us a reactive UI with minimal code
- **Cloudflare Durable Objects** provide persistent state without managing servers
- **WebSockets** enable real-time updates across all connected clients
- **HTTP endpoints** allow external integration with tools like Stream Deck

With less than 500 lines of code total, we've built a complete, production-ready stream
overlay system that's fully customizable and scales automatically. The same principles can
be applied to create all sorts of interactive stream elements - from custom alerts to
viewer polls and beyond.

## Setting it up in OBS

This section assumes you have basic knowledge of OBS, including scenes, sources, and how
they work together. I'll be using my deployed version of the application with a room name
of `demo`.

### Adding the Overlay to Your Scene

1. Create or select a scene with your desired mic, camera, and other elements.
2. Add a Browser Source to your scene:
   - Right-click in the Sources panel → Add → Browser
   - Name it something like "Chapters Overlay"
   - Set the dimensions to `1920×1080` pixels

> **Note**: These instructions are based on Windows OBS. Mac or Linux users might see
> slightly different menu options, but the concept remains the same.

3. Set the URL to: `https://chapters.jovianmoon.io?room=demo&admin=false`

4. When you add this browser source, you'll notice a white background. To fix this, enter
   the following in the Custom CSS box:

```css
body {
  background: rgba(0, 0, 0, 0);
}
```

This removes the white background, leaving only our semi-transparent overlay visible!

### Setting Up the Admin Controls

1. Go to the `View` menu at the top → `Docks` → `Custom Browser Docks`
2. Add a new dock:
   - Enter a name like "Chapters Admin"
   - Set the URL to: `https://chapters.jovianmoon.io?room=demo&admin_only=true`

You can now drag this dock anywhere within your OBS interface. Use it to add, remove, or
edit chapters directly from OBS.

### Remote Control Options

The beauty of this WebSocket-based approach is that you can control your overlay from
anywhere:

- Use the OBS dock as described above
- Open the admin URL on your phone or tablet
- Have a producer or assistant manage chapters from another computer

All changes sync instantly across all connected devices since the state is maintained in
the Durable Object and communicated via WebSockets.

## Controlling with a Stream Deck

Elgato Stream Decks are fantastic hardware companions for streamers. These customizable
button panels can control many aspects of OBS, but their default software doesn't have
built-in support for interacting with our custom overlay.

### Setting Up HTTP Requests

1. First, install a Stream Deck plugin that can send HTTP requests with JSON bodies.
   Several options are available in the Stream Deck Store.

2. We'll set up three buttons for our basic controls:

   - Previous Chapter
   - Next Chapter
   - Toggle Completion Status

3. Each button will send a POST request to the same endpoint but with different JSON
   bodies.

### Configuring the Buttons

For our demo room, configure each button to send requests to:

```
https://chapters.jovianmoon.io/parties/stream-chapters/demo
```

> **Note**: The last part of the URL is the room name, which is crucial for targeting the
> correct Durable Object instance!

Configure each button with the following settings:

**Previous Chapter Button:**

- Method: `POST`
- Content-Type: `application/json`
- Body:

```json
{
  "type": "prev"
}
```

**Next Chapter Button:**

- Method: `POST`
- Content-Type: `application/json`
- Body:

```json
{
  "type": "next"
}
```

**Toggle Completion Button:**

- Method: `POST`
- Content-Type: `application/json`
- Body:

```json
{
  "type": "toggle"
}
```

Make sure you set the proper header for each request:

```
Content-Type: application/json
```

With these configurations in place, you now have physical buttons that instantly update
your stream overlay. As you press the buttons, the changes are broadcast to all connected
clients, giving your viewers a seamless experience.

## In Conclusion

We've built a fully functional, real-time stream overlay system that leverages the power
of modern web technologies. From Cloudflare Durable Objects maintaining our state to
Svelte providing a reactive UI, and WebSockets enabling instant updates across all
connected clients, this project showcases how these technologies can work together to
create something truly useful for streamers.

What makes this solution particularly powerful is its flexibility:

- **No server management** - Everything deploys to Cloudflare's edge network
- **Multiple control options** - Control from OBS, browser, mobile device, or Stream Deck
- **Room-based isolation** - Run multiple overlays for different streams without
  interference
- **Customizable interface** - Adapt the appearance through URL parameters and CSS

This approach can be extended far beyond just chapter markers. The same architecture could
power viewer polls, custom alerts, interactive maps, or any other dynamic element you
might want in your stream.

The best part is that it's all powered by open web standards, making it accessible to
anyone with web development experience. You're not locked into proprietary streaming
software or limited by what OBS plugins can do – you're only limited by your imagination
and coding skills.

I hope this tutorial has given you some ideas for enhancing your own streams with custom
overlays. Whether you use this exact implementation or adapt the concepts to build
something entirely different, the combination of serverless edge computing and real-time
web technologies opens up exciting possibilities for creating engaging, interactive
streaming experiences.

Happy streaming!
