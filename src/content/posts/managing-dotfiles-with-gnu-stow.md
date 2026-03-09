---
title: Managing Dotfiles with GNU Stow
description:
  A simple single-package approach to dotfiles management with GNU Stow, plus a rofi menu
  for quick access
date: "2026-3-9"
categories:
  - linux
  - dotfiles
  - stow
  - arch
published: true
bluesky_thread_id: "3mgn4i6ofis2g"
---

## Why Manage Dotfiles?

Linux configuration lives in dotfiles - text files scattered across `~/.config/`, your
home directory, and elsewhere. Over time, you accumulate customizations: shell aliases,
editor settings, window manager keybindings, terminal themes.

The problem is remembering what you changed and where. Setting up a new machine means
manually copying files, and there's no history of what you tweaked last month.

I keep my dotfiles in a git repo and use GNU Stow to symlink them into place. This gives
me version control, a single source of truth, and one command to deploy everything.

## What is GNU Stow?

Stow is a symlink farm manager. That sounds complicated, but the core idea is simple:
**your dotfiles repo mirrors your home directory structure, and stow creates symlinks to
make it work.**

When I first started, I followed tutorials that organized stow into multiple "packages" -
one for nvim, one for fish, one for tmux. You'd run `stow nvim`, `stow fish`, etc. After a
few years of using stow, I've settled on a simpler approach: the entire dotfiles directory
is a single package. Combined with a relink script, it handles everything.

## The Single-Package Setup

My dotfiles repo is laid out exactly like my home directory:

```
~/dotfiles/
├── .config/
│   ├── fish/
│   ├── nvim/
│   ├── hypr/
│   └── ...
├── .ssh/
├── .gitconfig
└── ...
```

To link everything, I run one command:

```bash
stow -t ~ .
```

That's it. This says: "Take the current directory (`.`) and symlink its contents into home
(`~`)."

The result:

```
~/.config/nvim → ~/dotfiles/.config/nvim
~/.gitconfig → ~/dotfiles/.gitconfig
~/.ssh → ~/dotfiles/.ssh
```

## Tree Folding

Stow is smart about how it creates symlinks. If `~/.config/fish/` doesn't exist yet, stow
symlinks the entire directory:

```
~/.config/fish → ~/dotfiles/.config/fish
```

But if `~/.config/` already has other stuff in it (from programs you haven't added to your
dotfiles), stow will symlink individual files instead. This is called "tree folding" and
it happens automatically.

## My link.sh Script

Running raw `stow` commands works, but I've wrapped it in a
[link.sh](https://github.com/StephenGunn/dotfiles/blob/main/link.sh) script that handles
edge cases:

```bash:link.sh
#!/bin/bash

DOTFILES_DIR="$HOME/dotfiles"
cd "$DOTFILES_DIR" || exit 1

# Check for conflicts first
stow --simulate --restow -t ~ .

# If no conflicts, actually link
stow --restow -t ~ .
```

The full script does more:

- **Removes auto-generated configs** - Some programs create default configs on first run.
  My script removes known offenders (like Hyprland's default config) before stowing.
- **Dry-run conflict detection** - Before making any changes, it checks for conflicts and
  warns you.
- **Uses `--restow`** - This safely replaces existing symlinks without removing them
  first.
- **Fixes SSH permissions** - SSH requires specific permissions (700 for `.ssh/`, 600 for
  files inside).
- **Reloads active configs** - If tmux or Hyprland is running, it reloads their configs
  automatically.

## Quick Access with Rofi

I have a rofi menu bound to `Super + D` that gives me quick access to dotfiles operations:

```bash:dotfiles-workspace.sh
options=(
    "📂 Open Dotfiles Terminal"
    "🔗 Run link.sh (re-link dotfiles)"
    "💾 Backup Systemd Services"
    "♻️  Restore Systemd Services"
    # ... more options
)

choice=$(printf '%s\n' "${options[@]}" | rofi -dmenu -i -p "Dotfiles")
```

This opens a special workspace with my dotfiles directory, runs the link script, or
handles other maintenance tasks. All with desktop notifications for feedback.

## Shell Alias

For quick terminal access, I have a fish alias:

```fish:aliases.fish
alias link_dots="bash ~/dotfiles/link.sh"
```

So from anywhere, I can just run `link_dots` to re-link everything after making changes.

## Why This Approach?

The single-package approach has a few advantages:

1. **One command** - No remembering which packages to stow
2. **Mirror structure** - The repo looks exactly like your home directory
3. **Less mental overhead** - No "which package has this config?" questions
4. **Easy to reason about** - If it's in `~/dotfiles/.config/foo/`, it ends up at
   `~/.config/foo/`

The link script and rofi menu are optional conveniences, but they make the day-to-day
experience smoother. Edit a config, hit `Super + D`, select "re-link", done.

## Getting Started

If you want to try this approach:

```bash
# Create dotfiles directory
mkdir ~/dotfiles && cd ~/dotfiles
git init

# Move a config into the repo (preserving structure)
mkdir -p .config
mv ~/.config/nvim .config/

# Link it back
stow -t ~ .

# Verify
ls -la ~/.config/nvim  # Should show symlink to ~/dotfiles/.config/nvim
```

As always, my [dotfiles are open source](https://github.com/StephenGunn/dotfiles) if you
want to see the full setup.
