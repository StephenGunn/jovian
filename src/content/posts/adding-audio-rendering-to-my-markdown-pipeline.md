---
title:
  Generating Audio Transcriptions From Markdown Files in a SvelteKit Project using the
  ElevenLabs API
description:
  How I hooked into my markdown rendering process to automate audio transcription and
  embedding.
date: "2024-11-12"
categories:
  - sveltekit
  - audio
published: true
#bluesky_thread_id: "3lardrinpms2m"
---

// NOTES FOR REWRITE: is transcriptions the write wording?

# Building an Audio Narration System for a Memorial Website with ElevenLabs

## The Project That Became a Website

This started as a simple favor. A family friend's son Andy passed away, and she had been
collecting stories and memories from his friends and family. What began as maybe helping
organize some documents somehow turned into a full website - you know how these projects
go. A couple of years later, "The 11" has over 100 articles from dozens of authors, each
sharing their memories and stories about Andy.

The site uses the same markdown processing system as this blog, which I adapted to handle
the unique needs of this project. As the project as grown, authors have sent in everything
from Facebook posts to photos with long captions, and I've built custom Svelte components
to display them properly.

I was working on the site and wondered how quickly I could generate audiobook-style
transcriptions directly from the text. I realized it wouldn't be much more work to keep
track of everything in JSON, and that I could automatically embed all the files directly
into their corresponding articles by default. All I have to do is type one command for
everything: `pnpm audio:generate` or include the slug
`pnpm audio:regenerate 01-friendship/sword-shopping` to surgically regenerate a single
article.

It only took about 3 minutes from the idea to the first text generation using ElevenLabs
dashboard. I quickly realized how much depth it would add to the project, and would allow
a lot more people to enjoy the work. I decided that I would add it, if it didn't create a
bunch of extra work for myself down the road.

## The Plan

I knew each article needed it's own transcription and file. I knew I didn't want to have
to manually manage the audio files, embedding, versioning, and conversion from markdown to
text that can be pasted into the ElevenLabs web dashboard.

I knew there was going to be small changes to articles once we started sending the project
out to the contributors. I figured if I wasn't able to quickly bang out a system for
managing all of this that I would be on the hook for at least 150 audio renders... I and I
just can't put in that kind of time to this project.

Luckily, ElevenLabs has a fantastic API for creating audio from text. Their voices are all
over YouTube shorts, TikToks, and I'm sure instagram.

Either way, I needed to automate the system, and I needed to move quickly. I knew this
would be a perfect test for Claude Code, since the end result wouldn't be running in
production, but would always be a step I took locally on my own machine.

## The Actual Problem

The tricky part wasn't generating audio - ElevenLabs makes that easy. The challenge was
extracting clean, readable text from over 100 markdown files that contain:

- Custom Svelte components like `<FacebookQuote>` and `<Image>`
- Special formatting for quotes with attribution
- Photo descriptions that needed to be announced
- Various other components that shouldn't be read aloud

This is where AI tools actually shine - while it's great to watch them shit out TypeScript
boiler plate, their knowledge of processing text is quite absurd.

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
throughout the project. The mdsvex-processed markdown could now be transformed into an
audio-friendly storytelling experience. Components like `<FacebookQuote>` became "From
Andy's Facebook...", images got proper announcements, and non-readable components were
cleanly filtered out.

## The Architecture

The solution ended up being straightforward:

1. **A SvelteKit endpoint** that uses the existing markdown processor but with custom
   rules for audio
2. **A TypeScript script** that calls the endpoint and generates audio files
3. **A JSON manifest** to track what's been generated

Since this runs on my dev machine, I can generate all the audio files locally and commit
them to the repo. No need for production API keys or complex deployment. The files are
served directly from Cloudflare workers.

```bash
# One command to generate audio for new articles
pnpm audio:generate

# Regenerate a specific article if needed
pnpm audio:regenerate 01-friendship/sword-shopping
```

## Hacking the Iterative Cycle

// NOTE: rewrite next part to be about letting claude code run the dev server, then having
it add appropriate logging so it could see the output, then it could run the generate
audio command with the -t test flag. It took about 30-40 cycles to get all of the custom
component edge cases worked out but that only took about 3 minutes of real time.

What started as simple text extraction evolved through several iterations:

1. **First attempt**: Basic markdown stripping - worked but lost all formatting context
2. **Adding component awareness**: Regex to detect `<FacebookQuote>`, `<Image>` components
3. **Handling edge cases**: Multiline components, nested HTML, smart quotes
4. **Pacing improvements**: Started with ellipses `...`, evolved to SSML
   `<break time="1.5s" />`
5. **Voice refinement**: Sarah → George, removed speed control, tuned voice settings
6. **Version control**: Never overwrite recordings, create versioned files instead

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
- Create an "audiobook" mode that plays through related stories
- Make the content accessible to people who prefer listening
- Preserve these memories in another format

## The Real Value

This whole thing took about 15 minutes to get a working version, but getting it really
dialed in took a bit more iteration. The breakthrough came from having Claude Code run the
dev server while debugging - using console logs and testing API responses with the `-t`
flag to see exactly how the markdown was being transformed into speech-friendly text.

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

// NOTE: help me rewrite this based on how the above was reworked

The iterative process of test → adjust regex/parsing → test again was incredibly fast with
Claude Code handling both the code changes and the testing. This kind of rapid feedback
loop is where AI tools really shine.

When you're building something just for yourself to run locally, you can move fast. You
don't need error boundaries, retry logic, or perfect code coverage. You just need it to
work, then refine it until it sounds right. AI tools are perfect for this kind of
development - quick initial implementation, then rapid iteration to perfection.

Now over 100 articles have audio versions, generated with a single command, tracked in a
simple JSON file, and automatically embedded in the site. Sometimes the best tools are the
ones you throw together in an afternoon.
