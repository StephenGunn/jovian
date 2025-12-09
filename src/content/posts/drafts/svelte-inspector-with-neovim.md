---
title: Getting Svelte Inspector Working with Neovim
description: Setting up click-to-edit from browser to Neovim on Arch Linux
date: "2025-12-9"
categories:
  - sveltekit
  - neovim
  - tooling
published: true
---

## Svelte Inspector

[Ilja's Day 8 of Advent of Svelte](https://bsky.app/profile/fubits.dev) called the Svelte
Inspector a "vastly underrated DX boost" and it reminded me this feature existed. When I
first switched to Neovim, I really wanted this - press a keyboard shortcut, click any
element in your browser, and it opens the corresponding component at the exact line and
column.

I found [Theo Steiner's deep-dive](https://github.com/Theo-Steiner/blog/discussions/4)
about getting it working with Neovim via RPC sockets, but it required maintaining a bash
script that parsed process IDs and matched working directories. I didn't want to maintain
that at a scripting level, so I just got better at telescope and live grep instead.

But Ilja's post inspired me to go back to it, and I found
[nasso](https://tangled.org/nasso.dev/launch-editor-nvim/) had rewritten the solution in
Rust.

## The Smart Solution

Every Neovim instance automatically creates an RPC socket. The tool finds all running
Neovim sockets, checks which one's working directory is the closest ancestor to the file
being opened, and sends a remote command to that specific instance.

No new processes, no swapfile conflicts, no bash scripts to maintain.

On Arch:

```bash
cargo install --locked launch-editor-nvim
```

Fish config:

```fish
set -gx LAUNCH_EDITOR launch-editor-nvim
```

svelte.config.js:

```javascript
vitePlugin: {
  inspector: {
    toggleKeyCombo: "alt-x",
    showToggleButton: "always",
    toggleButtonPos: "bottom-right",
  },
}
```

## In Action

<script lang="ts">
    import MediaPlayer from '$lib/layout/MediaPlayer.svelte';
</script>

<MediaPlayer video="https://github.com/user-attachments/assets/d53d6b8d-beae-4bac-bede-2b2960de7b02" />

## The Gotcha

The dev server needs the `LAUNCH_EDITOR` environment variable. After adding it to Fish
config, source it or start a new terminal before restarting your dev server.

Now I have the best of both worlds - telescope for most navigation, but sometimes clicking
is just easier.

> note: The inspector is great when you're not familiar with the codebase.

## Standing on the Shoulders of Giants

This solution exists because:

- [Theo Steiner](https://github.com/Theo-Steiner/blog/discussions/4) wrote the original
  deep-dive explaining how to wire up Neovim RPC sockets to the Svelte Inspector using
  bash
- [nasso](https://tangled.org/nasso.dev/launch-editor-nvim/) took that concept and built a
  proper Rust implementation that anyone can install via cargo
- [Joy of Code](https://joyofcode.xyz/svelte-inspector) documented the basic inspector
  setup for VS Code users that I originally used
