---
title: Adding Audio Narration to a Memorial Website in 45 Minutes
description:
  How Claude Code helped me build an automated audio pipeline for 100+ markdown articles
  using ElevenLabs
date: "2025-08-21"
categories:
  - sveltekit
  - audio
published: true
#bluesky_thread_id: "3lardrinpms2m"
---

<script lang="ts">
    import MediaPlayer from '$lib/layout/MediaPlayer.svelte';
</script>

# Building an Audio Narration System for a Memorial Website with ElevenLabs

## The Project That Became a Website

This started as a simple favor. A family friend's son Andy passed away, and she had been
collecting stories and memories from his friends and family. What began as maybe helping
organize some documents somehow turned into a full website - you know how these projects
go. A couple of years later, "The 11" has over 100 articles from dozens of authors, each
sharing their memories and stories about Andy.

<MediaPlayer video="https://github.com/user-attachments/assets/22a2fd02-001d-46ea-9c22-c766d2987bc3" />

The site uses the same markdown processing system as this blog, which I adapted to handle
the unique needs of this project. As the project has grown, authors have sent in
everything from Facebook posts to photos with long captions, and I've built custom Svelte
components to display them properly.

While working on the site, I wondered how quickly I could generate audiobook-style
narrations directly from the text. With a bit of JSON tracking, I realized I could
automatically embed the audio files directly into their corresponding articles. All I have
to do is type one command for everything: `pnpm audio:generate` or include the slug
`pnpm audio:regenerate 01-friendship/sword-shopping` to surgically regenerate a single
article.

