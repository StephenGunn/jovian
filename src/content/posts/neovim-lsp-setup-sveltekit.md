---
title: How I Set Up My Neovim for SvelteKit
description: My LSP config setup for SvelteKit in 2024 using Neovim
date: "2024-11-13"
categories:
  - sveltekit
  - neovim
  - lua
published: true
---

## Svelte and Neovim

If you’re a Neovim user who has worked on SvelteKit projects over the past few years,
you’ve likely encountered the issue where `.svelte` files wouldn’t automatically update
types from `load()` functions in `.ts` files.

There were various solutions available, but I believe these have mostly become obsolete
and likely won’t work anymore. I ran into this issue myself when I noticed that the
automatic type safety between my `load()` functions and page `$props()` was no longer
working.

As always, my [dot files are open source](https://github.com/StephenGunn/dotfiles), so
feel free to browse the setup there if you need additional context. If you’re facing the
same issue, here’s how I fixed it.

I was using something like this:

```lua
local on_attach = function(client, bufnr)
  if client.name == "svelte" then
    vim.api.nvim_create_autocmd("BufWritePost", {
      pattern = { "*.js", "*.ts" },
      group = vim.api.nvim_create_augroup("svelte_ondidchangetsorjsfile", { clear = true }),
      callback = function(ctx)
        client.notify("$/onDidChangeTsOrJsFile", { uri = ctx.match })
      end,
    })
  end
end
```

But with the latest versions of Neovim and the LSP, this no longer works. I had to find a
new solution.

## LSP Setup

I’m using the Lazy package manager and Mason-lspconfig to manage my LSP setup, so your
results may vary depending on your configuration.

Here’s my complete Svelte LSP configuration:

```lua
local svelte_lsp_capabilities = vim.tbl_deep_extend("force", {}, capabilities)
svelte_lsp_capabilities.workspace = { didChangeWatchedFiles = false }
lspconfig.svelte.setup({
  capabilities = svelte_lsp_capabilities,
  filetypes = { "svelte" },
})
```

This code alone may not work unless you’re familiar enough with your Neovim config and
plugin manager to know how to apply it. You can view the entire LSP config file
[here](https://github.com/StephenGunn/dotfiles/blob/main/.config/nvim/lua/plugins/lsp-config.lua)
for additional context.

I hope this helps someone, as there wasn’t much documentation available when I figured
this out.
