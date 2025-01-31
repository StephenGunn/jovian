---
title: Automating Directus TypeForge with NPM Scripts
description:
  "A guide to automating type generation for Directus using TypeForge and custom NPM
  scripts"
date: "2025-01-31"
categories:
  - webdev
  - typescript
  - directus
bluesky_thread_id: "3lh2w7vya7k2t"
published: true
---

<script lang="ts">
    import MediaPlayer from '$lib/layout/MediaPlayer.svelte';
</script>

[Directus TypeForge](/projects/directus-typeforge) generates TypeScript definitions from
your Directus collections, making it easier to work with typed data in your TypeScript
projects. It's specifically designed to work with the Directus SDK, providing proper type
inference for all Directus field types.

## Creating an Automated Type Generation Script

Here's a script that automates type generation with environment variable support and user
prompts:

```javascript:scripts/generate-types.js
import { exec } from 'child_process';
import dotenv from 'dotenv';
import fs from 'fs';
import readline from 'readline';
import ora from 'ora';

// Load environment variables from .env
dotenv.config();
const { ADMIN_EMAIL, ADMIN_PASSWORD, TYPES_DIR, DIRECTUS_URL, OUT_FILE } = process.env;
const targetFile = `${TYPES_DIR}/${OUT_FILE}`;

// Function to prompt the user with a yes/no question
const askQuestion = (query) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
};

// Main function
(async () => {
  // Check if the directory exists
  if (!fs.existsSync(TYPES_DIR)) {
    console.error(`Error: The directory '${TYPES_DIR}' does not exist.`);
    process.exit(1);
  }

  // Check if the target file exists
  if (fs.existsSync(targetFile)) {
    const answer = await askQuestion(
      `The file '${targetFile}' already exists. Do you want to overwrite it? (y/n): `
    );
    if (answer.toLowerCase() !== 'y') {
      console.log('Operation cancelled. No changes were made.');
      process.exit(0);
    }
  }

  // Start the spinner
  const spinner = ora('Generating types...').start();

  // Build the command string
  const command = `npx directus-typeforge --host ${DIRECTUS_URL} --email ${ADMIN_EMAIL} --password ${ADMIN_PASSWORD} --typeName ApiCollections --outFile ${targetFile}`;
  // Execute the command
  exec(command, (error, stdout, stderr) => {
    if (error) {
      spinner.fail(`Error: ${error.message}`);
      return;
    }
    if (stderr) {
      spinner.fail(`stderr: ${stderr}`);
      return;
    }
    console.log(stdout);

    // Stop the spinner and print the success message
    spinner.succeed(`Successfully generated a new type file at '${targetFile}'`);
  });
})();
```

> This was written in JavaScript before Node could run TypeScript files directly

I put this file in a `scripts/` directory that sits in my project root, but you can place
it anywhere you like as long as you adapt your `package.json` script definition.

You will have to install a few things if you haven't already:

```bash
pnpm add -D dotenv ora
```

## Setting Up in Your Project

1. Create a, or add to your `.env` file in your project root:

```env:.env
ADMIN_EMAIL=your-email@example.com
ADMIN_PASSWORD=your-password
TYPES_DIR=src/lib/types/directus
DIRECTUS_URL=https://your-directus-url.com
OUT_FILE=api-collection.ts
```

2. Add the script to your `package.json`:

```json:package.json
{
  "scripts": {
    "types": "node scripts/generate-types.js"
  }
}

```

And if everything is configured correctly, you should be able to run `pnpm types` or
`npm types` from your project root to generate types from your Directus project!

<MediaPlayer video="https://github.com/user-attachments/assets/5c1c0292-18d8-41c6-a621-ea1b45fd4099" />

## Using Generated Types with Directus SDK

The generated types work seamlessly with the Directus SDK. Here's how to set up your
Directus client with proper typing:

```typescript:directus.ts
import type { ApiCollections } from "$lib/types/directus/api-collection";
import { DIRECTUS_URL } from "$env/static/private";
import { createDirectus, rest, staticToken } from "@directus/sdk";

/**
 * Creates a new Directus client instance with REST configuration.
 * @returns Directus client instance.
 */
export const init_directus = () => {
  return createDirectus<ApiCollections>(DIRECTUS_URL).with(rest());
};
```

## Understanding Type Resolution

TypeForge generates types that align with Directus SDK's type system. Here's how different
field types are handled:

- Most fields map to TypeScript primitives (`string`, `number`, `boolean`)
- Special field types use literal types for SDK features:
  - `'csv'` fields resolve to `string[]`
  - `'datetime'` fields resolve to `string`
  - `'json'` fields resolve to `JsonValue`

Example of working with the generated types:

```typescript
async function getCollection() {
  const client = init_directus();
  return await client.request(
    readItems("collection_name", {
      fields: ["id", "title", "tags"]
    })
  );
}

// Type resolves to { id: number; title: string; tags: string[] }
type GeneratedType = Awaited<ReturnType<typeof getCollection>>;
```

This script allows you to keep your TypeScript definitions in sync with your Directus
schema while maintaining proper type inference through the SDK.

If you need to use specific or subtypes from the generated types, you can do something
like this:

```typescript
import type { Event } from "$queries/get_event";

type Schedule = Event["scheduled_items"];
type Props = {
  schedule: Schedule;
};

let { schedule }: Props = $props();
```

This is how I handle props in my SvelteKit components.

I hope this helps someone in the future!
