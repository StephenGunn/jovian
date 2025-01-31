---
title: Directus TypeForge
description:
  Directus TypeForge generates TypeScript definitions for Directus collections from an
  OpenAPI schema or a live Directus server.
date: "2024-12-28"
categories:
  - devtools
  - openAPI
  - typescript
  - directus
  - open source
published: true
project_status: "Live"
repo_url: "https://github.com/StephenGunn/sveltecheck.nvim"
---

<script lang="ts">
    import MediaPlayer from '$lib/layout/MediaPlayer.svelte';
    import ProjectLinks from '$lib/layout/ProjectLinks.svelte';
</script>

<ProjectLinks repo="https://github.com/StephenGunn/directus-typeforge"  />

## Directus TypeForge

**Directus TypeForge** generates TypeScript definitions for Directus collections from an
OpenAPI schema or a live Directus server. It supports both custom and system collections,
providing accurate types for use with the Directus TypeScript SDK.

This tool is a fork and rewrite of
[elierotenberg/directus-typescript-gen](https://github.com/elierotenberg/directus-typescript-gen).

[View project on NPM](https://www.npmjs.com/package/directus-typeforge) |
[View project on GitHub](https://github.com/StephenGunn/directus-typeforge)

<MediaPlayer video="https://github.com/user-attachments/assets/5c1c0292-18d8-41c6-a621-ea1b45fd4099" />

## Features

- **Dynamic Generation:** Get types from a static schema file or an active Directus
  instance.
- **System Collections:** Optionally include Directus system collections.
- **Relationships:** Seamlessly represent collection relationships.
- **Configurable Output:** Set custom root type names and output file paths.

## Caveats

- **System Collections:** System collections are present in the generated types but only
  contain ID fields and custom, user created fields. The IDs are included to make sure the
  system collections are not empty. The SDK should override the system fields with the
  correct types.
- **JSON Repeaters:** JSON repeaters are not supported yet. There is no data describing
  the structure of the repeater in the OpenAPI schema and are tyepd as unknown
