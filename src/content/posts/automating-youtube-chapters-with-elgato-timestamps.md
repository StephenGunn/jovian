---
title: Automate (almost) your YouTube Chapter Creation in OBS with Elgato Timestamps
description:
  A workflow and tool to transform your content timestamps into YouTube-ready chapter
  markers.
date: "2025-5-3"
categories:
  - tool
  - elgato
  - obs
  - live streaming
published: True
bluesky_thread_id: 3lobtci3ezk2l
---

<script lang="ts">
    import YouTubeChapterConverter from '$lib/components/blog/YouTubeChapterConverter.svelte';
</script>

## Overview

During the 2020 pandemic lockdown, I helped my Mom start a weekly paper-crafting live
stream show that kind of took off. I've used it as a platform to push myself and learn the
technical side of live streaming. The project,
[Craft Roulette](https://craftroulette.live), continues to grow, so I continue to work on
it.

I recently figured out a way to almost automate the creation of YouTube chapters for the
archived live streams. This post contains instructions on how to duplicate my setup and
the tool I use to convert the Elgato Streamdeck Timestamps plugin output to the YouTube
chapter format.

I created this tool for my own workflow and I'm actively using it in production. I decided
to write this blog post and share the tool so other creators can benefit from it too!

## The Converter

<YouTubeChapterConverter />

If you're curious how this works,
[click here](https://github.com/StephenGunn/jovian/blob/main/src/lib/components/blog/YouTubeChapterConverter.svelte)
to view the source code.

## Setup Guide & How To Use

This workflow isn't perfect and a bit of a hack, but it works for me. I hope it helps you
too!

![My dual streamdeck setup|width=600,height=246](/blog/youtube/view.png "I use a dual Streamdeck setup to produce the
show.")

### Step 1: Set Up the Timestamp Plugin

The
[Elgato Timestamp plugin](https://marketplace.elgato.com/product/timestamp-76bd699e-cded-44d8-aaa5-a7e863657b93)
lets you mark memorable events with a simple key press, perfect for creating YouTube
chapters:

![The timestamp plugin|width=526,height=172](/blog/youtube/timestamp.png "Configure the timestamp plugin actions")

1. Install the
   [official Timestamp plugin from the Stream Deck Marketplace](https://marketplace.elgato.com/product/timestamp-76bd699e-cded-44d8-aaa5-a7e863657b93)
2. Add the "New Log" action to start tracking timestamps
3. Add the "Marker" action to mark key moments during your stream
4. Make sure "Elapsed time" is checked in the Marker settings

### Step 2: Create Multi-Actions for Show or Stream Segments

![Create a multi-action inside of the streamdeck software|width=914,height=536](/blog/youtube/multiaction.png "One of the many complicated multi-actions I use")

For streamlined workflow, create Multi-Actions that both change your scene and mark
timestamps:

1. Create a new Multi-Action button on your Stream Deck
2. Add your scene switching action (e.g., "OBS Studio: Scene")
3. Add the "Timestamp: Marker" action to the same Multi-Action
4. Set a descriptive title for the marker (e.g., "Guest Introduction", "Q&A Session")
5. Repeat for each segment of your show

> This allows you to simultaneously switch scenes and mark timestamps with a single button
> press.

### Step 3: During Your Stream

While streaming, use your Stream Deck to mark important segments:

![Bind a button to your new log action|width=504,height=357](/blog/youtube/streamdeck.png "Make sure to bind a button to your New Log action, this won't work inside of a multiaction")

1. Don't forget to press the "New Log" button at the beginning of your stream, or your
   timestamps won't get logged!
2. As your show progresses, press your Multi-Action buttons to switch scenes and mark
   timestamps
3. Each press creates a timestamp with your pre-defined label
4. Continue marking all important segments throughout your stream

The beauty of this system is its minimal impact on your production workflow. I've only
added two extra button presses to my entire show production: starting the log session at
the beginning and ending it when we wrap up. All other logging actions are seamlessly
integrated into Multi-Actions I already had set up to manage scene transitions and show
states.

### Step 4: Check Your Timestamps

After your stream is complete:

1. Press the "New Log" button again to end the logging session (important)
2. Your timestamp log will be saved as a .txt file in the directory you set up
3. The log file will contain lines like:

   `elapsed time: 00:02:39 text: Last Week's Episode`

### Step 5: Convert to YouTube Chapters

Use the converter above to transform your timestamps to YouTube-compatible chapter
markers:

1. Drag and drop your timestamp file into the converter
2. The first chapter will be set to 00:00 (YouTube requirement)
3. If there is no timestamp in the first 10 seconds of your log, a generic "Intro" chapter
   will be created
4. Adjust the offset if needed (see below)
5. Copy the formatted chapters
6. Paste into your YouTube video description

## Why You Might Need the Offset Feature

The offset feature is essential for streamers because:

- **Stream Start Timing:** The exact moment you go live often doesn't match when you start
  your timestamp log or mark your intro
- **Editing Adjustments:** If you line up the first chapter, all the others should fall
  into place

### How to Use the Offset:

- **Positive Offset:** Moves all timestamps later (e.g., +5 seconds if you added a
  5-second intro)
- **Negative Offset:** Moves all timestamps earlier (e.g., -10 seconds if you trimmed the
  first 10 seconds)
- The first chapter will always remain at 00:00 as required by YouTube

## Behind the Scenes

I built the converter using regular expressions to extract timestamps and titles:

```typescript
// Format: "elapsed time: 00:00:02    text: Last Week's Contributions"
const elgatoRegex = /elapsed time: (\d{2}):(\d{2}):(\d{2})\s+text: (.+)/g;
```

> I fully endorse the use of AI to generate regular expressions.

The tool parses matches into a data structure, applies the offset, and formats everything
according to YouTube's requirements. I implemented special handling to ensure the first
chapter is at 00:00, and add timestamp adjustments through a simple offset system.

## Why I Built This Tool

No matter how hard I tried, I would always give up on using chapters on YouTube if I had
to manually assign them. Even though I could do it in 5-10 minutes, it was always really
low down on my list of priorities. With this tool, it takes me about a minute to convert
and add the chapters after the stream ends, which means that I will actually do it.

If you're like me and tend to skip adding chapters because it feels like one more tedious
post-production task, this might help you too. Feel free to reach out with any comments or
suggestions!
