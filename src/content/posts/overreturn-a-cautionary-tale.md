---
title: "OverReturn: A Cautionary Tale"
description: "Some easy SvelteKit security tips on how to avoid this common mistake."
date: "2024-11-14"
categories:
  - sveltekit
  - security
published: true
bluesky_thread_id: "3lawvscqsm22y"
---

> "A common mistake that people make when trying to design something completely foolproof
> is to underestimate the ingenuity of complete fools."
>
> — Douglas Adams, _The Hitchhiker's Guide to the Galaxy_

## Introduction

I am writing this post because I made this mistake. I made this error because I was
working quickly on a project that I solo-develop and reused some logic. I also moved a
feature from behind an auth wall to a public page. All of these factors combined helped me
make a mistake that could have been avoided.

**I'll admit, it was a dumb mistake.**

There weren’t serious repercussions. One of my users contacted me about two hours after I
pushed the change, saying they’d received "a weird spammy email."

The email in question was offering to sell my website to her. I knew something was up, but
I didn’t think it could've been due to the change I’d just pushed, since it had only been
live for a few hours with only a few users having used it thus far.

## The Problem

The problem was that I reused some logic that returned too much information from the
server to the client. _User emails were included in the data but not used in the page._
While SvelteKit is Server Side Rendered as HTML for search engines, it also includes data
in JavaScript form when the Single Page Application hydrates and takes over.

My mistake, while still a mistake that I fixed, wasn't a problem when it was behind an
auth check. But as soon as this code became available to the broader internet, bots found
it and used it as an attack vector.

If you're curious, check out the example project and see if you can spot the error before
reading further. The example proejct is available at
[https://overreturn.jovianmoon.io](https://overreturn.jovianmoon.io). The code is
available [on GitHub](https://github.com/StephenGunn/overreturn).

## How It Can Happen

An easy way this can happen is when you’re moving too fast and working with abstractions.
This is how it happened to me. Here’s a simplified example:

```typescript
// +page.server.ts
import type { PageServerLoad } from "./$types";
import { getUsers } from "$lib/users";

export const load: PageServerLoad = async () => {
  return {
    users: getUsers()
  };
};
```

This example probably wouldn’t make it to production since it’s pretty obvious what’s
happening. Here, `getUsers()` just returns an array of fake users, but imagine if it were
a function that queried a database.

In the example project, `getUsers()` simply returns 10 fake users. The data looks like
this:

```typescript
// users.ts
const users = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com"
  }
  // ... 9 more users
] as const;

// Defined as a function to simulate a DB call
export const getUsers = () => users;
```

On the frontend, the data is used like this:

```svelte
<!-- UserList.svelte -->
<ul>
  {#each data.users as user}
    <li>{user.id}: {user.name}</li>
  {/each}
</ul>
```

Even though we're only using the `id` and `name` on the frontend, the `email` data is
still part of the data returned to the browser—or to any bot that might be scanning for
emails.

You can see the problem in the example project by visiting
[https://overreturn.jovianmoon.io](https://overreturn.jovianmoon.io) and viewing the
source. Near the bottom of the source, you’ll see something like:

```typescript
<script>
{
    __sveltekit_16a7zrt = {
        base: new URL(".", location).pathname.slice(0, -1)
    };

    const element = document.currentScript.parentElement;

    const data = [null,{"type":"data","data":{users:[{id:1,name:"John Doe",email:"john.doe@example.com"},{id:2,name:"Jane Smith",email:"jane.smith@example.com"},{id:3,name:"Sam Johnson",email:"sam.johnson@example.com"},{id:4,name:"Emily Brown",email:"emily.brown@example.com"},{id:5,name:"Michael Davis",email:"michael.davis@example.com"},{id:6,name:"Sarah Wilson",email:"sarah.wilson@example.com"},{id:7,name:"David Taylor",email:"david.taylor@example.com"},{id:8,name:"Laura Martinez",email:"laura.martinez@example.com"},{id:9,name:"James Anderson",email:"james.anderson@example.com"},{id:10,name:"Linda Thomas",email:"linda.thomas@example.com"}]},"uses":{}}];

    Promise.all([
        import("./_app/immutable/entry/start.CKZ-3imA.js"),
        import("./_app/immutable/entry/app.CZd0_rbm.js")
    ]).then(([kit, app]) => {
        kit.start(app, element, {
            node_ids: [0, 2],
            data,
            form: null,
            error: null
        });
    });
}
</script>
```

Look at line 9—the `data` variable holds all of the data returned from the `load()`
function, whether it's used or not.

There are bots that constantly scrape the web looking for exposed emails to use as attack
vectors, and those emails stand out clearly in the source code of the example project.

## It Happened FAST

Bots are crawling our sites looking for vulnerabilities all the time. If you’ve ever
looked at your logs, you might’ve seen some of these bots. They’re looking for exposed
data, endpoints, and other vulnerabilities. I see a lot of requests for `wp-admin` and
other classic WordPress vulnerabilities, even though I don’t use WordPress.

In my case, it was only a few hours before a bot found the exposed data and used it to
send spam emails. I was lucky that the user who received the email contacted me, and I was
able to fix the issue quickly.

## Just Be Careful!

Be cognizant of what you’re returning from the server to the client. If you’re not using
data on the client, don’t return it. If you’re returning data that you don’t want to be
public, make sure it’s behind an auth wall. And if you’re moving features from behind an
auth wall to a public page, ensure you’re not returning data that you don’t want exposed.

## Tools to Check Your Site

There are tools that can help you check your site for vulnerabilities or view the site as
a bot would. This can really help when you have tens of thousands of pages like some of my
projects do. These are invaluable to understand and use. Here are a few:

- [BeamUsUp](https://beamusup.com/)
- [Screaming Frog SEO Spider](https://www.screamingfrog.co.uk/seo-spider/)
- [SEO Macroscope](https://nazuke.github.io/SEOMacroscope/)

You’ll have to set up
[custom extractions](https://www.screamingfrog.co.uk/seo-spider/tutorials/web-scraping/)
to identify the data you don’t want exposed.

## Conclusion

I hope this post helps you avoid the mistake I made. It was a simple mistake that could
have been avoided, and I was lucky that the repercussions weren’t worse. Learn from my
experience and keep your projects secure.
