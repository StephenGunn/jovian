---
title: Apple Magic Trackpad (USB-C) on Arch Linux with Hyprland
description: Getting the Magic Trackpad working with full gesture support on Linux
date: "2026-1-30"
categories:
  - linux
  - arch
  - hyprland
published: true
bluesky_thread_id: 3mdnuju36pc2u
---

<script lang="ts">
    import BlogImage from '$lib/components/blog/BlogImage.svelte';
</script>

## Why a Trackpad?

I've been fighting RSI for a while now, but in December I hit an absolute wall. There were
days where I wasn't sure I'd be able to type again. I took pretty drastic measures,
including reducing my keyboard from 58 keys to 36 (currently using 34) to reduce wrist
strain caused by flexing my wrists to reach key combos. I'm now fully convinced that a 34
or 36 key keyboard is not only completely doable, but actually the best way to type. More
posts on that coming soon.

<BlogImage src="blog/catncoffee.webp" caption="Action shot while working-on this article: Cat, coffee, and peripherals" />

My goal is to use my keyboard for as much as possible. Tiling window navigation in
Hyprland, Neovim motions, keybinds for everything. But you'll always need some kind of
pointer for GUIs. I've been switching between a Kensington trackball and various mice for
years, and no matter what configuration I tried, the trackball still caused pain and
discomfort.

<BlogImage src="blog/appletrackpad1.webp" caption="Modern design on a chunk of petrified tree" />
> This is really just an excuse to show off my tree.

The Magic Trackpad turned out to be the perfect middle ground. I'm a Linux nerd who wants
to use and make open and free software, but I also appreciate good hardware. Apple
trackpads have their reputation for a reason.

## Finding Resources

