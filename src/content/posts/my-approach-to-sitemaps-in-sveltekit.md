---
title: My approach to sitemaps in SvelteKit
description:
  How I programmatically generate sitemaps in SvelteKit using a server endpoint.
date: "2024-11-9"
categories:
  - sveltekit
  - typescript
  - backend
published: true
---

## It's a Good Idea to Have a sitemap.xml

Sitemaps aren't hard to make with the tools available in SvelteKit. They are just a list
of URLs that you want search engines to index. They are important because they help search
engines find all of the pages on your site. If you have a small site, you might not need
one. But if you have a large site, or a site with a lot of media, you should have one.

[Here is a link to my sitemap.xml](/sitemap.xml) for this site.

## The Reason Behind This Post

I've spent about two weeks total developing this site in two phases. The first phase
involved building the flying ship system for the homepage as an exercise to learn Svelte 5
and testing how well [mdsvex](https://github.com/pngwn/MDsveX) integrated with the Svelte
5 beta. The second phase was turning it into a full website. I needed a new website, and I
wanted to use markdown more extensively.

I was tempted to use [Astro](https://astro.build) since markdown is a first-class citizen
there, but I decided to stay with [SvelteKit](https://svelte.dev) to learn more about how
it interacts with markdown. I've been building with [Svelte](https://svelte.dev) and
SvelteKit for a few years and even had a few projects that used
[Sapper](https://sapper.svelte.dev). So I was very familiar with the ecosystem, but not
its interaction with markdown.

As I finish up this site, I can say that I am happy with the result. Svelte 5 recently hit
its official release, and everything is stable. One of the finishing touches is to add a
sitemap.xml. I've done this for numerous sites but have never shared my process outside of
a few Reddit comments on [r/sveltejs](https://www.reddit.com/r/sveltejs/)—so here is how I
do it.

## What Google Says About Sitemaps

**You might need a sitemap if:**

- **Your site is large.** Generally, on large sites, it's more difficult to ensure that
  every page is linked by at least one other page on the site. As a result, it's more
  likely that Googlebot might not discover some of your new pages.
- **Your site is new and has few external links to it.** Googlebot and other web crawlers
  navigate the web by following links from one page to another. If no other sites link to
  your pages, Googlebot might not discover them.
- **Your site has a lot of rich media content (video, images) or is shown in Google
  News.** Google can take additional information from sitemaps into account for Search.

**You might not need a sitemap if:**

- **Your site is "small".** By "small," Google refers to sites with about 500 pages or
  fewer. Only pages that need to appear in search results count toward this total.
- **Your site is comprehensively linked internally.** This means Googlebot can find all
  the important pages on your site by following links starting from the homepage.
- **You don't have many media files (video, image) or news pages that you want to show in
  search results.** Sitemaps can help Google find and understand video and image files, or
  news articles, on your site. If you don't need these types of results to appear in
  Search, you might not need a sitemap.

[Source: Read about what Google says about sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview)

I think it's still a good idea to have a sitemap even though this site fits Google's
latter criteria.

## Where You Define Your Structure Is Important

The base level navigation for this site is simple. There are only 5 links on the menu, so
I can hardcode the links and their counterparts in the sitemap. On more complex sites, I
always define my site structure in data and then generate the navigation and sitemaps from
a single source. This allows for things like having separate components for desktop
navigation vs. mobile navigation.

This would also be the same if you were using a CMS. You would define your site structure
in the CMS and then generate the navigation and sitemap from that data. But I usually
don't want to involve any latency for something like retrieving layout data, so I almost
always hardcode it. You also have the benefit of having version control on your site
structure.

A dummy example of how I would define my site structure in data is below:

```typescript
type Page = {
  title: string;
  href: string;
  children: Page[];
};

export const pages: Page[] = [
  {
    title: "Home",
    href: "/",
    children: []
  },
  {
    title: "About",
    href: "/about",
    children: []
  },
  {
    title: "Services",
    href: "/services",
    children: [
      {
        title: "Service 1",
        href: "/services/service-1",
        children: []
      },
      {
        title: "Service 2",
        href: "/services/service-2",
        children: []
      }
    ]
  },
  {
    title: "Contact",
    href: "/contact",
    children: []
  }
];
```

You can see it would be easy to iterate over this data to generate XML or markup for a
navigation component. Also, if you change the data in one place, it changes everywhere.
You can probably see where I am going with this.

## The Basics of Returning XML in SvelteKit

First, we need to create a server endpoint by creating a file:
`src/routes/sitemap.xml/+server.ts`. This will result in a route on our site that is
`/sitemap.xml`. We will need to set the endpoint up to return XML. We can start with this
very simple example to test:

```typescript:sitemap.xml/+server.ts
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = ({ setHeaders }) => {
  let xml = `<?xml version="1.0" encoding="UTF-8"?><test>hello</test>`;
  setHeaders({ "Content-Type": "application/xml" });
  return new Response(xml);
};
```

The key here is to set the `Content-Type` header to `application/xml` to ensure the
correct content type is returned. This should give you a general idea of what is going to
happen. We're going to generate a string of XML and return it as a response.

Another important part is that the `<?xml version="1.0" encoding="UTF-8"?>` must be on the
very first line returned. This is important because the XML declaration must be the first
thing in the document. If you don't include it, the XML will be invalid.

There are tools that allow you to generate XML from objects like
[xml-js](https://github.com/nashwaan/xml-js), but I find it easier to just work with
strings.

## The Basic Structure of a Sitemap's XML

```xml:sitemap.xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2024-11-09</lastmod>
  </url>
  <url>
    <loc>https://example.com/blog/</loc>
    <lastmod>2024-11-01</lastmod>
  </url>
  <url>
    <loc>https://example.com/about/</loc>
    <lastmod>2024-10-15</lastmod>
  </url>
</urlset>
```

If you've worked with sitemaps before, you might notice that I have omitted the
`<priority>` and `<changefreq>` tags. I have read that these tags are ignored by modern
search engines, but you should do your own research on this and decide if you want to
include them or not.

Before we get to the fun stuff, here is how my sitemap endpoint looks before I start
adding the dynamic content:

```typescript:sitemap.xml/+server.ts
import { dev } from "$app/environment";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = ({ setHeaders }) => {
  const site = "https://jovianmoon.io/";

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${site}</loc>
    <lastmod>2024-11-09</lastmod>
  </url>
  <url>
    <loc>${site}/posts</loc>
    <lastmod>2024-11-01</lastmod>
  </url>
  <url>
    <loc>${site}/projects</loc>
    <lastmod>2024-11-01</lastmod>
  </url>
  <url>
    <loc>${site}/about</loc>
    <lastmod>2024-11-01</lastmod>
  </url>
  <url>
    <loc>${site}/contact</loc>
    <lastmod>2024-11-01</lastmod>
  </url>
</urlset>
`;
  setHeaders({ "Content-Type": "application/xml" });

  // only cache in production - 1 hour
  if (!dev) {
    setHeaders({ "Cache-Control": "s-maxage=3600, stale-while-revalidate" });
  }

  return new Response(xml);
};
```

I'll reiterate: I hardcoded these links because I only have 5 pages. If you have more than
that, I recommend defining your site structure in a data format and generating the sitemap
dynamically from that data, as we do in the next step.

## Adding Dynamic Data

Now that we have the basic structure of the sitemap, we can start adding dynamic data. I
already have API endpoints available for my posts and projects that I use to populate the
indexes for those pages. I can use those same endpoints to populate the sitemap.

I work directly inside of the string using template literals. You could also concatenate
the strings if you prefer. Here is my finished `sitemap.xml` for this site.

```typescript:sitemap.xml/+server.ts
import type { Post, Project } from "$lib/types/schema";
import type { RequestHandler } from "./$types";
import { dev } from "$app/environment";
import { error } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ fetch, setHeaders }) => {
  const site = "https://jovianmoon.io/";

  const posts: Post[] = await (await fetch("/api/posts")).json();
  const projects: Project[] = await (await fetch("/api/posts")).json();

  if (!posts || !projects) {
    error(500, "Failed to generate the sitemap.");
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${site}</loc>
    <lastmod>2024-11-09</lastmod>
  </url>
  <url>
    <loc>${site}/posts</loc>
    <lastmod>2024-11-01</lastmod>
  </url>
  <url>
    <loc>${site}/projects</loc>
    <lastmod>2024-11-01</lastmod>
  </url>
  <url>
    <loc>${site}/about</loc>
    <lastmod>2024-11-01</lastmod>
  </url>
  <url>
    <loc>${site}/contact</loc>
    <lastmod>2024-11-01</lastmod>
  </url>
  ${posts
      .map(
        (post) => `
  <url>
    <loc>${site}/posts/${post.slug}</loc>
    <lastmod>${post.updated ?? post.date}</lastmod>
  </url>`
      )
      .join("")}
  ${projects
      .map(
        (project) => `
  <url>
    <loc>${site}/projects/${project.slug}</loc>
    <lastmod>${project.updated ?? project.date}</lastmod>
  </url>`
      )
      .join("")}
</urlset>
`;
  setHeaders({ "Content-Type": "application/xml" });

  // only cache in production - 1 hour
  if (!dev) {
    setHeaders({ "Cache-Control": "s-maxage=3600, stale-while-revalidate" });
  }

  return new Response(xml);
};
```

I'll admit the code looks a little wonky, but that's just the default way that Prettier
handles the formatting. I could have used a `prettier-ignore` comment, but I don't like to
do that. I've given up my fight with Prettier and just let it do its thing.

I use a combination of `.map` and `.join` to generate the XML for each post and project. I
also check for an `updated` date and use that if it exists; otherwise, I use the `date`
field. This is because I have a field for `updated` on my posts and projects that I use to
show the last time the content was updated.

## More Advanced Sitemaps

This is a very basic example of a sitemap. Sitemaps have their limitations, and you will
want to make sure you understand them and how they work. For example, you can only have
50,000 URLs in a sitemap, and it can only be 50MB. If you have more than that, you will
need to split your sitemap into multiple files.

If you split your sitemap into multiple files, you will need to create a sitemap index
file that links to all of the sitemaps. This is a little more advanced, and I won't cover
it here, but you can find more information on the
[sitemap protocol](https://www.sitemaps.org/protocol.html).

Some other good documentation to read is the
[Google Search Central documentation](https://developers.google.com/search/docs/advanced/sitemaps/build-sitemap)
on building sitemaps. They have a lot of good information on how to build sitemaps that
are optimized for search engines.

## Conclusion

You probably need a sitemap. There are a lot of ways to generate them, but I like to do it
this way. I like to have a bit more control over it, and I like to understand how it
works.

### Here are some resources:

- [Sitemap Protocol](https://www.sitemaps.org/protocol.html)
- [Google Search Central documentation](https://developers.google.com/search/docs/advanced/sitemaps/build-sitemap)
- [SvelteKit Sitemap Generator for Static Sites](https://github.com/bartholomej/svelte-sitemap)
