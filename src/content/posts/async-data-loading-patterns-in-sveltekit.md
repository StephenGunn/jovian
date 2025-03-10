---
title: Async data loading patterns in SvelteKit
description: Avoid these common pitfalls in while data loading in SvelteKit
date: "2025-4-16"
categories:
  - sveltekit
  - svelte
  - typescript
published: false
---

## Quick Intro

I wanted to write this article since I believe async data loading is tricky. People that
are new to javascript, the event loop, sveltekit, third party APIs, etc might not
understand these topics.

I also wanted to dig into the topic to brush up on it and make sure I am doing it
correctly too. I also wanted to write about how to apply these techniques to SvelteKit.

## Common Pitfals of Async

One of the common mistakes I see made when people are loading data from multiple sources
in a single route is to await each response in a linear fashion.

I will present a pattern that I've seen, sans any error checking or extra logic:

```typescript
const load = () => {
  const response_1 = await fetch("external_api_1"); // 2 seconds to respond
  const data_1 = await response_1.json();
  const response_2 = await fetch("external_api_2"); // 2 seconds to respond
  const data_2 = await response_2.json();

  // 4 seconds before we get our data
  return {
    data1,
    data2
  };
};
```

This is a very obvious and contrived example but I have seen it. And I've written it
before. Sometimes you just want to get some data and you don't care about optimizations...
but in this article we care.

But if you're newer to javascript you might not understand that every time you use the
`await` keyword, your execution will sit and wait for the promise to resolve.

Ok, so what happens if we don't use the `await` keyword? What if we use .then()?

## Let's visualize the waterfall
