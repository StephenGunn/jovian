---
title: Copy a string to the system clipboard in Svelte
description: Make a button that copies a string to the system clipboard in Svelte.
date: "2024-11-11"
categories:
  - svelte
  - typescript
published: true
bluesky_thread_id: "3lcqpuzlm3k2k"
---

<script lang="ts">
    import CopyToClipboard from '$lib/components/blog/CopyClipboardExample.svelte';
</script>

## Introduction

In this post, we will create a button that copies a string or number to the system
clipboard in Svelte. We will use the `navigator.clipboard.writeText` method to copy the
value to the clipboard.

## Prerequisites

The data we want to copy needs to be available as a string inside the Svelte component
from which we want to copy it. In this example, we will use a string stored in a variable
called `textToCopy`.

You could also use a string stored in a store, passed as a prop, or returned from a
function.

## Example & Demo

<CopyToClipboard />

## The Basics of the Function

`navigator.clipboard.writeText` is an asynchronous method that returns a promise. It must
be called inside an `async` function. The method takes a **string** as an argument. If you
need to copy a number or any other data type, convert it to a string first for safety;
however, if you don't, JavaScript will implicitly convert it. The promise will resolve to
`undefined` if the copy operation is successful.

Using a `try...catch` block, we can handle the promise and log an error if the copy
operation is unsuccessful.

## Implementation

Here is a very basic Svelte component that implements the `navigator.clipboard.writeText`
method with basic error handling.

```svelte:CopyToClipboard.svelte

<script lang="ts">
  const textToCopy = "This is text that will be copied to the clipboard.";

  async function copyText() {
    try {
      await navigator.clipboard.writeText(textToCopy);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  }
</script>

<button onclick={copyText}>Click to copy</button>

```

This is almost vanilla JavaScript and meant as a starting point. You could easily enhance
this component by adding props or scoped styles.

## Conclusion

You can see how easy it would be to set up this component to accept a prop or fetch a
value from a store. This is a very basic example, but it should provide a good starting
point for copying text to the clipboard in Svelte.
