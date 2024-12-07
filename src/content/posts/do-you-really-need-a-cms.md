---
title: Do you really need a CMS?
description: "A CMS is a powerful tool, but it's not always the right tool for the job."
date: "2024-11-19"
categories:
  - webdev
  - commentary
published: true
bluesky_thread_id: "3lcqpodr44s2d"
---

> “If you wish to make an apple pie from scratch, you must first invent the universe.”  
> — _Carl Sagan (Cosmos, 1980)_

If you'd prefer to skip my personal history with content management systems, feel free to
jump to [How to tell you need a CMS](#how-to-tell-you-need-a-cms).

## My History with Content Management Systems

I've been working with content management systems (CMSs) since the early 2000s. My journey
began with ad-hoc PHP scripts, which evolved into using
[ WordPress ](https://wordpress.org) around 2009. I vividly recall porting a handmade site
into a custom _WordPress_ theme and marveling at how much easier it became to manage
content.

Over the years, I became deeply entrenched in the _WordPress_ ecosystem. I even held a
lifetime license for [ Advanced Custom Fields Pro ](https://www.advancedcustomfields.com/)
before it transitioned to a subscription model. My projects often started with a scaffold
based on the [ Blank Slate ](https://wordpress.org/themes/blankslate/) theme, and I built
things on _WordPress_ that probably had no business being on the platform.

When _WordPress_ embraced **Gutenberg** and **Full Site Editing**, I realized it was time
for me to move on. I explored alternatives, dabbled in [ React ](https://react.dev/) (with
class components at the time), and learned early [ Vue ](https://vuejs.org/) 2. While I
experimented with headless _WordPress_, dealing with the _WordPress_ API—and the added
complexity of blocks—left me frustrated. I just wanted simple, efficient access to data.

## The Rise of Static Site Generators

By 2018, static site generators (SSGs) were gaining momentum. Tools like
[ Jekyll ](https://jekyllrb.com/) and [ Hugo ](https://gohugo.io/) had already been around
for years, but (I hate to admit) their reliance on Ruby and Go deterred me. Around this
time, I started hearing about [ Gatsby ](https://www.gatsbyjs.com/) and
[ Next.js ](https://nextjs.org/), which intrigued me, but my preference for Vue kept me
from diving in.

Although I didn’t experiment with SSGs at first (my focus was still on applications, not
sites), I was increasingly drawn to their promise of simplicity and performance.

## The Role of Modern Application Frameworks

Modern frameworks like [ Next.js ](https://nextjs.org/), [ Nuxt ](https://nuxt.com/), and
[ SvelteKit ](https://svelte.dev) blur the lines between SSGs and full-stack application
frameworks. They offer the flexibility to handle static sites, server-side rendering
(SSR), and client-side interactivity. Here's a quick overview:

- **Next.js**: Based on React, it supports static generation, SSR, and hybrid approaches.
  It's a strong choice for dynamic sites and applications with high interactivity.
- **Nuxt**: A Vue-based framework that mirrors Next.js in functionality. It excels at
  SEO-friendly sites and scales well for dynamic content.
- **SvelteKit**: Built on Svelte, this framework emphasizes simplicity and performance.
  Its compiled nature results in smaller, faster client-side bundles.

These frameworks provide a middle ground: the developer experience of an SSG with the
dynamic capabilities of a CMS. They’re particularly appealing for teams familiar with
modern front-end tools.

You can hook any of these to a CMS via API calls, but the question remains: **Do you need
to, just for content?**

## Page Speed Insights and the Problem of Bloat

Performance has always been a personal goal, but
[ Google’s 2021 update ](https://developers.google.com/search/blog/2020/11/timing-for-page-experience)—introducing
[ Core Web Vitals ](https://web.dev/articles/vitals) as a ranking factor—turned it into a
business priority. The era of bloated websites was hopefully coming to an end.

### Examples of Bloat

I’ve seen countless WordPress sites bogged down by unused libraries, multiple
[ jQuery ](https://jquery.com/) versions, and megabytes of images.
[ SliderRevolution ](https://www.sliderrevolution.com/) was a common offender, adding over
1MB of JavaScript and CSS for basic functionality. Sites like these were losing rankings
and speed, a wake-up call for many developers.

### Tools for a Leaner Web

The movement toward leaner sites gained traction with tools like
[Bundlephobia](https://bundlephobia.com/) and
[You Might Not Need jQuery](http://youmightnotneedjquery.com/), which highlighted
alternatives to heavyweight libraries. On the server side, latency in headless or
decoupled sites also became a focus. Even globally deployed sites can be slow if every
request requires a round trip to the server.

## At the Cost of Complexity?

Modern web development often gets criticized for its complexity, and I believe part of
this stems from tools designed to prevent past mistakes—like loading multiple jQuery
versions on the same page. Ironically, the tools themselves can introduce significant
overhead.

A CMS is one such tool. It’s powerful, but before committing to it, you should ask: **Is
it the right tool for the job?**

## Monolithic vs. Decoupled Architectures

Choosing between a **monolithic** and **decoupled** architecture is a foundational
decision. Here’s a breakdown:

### Monolithic CMSs

These tightly couple the front end with the back end. Examples include:

- [WordPress](https://wordpress.org) – Open-source CMS for websites, blogs, and stores.
- [Drupal](https://www.drupal.org) – Scalable CMS for complex websites.
- [Joomla](https://www.joomla.org) – User-friendly CMS for versatile websites.
- [Magento](https://magento.com) – Open-source e-commerce platform.
- [Ruby on Rails](https://rubyonrails.org)\* – Ruby framework for web apps.
- [Django](https://www.djangoproject.com)\* – Python framework for secure web apps.

\* While not CMSs, these frameworks provide monolithic solutions for web development.

### Headless CMSs

These provide a back end without a front end, allowing you to build your own front-end
experience. Examples include:

- [Directus](https://directus.io) – Open-source data platform and CMS.
- [Strapi](https://strapi.io) – Open-source headless CMS.
- [Contentful](https://www.contentful.com) – Cloud-based headless CMS.
- [Sanity](https://www.sanity.io) – Real-time headless CMS.
- [PocketBase](https://pocketbase.io) – Open-source backend with a CMS.
- [Prismic](https://prismic.io) – Headless CMS for dynamic content.

There are many more options out there and new ones emerging all the time. Some blur the
lines between monolithic and decoupled, offering a mix of both.

### Key Considerations

For mostly static sites, a decoupled approach is often ideal. For dynamic sites, a
monolithic CMS might simplify the development process. But ultimately, **do you really
need a CMS?**

## How to Tell You Need a CMS

Here’s a basic starting point for deciding if a CMS is right for a project:

### Scenarios Where a CMS is Essential

1. **E-commerce Sites**: If you’re building an e-commerce site, you almost certainly need
   a CMS. Solutions like Shopify are purpose-built for this use case and save countless
   hours compared to custom development.
2. **Multi-Platform Applications**: For applications with web and mobile front ends, a
   headless CMS like Directus or even WordPress with a REST API can simplify data
   management.

3. **User-Generated Content**: If your site will host user-generated content, a CMS is
   invaluable for moderation, security, and scalability.

### When Markdown and Static Generators Shine

If your site is mostly static, and the content creators are developers, **Markdown** with
a static site generator is likely the better choice. It’s faster, more flexible, and
avoids CMS-specific lock-in.

If you don't know what Markdown is, it's a lightweight markup language used to format text
for the web in a simple and readable way. It’s popular among developers, writers, and
anyone working with plain text because of its straightforward syntax and compatibility
with many tools and platforms. For an introduction to Markdown and how to use it, check
out [Markdown Guide](https://www.markdownguide.org), which provides tutorials and examples
to help you get started quickly.

## The Case for Markdown

Markdown can integrate into almost anything. This very site is built with Markdown and
SvelteKit, leveraging custom tools like a
[ svelte-component-to-image ](/projects/svelte-component-to-image) library to dynamically
generate Open Graph images. Some of my favorite aspects of working with Markdown include:

- **Efficiency**: Tools like Neovim or VSCode allow you to search and edit content faster
  than most WYSIWYG editors.
- **Version Control**: You can use Git to track every change, making it easy to restore
  previous versions of your files.
- **Future-Proofing**: Markdown files can be rendered by any system, ensuring long-term
  compatibility.

This site is open source and you can see the
[markdown file this post is generated from](https://github.com/StephenGunn/jovian/blob/main/src/content/posts/do-you-really-need-a-cms.md)

## Ecosystems and Lock-In

No ecosystem is immune to change. Even WordPress, with its expansive community and
resources, has faced its share of challenges and left a significant mark. For projects
with unique requirements, building from scratch might be unavoidable. However, frameworks
and CMSs often offer an excellent foundation to build upon.

For those using WordPress, switching platforms is rarely simple. While migration is
possible, it tends to involve substantial effort. WordPress's unique approach to storing
data in its database adds to this complexity. The same holds true for other CMSs, each
with its own data management quirks. Among them, I believe Directus stands out with the
most versatile and effective approach.

Sometimes you should just connect to a database directly. However, in most cases, you'll
end up using some kind of CMS—even if it’s a custom one that you build yourself. Whether
you start with a pre-existing CMS, leverage a framework to streamline development, or go
all-in on creating a completely custom solution, the reality is that you’re almost always
building or adapting tools to manage and structure your data efficiently.

## Conclusion

If I hadn’t built this site with SvelteKit, [ Astro ](https://astro.build) would have been
my second choice. I intentionally avoided using a traditional CMS, prioritizing the
simplicity and flexibility of Markdown alongside automated deployments.

While this approach has a few trade-offs (some features are still missing), it’s been
worth it. For developers like me, who have been building sites for over 20 years, it’s a
dream to work directly with code and tools I love.

If you’ve made it this far, I hope this post has provided food for thought about whether a
CMS is right for your next project.