It only took about 3 minutes from the idea to the first audio generation using
[ElevenLabs dashboard](https://elevenlabs.io). I quickly realized how much depth it would
add to the project, and would allow a lot more people to enjoy the work. I decided that I
would add it, if it didn't create a bunch of extra work for myself down the road.

## The Plan

I knew each article needed its own narration and file. I knew I didn't want to have to
manually manage the audio files, embedding, versioning, and conversion from markdown to
text that can be pasted into the ElevenLabs web dashboard.

I knew there was going to be small changes to articles once we started sending the project
out to the contributors. I figured if I wasn't able to quickly bang out a system for
managing all of this that I would be on the hook for at least 150 audio renders... and I
just can't put in that kind of time to this project.

Luckily, [ElevenLabs](https://elevenlabs.io/) has a fantastic
[API](https://docs.elevenlabs.io/api-reference/text-to-speech) for creating audio from
text. Their voices are all over YouTube shorts, TikToks, and I'm sure instagram.

Either way, I needed to automate the system, and I needed to move quickly. I knew this
would be a perfect test for [Claude Code](https://claude.ai/code), since the end result
wouldn't be running in production, but would always be a step I took locally on my own
machine.

## The Technical Challenge

The tricky part wasn't generating audio - ElevenLabs makes that easy. The challenge was
extracting clean, readable text from over 100 markdown files that contain:

- Custom Svelte components like `<FacebookQuote>` and `<Image>`
- Special formatting for quotes with attribution
- Photo descriptions that needed to be announced
- Various other components that shouldn't be read aloud

This is where AI tools shine - beyond generating TypeScript boilerplate, their text
processing capabilities are remarkable.

## What AI Actually Helped With

The most valuable use of Claude Code was working through the text extraction logic. For
example:

```typescript
// Converting custom components to readable text
'FacebookQuote': (node, props) => {
  const date = props.date ? ` Posted on ${props.date}.` : '';
  return `From Andy's Facebook:${date} "${node.value}"`;
},
'Image': (_node, props) => {
  const description = props.alt || props.caption || 'no description';
  return `[There is an image here showing: ${description}.]`;
}
```

Claude set up the custom parsing rules to account for the Svelte components sprinkled
throughout the project. The [mdsvex](https://mdsvex.pngwn.io/)-processed markdown could
now be transformed into an audio-friendly storytelling experience. Components like
`<FacebookQuote>` became "From Andy's Facebook...", images got proper announcements, and
non-readable components were cleanly filtered out.

## The Architecture

The solution ended up being straightforward:

1. **A [SvelteKit](https://kit.svelte.dev/) endpoint** that uses the existing markdown
   processor but with custom rules for audio
2. **A TypeScript script** that calls the endpoint and generates audio files
3. **A JSON manifest** to track what's been generated

Since this runs on my dev machine, I can generate all the audio files locally and commit
them to the repo. No need for production API keys or complex deployment. The files are
served directly from [Cloudflare Workers](https://workers.cloudflare.com/).

```bash
# One command to generate audio for new articles
pnpm audio:generate

# Regenerate a specific article if needed
pnpm audio:regenerate 01-friendship/sword-shopping
```

## Hacking the Iterative Cycle

What made this work so well was letting Claude Code take control of the entire development
cycle. I gave it permission to run the dev server, then told it about the `-t` test flag
that would show the extracted text without calling the ElevenLabs API. It immediately 
started adding strategic console.log statements throughout the markdown processing pipeline 
to see exactly how each component was being transformed.

This kicked off an incredibly fast iteration cycle:

```bash
pnpm audio:regenerate 01-friendship/sword-shopping-with-a-dying-man -t
```

Claude Code would:

1. Spot an issue in the console output (like a FacebookQuote with multiline content being
   mangled)
2. Update the parsing logic
3. Re-run the test command
4. Verify the fix

It took about 30-40 iterations to handle all the edge cases - multiline components, nested
HTML, smart quotes, proper pause insertion. But here's the kicker: those 30-40 cycles
happened in about 3 minutes of real time.

The evolution was rapid:

- **Basic markdown stripping** → Lost all formatting context
- **Component-aware regex** → Started catching `<FacebookQuote>` and `<Image>` tags
- **Multiline handling** → Fixed components that spanned multiple lines
- **Natural pacing** → Evolved from basic ellipses to SSML `<break time="1.5s" />` tags
- **Voice optimization** → Switched from Sarah to George, removed speed controls
- **Version control** → Never overwrite recordings, create versioned files instead

### Text Extraction Rules

The endpoint processes each article through a pipeline that:

- Preserves quote components with proper attribution and pauses
- Announces images with their descriptions (or group descriptions)
- Skips non-readable components like playlists
- Handles blockquotes, headings, and lists with appropriate pacing
- Converts dashes and ellipses to natural speech pauses

### Local-First Approach

Everything runs locally:

```bash
pnpm dev                    # Start the dev server
export ELEVEN_LABS_API_KEY="..."
pnpm audio:generate         # Generate MP3s
git add static/audio        # Commit the files
```

The generated MP3s are about 2-5MB each, perfectly reasonable to store in the repo.

## What This Enables

With audio files for all 100+ articles, we can now:

- Add a simple audio player to each article page
- Create an "audiobook" mode that plays through the rest of the project (starting from where the user starts playback) and will scroll the articles along with the audio
- Make the content accessible to people who prefer listening
- Preserve these memories in another format

## Rapid Iteration in Action

Getting a working version took about 15 minutes, but the real magic happened during the
refinement phase. The breakthrough came from having Claude Code run the dev server while
debugging - using console logs and testing API responses with the `-t` flag to see exactly
how the markdown was being transformed into speech-friendly text.

Being able to run commands like:

```bash
pnpm audio:regenerate 01-friendship/sword-shopping-with-a-dying-man -t
```

And immediately see the extracted text helped us catch issues like:

- FacebookQuote components with multiline content not being processed
- Quotes needing proper pauses and "Quote:" prefixes
- Section intros needing special formatting
- Images needing audio-friendly descriptions

## Conclusion

AI is a tool like anything else - when used properly, it can deliver impressive results. This experiment lands firmly in my win column. Those 30-40 edge cases with multiline components, nested quotes, and custom formatting would have taken me hours to debug manually. Instead, I got a working system in about 45 minutes total.

The result speaks for itself: over 100 articles now have audio narrations, generated with a single command, tracked in JSON, and automatically embedded in the site. The memorial project is more accessible, and I didn't burn a weekend wrestling with regex patterns.

Sometimes you just need the right tool for the job. In this case, Claude Code's ability to rapidly iterate through text parsing logic while I focused on the bigger picture made all the difference. The project got what it needed, and I got to move on to other things.