The [Arch Wiki](https://wiki.archlinux.org/title/Mac/Troubleshooting#Touchpad) is always
the place to start. Beyond that, I found some old forum posts and YouTube videos, but
there weren't great resources online for getting full gesture support working on Hyprland
specifically. The forum posts I found were years old and hardware support has come a long
way since then. But you still have to know what you're doing to troubleshoot, and that's
why Arch Linux is considered advanced. If you don't know how to dig into the problem,
you'll find yourself pasting scripts from ChatGPT or forums and that is not where you want
to be. Hence this post.

> A note to random new Linux users who found this post: read the Arch Wiki, read man
> pages, and explore the filesystem. Learn about programs like
> [tealdeer](https://github.com/tealdeer-rs/tealdeer). Start the traditional ways, build
> your foundational knowledge, then start asking chatbots questions.

## The Pairing Problem

I never hooked up the trackpad with a cable. I was able to get it fully working over
Bluetooth only.

<BlogImage src="blog/appletrackpad2.webp" caption="Ancient petrified wood meets bleeding-edge hardware" />

My first attempt was using HyprPanel's bluetooth menu. The trackpad appeared, I clicked
connect, I used the trust device icon and established what looked like trust. It was not.

It would not work at all until it was bonded. The `trust` command in `bluetoothctl` is
what creates a proper bonded connection, and for some reason HyprPanel would not do this.

I admit I might have been able to solve this and fix HyprPanel, but it was already on my
shitlist for being slow and crashing. Once I realized it was hiding info from me and not
working, I binned it real quick.

The fix is using `bluetoothctl` directly.

## Proper Bluetooth Pairing

Turn on the trackpad. There's no explicit pairing mode or blinking light on the
[USB-C model](https://www.apple.com/shop/product/mxk93am/a/magic-trackpad-usb%E2%80%91c-white-multi-touch-surface),
you just turn it on and it's discoverable. I'm not sure how this would work if you paired
it with a Mac first and then tried to pair with Linux.

<BlogImage src="blog/appletrackpad3.webp" caption="No pairing button - switching between machines might be tricky" />

> I plan on using this with multiple machines. I have a hunch that some more bash
> scripting is in my future.

```bash:terminal
bluetoothctl
```

```bash:bluetoothctl
power on
agent on
default-agent
scan on
```

You'll see the trackpad appear:

```
[NEW] Device AA:BB:CC:DD:EE:FF Apple Inc. Magic Trackpad
```

Now the key part - pair, trust, and connect:

```bash:bluetoothctl
pair AA:BB:CC:DD:EE:FF
trust AA:BB:CC:DD:EE:FF
connect AA:BB:CC:DD:EE:FF
```

The `trust` command is what creates a proper bonded connection. Without it, you'll keep
having issues.

```bash:bluetoothctl
scan off
exit
```

## Adding Gestures

At this point the trackpad works as a pointer, but no gestures. For that we need
[libinput-gestures](https://wiki.archlinux.org/title/Libinput).

Here's what I configured:

- **3-finger swipe left/right** → switch workspaces
- **3-finger swipe up/down** → toggle scratchpad terminal
- **4-finger swipe up** → fullscreen
- **4-finger swipe down** → toggle floating
- **2-finger pinch in/out** → volume control

I didn't have to configure:

- **2-finger scrolling** → worked out of the box

```bash:arch.btw
yay -S libinput-gestures
sudo usermod -aG input $USER
```

Log out and back in for the group change to take effect.

## Gesture Configuration

Create your gesture config:

```conf:~/.config/libinput-gestures.conf
swipe_threshold 30

# 3-finger workspace switching
gesture swipe left 3 hyprctl dispatch workspace +1
gesture swipe right 3 hyprctl dispatch workspace -1
gesture swipe up 3 hyprctl dispatch togglespecialworkspace magic
gesture swipe down 3 hyprctl dispatch togglespecialworkspace magic

# 4-finger window management
gesture swipe up 4 hyprctl dispatch fullscreen 0
gesture swipe down 4 hyprctl dispatch togglefloating

# Pinch for volume
gesture pinch in 2 hyprctl dispatch exec "wpctl set-volume @DEFAULT_AUDIO_SINK@ 5%-"
gesture pinch out 2 hyprctl dispatch exec "wpctl set-volume @DEFAULT_AUDIO_SINK@ 5%+"
```

Enable the service:

```bash:terminal
systemctl --user enable --now libinput-gestures
```

## The Sleep Problem

Everything worked until I put my computer to sleep. After waking, gestures stopped
working. The trackpad moved the cursor, but swipes did nothing.

The gestures service loses its connection to the input device after sleep. The fix is a
[systemd sleep hook](https://wiki.archlinux.org/title/Power_management#Sleep_hooks) that
restarts the service on wake.

Create a script in `/usr/lib/systemd/system-sleep/` that looks like this:

```bash
#!/bin/bash
case "$1" in
    post)
        sleep 2
        /usr/bin/runuser -u YOUR_USERNAME -- systemctl --user restart libinput-gestures
        ;;
esac
```

> Bash syntax will always look broken to me.

The `post` case runs after the system wakes. The short sleep gives the Bluetooth
connection time to re-establish before restarting the gestures service. Make the script
executable and gestures will automatically restart after every wake.

## Dialing It In

One of the best parts of Apple products is that they come finely tuned. You don't have to
learn about settings. Linux is for the people who want to learn about settings.

The trackpad didn't feel great out of the box. I had to dial in my scroll speed in Firefox
and tweak general scroll settings to match my preferences. This is normal for Linux, and
honestly part of why I use it.

This whole journey also led me to replace HyprPanel with a Quickshell bar. I don't want to
go full Quickshell yet, but the bar is already way better. It's lighter weight and doesn't
need to restart to accept new themes. More on that later.

## Summary

1. Pair with `bluetoothctl` - the GUI doesn't create bonded connections
2. Install `libinput-gestures` and add yourself to the `input` group
3. Configure gestures for your window manager
4. Add a sleep hook to fix post-wake issues

The Magic Trackpad is genuinely nice hardware, and once configured, it works great on
Linux. My [dotfiles](https://github.com/StephenGunn/dotfiles) have the full gesture config
if you want to see it.
